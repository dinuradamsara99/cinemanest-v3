import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity";
import { rateLimit, createRateLimitResponse, addRateLimitHeaders, RateLimitPresets } from "@/lib/rate-limiter";
import { sanitizeInput, createSafeErrorResponse, logger } from "@/lib/security";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        // ====================================================================
        // 1. RATE LIMITING
        // ====================================================================
        const rateLimitResult = await rateLimit(request, RateLimitPresets.READ);

        if (!rateLimitResult.success) {
            logger.warn('Movie API rate limit exceeded', {
                ip: request.headers.get('x-forwarded-for') || 'unknown',
            });
            return createRateLimitResponse(rateLimitResult);
        }

        // ====================================================================
        // 2. VALIDATE INPUT
        // ====================================================================
        const params = await context.params;
        const rawSlug = params.slug;

        // Sanitize and validate slug
        const slug = sanitizeInput(rawSlug);

        if (!slug || slug.length > 200) {
            return NextResponse.json(
                { error: "Invalid movie identifier" },
                { status: 400 }
            );
        }

        logger.debug('Movie API request', { slug });

        // ====================================================================
        // 3. FETCH MOVIE DATA
        // ====================================================================
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

        if (!movie) {
            logger.debug('Movie not found', { slug });
            return NextResponse.json(
                { error: "Movie not found" },
                { status: 404 }
            );
        }

        // ====================================================================
        // 4. RETURN WITH RATE LIMIT HEADERS
        // ====================================================================
        const result = {
            _id: movie._id,
            title: movie.title,
            slug: movie.slug,
            posterImage: movie.posterImage,
            rating: movie.rating,
            releaseYear: movie.releaseYear,
            type: movie._type === "tvshow" ? "tv" : "movie",
        };

        const response = NextResponse.json(result);
        return addRateLimitHeaders(response, rateLimitResult);

    } catch (error) {
        logger.error('Movie API error', { error: String(error) });
        return createSafeErrorResponse("Failed to fetch movie", 500);
    }
}
