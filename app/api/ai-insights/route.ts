import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit, createRateLimitResponse, RateLimitPresets } from "@/lib/rate-limiter";
import { sanitizeInput, createSafeErrorResponse, logSecurityEvent, SecurityEventType, logger, verifyCSRFFromRequest } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        // ====================================================================
        // 1. AUTHENTICATION CHECK (CRITICAL SECURITY FIX)
        // ====================================================================
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
                endpoint: '/api/ai-insights',
                method: 'POST',
                ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
            });

            return NextResponse.json(
                { error: "Authentication required to use AI insights" },
                { status: 401 }
            );
        }

        // ====================================================================
        // 2. RATE LIMITING (STRICT FOR AI ENDPOINTS)
        // ====================================================================
        const rateLimitResult = await rateLimit(req, {
            ...RateLimitPresets.AI,  // 10 requests per 5 minutes
            identifier: session.user.id,
        });

        if (!rateLimitResult.success) {
            logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
                userId: session.user.id,
                endpoint: '/api/ai-insights',
                limit: rateLimitResult.limit,
            });

            return createRateLimitResponse(rateLimitResult);
        }

        // ====================================================================
        // 3. CSRF VERIFICATION (Prevent cross-site request forgery)
        // ====================================================================
        const csrfCheck = verifyCSRFFromRequest(req, session.user.id);
        if (!csrfCheck.valid) {
            return csrfCheck.errorResponse;
        }

        // ====================================================================
        // 4. PARSE AND VALIDATE INPUT
        // ====================================================================
        const body = await req.json();
        const { question, movieTitle, movieDescription, isTVShow } = body;

        if (!question || !movieTitle) {
            return NextResponse.json(
                { error: "Question and movie title are required" },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const sanitizedQuestion = sanitizeInput(question);
        const sanitizedTitle = sanitizeInput(movieTitle);
        const sanitizedDescription = movieDescription ? sanitizeInput(movieDescription) : '';

        // Validate lengths
        if (sanitizedQuestion.length > 500) {
            return NextResponse.json(
                { error: "Question is too long (max 500 characters)" },
                { status: 400 }
            );
        }

        // ====================================================================
        // 4. INITIALIZE GEMINI API
        // ====================================================================
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            logger.error('Gemini API key not configured');
            return NextResponse.json(
                { error: "AI service not available" },
                { status: 503 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // ====================================================================
        // 5. PROCESS EPISODE MENTIONS (TV Shows)
        // ====================================================================
        const episodeMentionRegex = /@Episode (\d+): ([^@]+?)(?:\s|$)/;
        const mentionMatch = sanitizedQuestion.match(episodeMentionRegex);

        let episodeContext = "";
        let cleanedQuestion = sanitizedQuestion;

        if (mentionMatch && isTVShow) {
            const episodeNumber = mentionMatch[1];
            const episodeTitle = mentionMatch[2].trim();
            episodeContext = `\n\nIMPORTANT: The user is asking specifically about Episode ${episodeNumber}: "${episodeTitle}". Focus your answer on this episode only.`;
            cleanedQuestion = sanitizedQuestion.replace(episodeMentionRegex, "").trim();
        }

        // ====================================================================
        // 6. BUILD PROMPT AND GENERATE RESPONSE
        // ====================================================================
        const systemInstruction = `You are a helpful movie assistant. Answer the user's question about ${isTVShow ? "the TV show" : "the movie"} "${sanitizedTitle}" in Sinhala, but keep proper names in English.${episodeContext}

IMPORTANT RULES:
- Provide the main explanation in Sinhala (සිංහල).
- Keep ALL Actor names, Character names, Director names, and complex technical terms in English (e.g., use "Robert Downey Jr." instead of "රොබට් ඩව්නි ජූනියර්").
- Do NOT use any Markdown formatting (no **, *, #, etc.).
- Keep responses concise (2-4 sentences maximum).
- Write in plain text only.
- If you don't know something, say "මට ඒ ගැන තොරතුරු සොයාගැනීමට අපහසුයි." in Sinhala.`;

        const contextPrompt = sanitizedDescription
            ? `${isTVShow ? "TV Show" : "Movie"} Title: ${sanitizedTitle}\nDescription: ${sanitizedDescription}\n\nUser Question: ${cleanedQuestion}\n\n${systemInstruction}`
            : `${isTVShow ? "TV Show" : "Movie"} Title: ${sanitizedTitle}\n\nUser Question: ${cleanedQuestion}\n\n${systemInstruction}`;

        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        const text = response.text();

        logger.info('AI insight generated', {
            userId: session.user.id,
            movieTitle: sanitizedTitle
        });

        return NextResponse.json({ answer: text });

    } catch (error: unknown) {
        const err = error as { status?: number; message?: string };

        logger.error('AI Insights error', {
            error: err.message || String(error)
        });

        // Check if it's a quota exceeded error
        if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('429')) {
            return NextResponse.json(
                {
                    error: "AI සේවාව දැනට ලබා ගත නොහැක. කරුණාකර පසුව නැවත උත්සාහ කරන්න. (AI service quota exceeded. Please try again later.)",
                    quotaExceeded: true
                },
                { status: 429 }
            );
        }

        // Check for API key issues
        if (err.status === 401 || err.status === 403 || err.message?.includes('API key')) {
            return createSafeErrorResponse(
                "AI සේවාව වින්‍යාසනය කර නැත. (AI service not configured.)",
                503
            );
        }

        // Generic error - don't leak details
        return createSafeErrorResponse(
            "AI සේවාව ක්‍රියා කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න. (Failed to generate insights. Please try again.)",
            500
        );
    }
}
