import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const params = await context.params;
        const slug = params.slug;
        console.log('[Movie API] Fetching movie:', slug);

        // Fetch movie or TV show by slug
        const query = `*[(_type == "movie" || _type == "tvshow") && slug.current == $slug][0] {
            _id,
            _type,
            title,
            slug,
            posterImage {
                asset
            },
            rating,
            releaseYear
        }`;

        const movie = await client.fetch(query, { slug });
        console.log('[Movie API] Query result:', movie);

        if (!movie) {
            console.log('[Movie API] Movie not found');
            return NextResponse.json(
                { error: "Movie not found" },
                { status: 404 }
            );
        }

        const result = {
            _id: movie._id,
            title: movie.title,
            slug: movie.slug,
            posterImage: movie.posterImage,
            rating: movie.rating,
            releaseYear: movie.releaseYear,
            type: movie._type === "tvshow" ? "tv" : "movie",
        };

        console.log('[Movie API] Returning:', result);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[Movie API] Error fetching movie:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
