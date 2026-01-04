import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const { question, movieTitle, movieDescription, isTVShow } = await req.json();

        if (!question || !movieTitle) {
            return NextResponse.json(
                { error: "Question and movie title are required" },
                { status: 400 }
            );
        }

        // Initialize Gemini API
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Extract episode mention if present
        const episodeMentionRegex = /@Episode (\d+): ([^@]+?)(?:\s|$)/;
        const mentionMatch = question.match(episodeMentionRegex);

        let episodeContext = "";
        let cleanedQuestion = question;

        if (mentionMatch && isTVShow) {
            const episodeNumber = mentionMatch[1];
            const episodeTitle = mentionMatch[2].trim();
            episodeContext = `\n\nIMPORTANT: The user is asking specifically about Episode ${episodeNumber}: "${episodeTitle}". Focus your answer on this episode only.`;
            // Remove the mention from the question
            cleanedQuestion = question.replace(episodeMentionRegex, "").trim();
        }

        // Create context-aware prompt with strict plain-text instruction
        const systemInstruction = `You are a helpful movie assistant. Answer the user's question about ${isTVShow ? "the TV show" : "the movie"} "${movieTitle}" in Sinhala, but keep proper names in English.${episodeContext}

IMPORTANT RULES:
- Provide the main explanation in Sinhala (සිංහල).
- Keep ALL Actor names, Character names, Director names, and complex technical terms in English (e.g., use "Robert Downey Jr." instead of "රොබට් ඩව්නි ජූනියර්").
- Do NOT use any Markdown formatting (no **, *, #, etc.).
- Keep responses concise (2-4 sentences maximum).
- Write in plain text only.
- If you don't know something, say "මට ඒ ගැන තොරතුරු සොයාගැනීමට අපහසුයි." in Sinhala.`;

        const contextPrompt = movieDescription
            ? `${isTVShow ? "TV Show" : "Movie"} Title: ${movieTitle}\nDescription: ${movieDescription}\n\nUser Question: ${cleanedQuestion}\n\n${systemInstruction}`
            : `${isTVShow ? "TV Show" : "Movie"} Title: ${movieTitle}\n\nUser Question: ${cleanedQuestion}\n\n${systemInstruction}`;

        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ answer: text });
    } catch (error) {
        console.error("AI Insights error:", error);
        return NextResponse.json(
            { error: "Failed to generate insights. Please try again." },
            { status: 500 }
        );
    }
}
