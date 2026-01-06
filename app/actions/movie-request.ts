'use server'

import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { client, writeClient } from "@/sanity/lib/client"
import { revalidatePath } from "next/cache"

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2 || "")

export async function processYoutubeLink(url: string) {
    try {
        if (!process.env.YOUTUBE_API_KEY) {
            throw new Error("Missing YouTube API Key")
        }

        // Extract Video ID
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&?]+)/)
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
        const prompt = `Extract only the official movie or TV show title from this YouTube video title: "${rawTitle}". Remove words like "Official Trailer", "Teaser", "4K", "Release Date", "Review", etc. Return JUST the clean title and year. only english name`

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

    try {
        console.log("Submitting request to Sanity...", { movieName, userId })

        // Use the configured writeClient which should have the token
        const result = await writeClient.create({
            _type: "movieRequest",
            movieName,
            youtubeLink,
            notes,
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
        return { success: false, error: `Failed to submit request: ${error.message}` }
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
