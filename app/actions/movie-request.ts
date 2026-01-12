'use server'

import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { client, writeClient } from "@/sanity/lib/client"
import { revalidatePath } from "next/cache"
import { sanitizeInput, sanitizeURL, validateLength, logSecurityEvent, SecurityEventType } from "@/lib/security"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limiter"

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2 || "")

export async function processYoutubeLink(url: string) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Login required", rateLimited: false }
        }

        // Rate limiting - 5 uses per day
        const mockRequest = new Request('http://localhost', {
            headers: { 'x-forwarded-for': 'server-action' }
        })
        const rateLimitResult = await rateLimit(mockRequest, {
            ...RateLimitPresets.REQUEST,  // 5 per 24 hours
            identifier: `yt-ai:${session.user.id}`,
        })

        if (!rateLimitResult.success) {
            return {
                success: false,
                error: "You have reached your daily YouTube AI limit (Limit: 5 times per day). Please try again tomorrow.",
                rateLimited: true
            }
        }

        if (!process.env.YOUTUBE_API_KEY) {
            throw new Error("Missing YouTube API Key")
        }

        // Extract Video ID
        // Extract Video ID (Supports Normal, Shorts, and Mobile app URLs)
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|shorts\/|embed\/))([^&?]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null

        if (!videoId) {
            return { success: false, error: "Invalid YouTube URL" }
        }

        // Fetch Video Details from YouTube API
        const ytResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
        )

        if (!ytResponse.ok) {
            return { success: false, error: "Failed to fetch video details" }
        }

        const ytData = await ytResponse.json()

        if (!ytData.items || ytData.items.length === 0) {
            return { success: false, error: "Video not found" }
        }

        const rawTitle = ytData.items[0].snippet.title

        // Clean Title using Gemini
        const prompt = `Analyze this YouTube title: "${rawTitle}". 
        
1. Extract the official English title and release year.
2. If it is a TV Show, you MUST include the Season number if mentioned in the text.
3. Remove extra words like "Official Trailer", "Teaser", "4K", "Release Date", "Review", "Hashtags", etc.
4. Format: "Title Season X (Year)" or "Title (Year)".
5. Return ONLY the final cleaned string.`

        try {
            // Try with the user's preferred model first
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" })
            const result = await model.generateContent(prompt)
            const response = await result.response
            const cleanTitle = response.text().trim()
            return { success: true, title: cleanTitle }
        } catch (geminiError) {
            console.warn("Gemini 3 Flash Preview failed, falling back to 1.5 Flash:", geminiError)

            try {
                // Fallback to a more stable model
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
                const result = await fallbackModel.generateContent(prompt)
                const response = await result.response
                const cleanTitle = response.text().trim()
                return { success: true, title: cleanTitle }
            } catch (fallbackError) {
                console.error("All Gemini models failed:", fallbackError)
                // Fallback to raw title if AI fails completely
                return { success: true, title: rawTitle }
            }
        }

    } catch (error) {
        console.error("Error processing YouTube link:", error)
        return { success: false, error: "Failed to process link" }
    }
}

export async function checkRequestLimit(userId: string) {
    const query = `count(*[_type == "movieRequest" && userId == $userId && status in ["pending", "processing"]])`
    const count = await client.fetch(query, { userId })
    return count
}

export async function submitRequest(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
            action: 'submitRequest',
            timestamp: new Date().toISOString(),
        })
        return { success: false, error: "Unauthorized" }
    }

    const userId = session.user.id
    const userEmail = session.user.email

    // Check limit
    const activeRequests = await checkRequestLimit(userId)
    if (activeRequests >= 3) {
        return { success: false, error: "You have reached the limit of 3 active requests." }
    }

    const movieName = formData.get("movieName") as string
    const youtubeLink = formData.get("youtubeLink") as string
    const notes = formData.get("notes") as string

    if (!movieName) {
        return { success: false, error: "Movie name is required" }
    }

    // SECURITY: Sanitize all inputs
    const sanitizedMovieName = sanitizeInput(movieName)
    const sanitizedNotes = notes ? sanitizeInput(notes) : ""
    let sanitizedYoutubeLink = ""

    if (youtubeLink) {
        const validatedURL = sanitizeURL(youtubeLink)
        if (validatedURL && (validatedURL.includes('youtube.com') || validatedURL.includes('youtu.be'))) {
            sanitizedYoutubeLink = validatedURL
        } else {
            logSecurityEvent(SecurityEventType.INVALID_INPUT, {
                userId,
                field: 'youtubeLink',
                value: youtubeLink.substring(0, 50),
            })
            return { success: false, error: "Invalid YouTube URL" }
        }
    }

    // Validate input lengths
    if (!validateLength(sanitizedMovieName, 1, 200)) {
        return { success: false, error: "Movie name must be between 1 and 200 characters" }
    }

    if (sanitizedNotes && !validateLength(sanitizedNotes, 0, 1000)) {
        return { success: false, error: "Notes must not exceed 1000 characters" }
    }

    try {
        console.log("Submitting request to Sanity...", { movieName: sanitizedMovieName, userId })

        // Use the configured writeClient which should have the token
        const result = await writeClient.create({
            _type: "movieRequest",
            movieName: sanitizedMovieName,
            youtubeLink: sanitizedYoutubeLink,
            notes: sanitizedNotes,
            userId,
            userEmail,
            status: "pending",
        })

        console.log("Sanity submission result:", result)

        revalidatePath("/account")
        return { success: true, message: "Request submitted successfully!" }

    } catch (error: any) {
        console.error("Submission error details:", {
            message: error.message,
            statusCode: error.statusCode,
            body: error.body,
            stack: error.stack
        })
        return { success: false, error: "Failed to submit request. Please try again." }
    }
}

export async function acknowledgeCompletedRequest(requestId: string) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        return { success: false, error: "Unauthorized" }
    }

    const userId = session.user.id

    try {
        // First, verify the request belongs to the user and is completed
        const request = await client.fetch(
            `*[_type == "movieRequest" && _id == $requestId && userId == $userId][0]`,
            { requestId, userId }
        )

        if (!request) {
            return { success: false, error: "Request not found or unauthorized" }
        }

        if (request.status !== "completed" && request.status !== "rejected") {
            return { success: false, error: "Only completed or rejected requests can be acknowledged" }
        }

        // Delete the request from Sanity
        await writeClient.delete(requestId)

        revalidatePath("/account")
        return { success: true, message: "Request acknowledged and removed successfully!" }

    } catch (error: any) {
        console.error("Acknowledgment error details:", {
            message: error.message,
            statusCode: error.statusCode,
            body: error.body,
            stack: error.stack
        })
        return { success: false, error: `Failed to acknowledge request: ${error.message}` }
    }
}
