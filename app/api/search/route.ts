import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/sanity";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");

        if (!query || query.trim().length === 0) {
            return NextResponse.json([]);
        }

        const results = await searchMovies(query.trim());
        return NextResponse.json(results || []);
    } catch (error) {
        console.error("Error searching movies:", error);
        return NextResponse.json(
            { error: "Failed to search movies" },
            { status: 500 }
        );
    }
}
