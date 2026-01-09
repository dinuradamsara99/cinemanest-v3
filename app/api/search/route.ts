import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/sanity";
import { rateLimit, createRateLimitResponse, addRateLimitHeaders, RateLimitPresets } from "@/lib/rate-limiter";
import { sanitizeInput, createSafeErrorResponse, logger } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        // ====================================================================
        // 1. RATE LIMITING (Prevent search abuse)
        // ====================================================================
        const rateLimitResult = await rateLimit(request, RateLimitPresets.SEARCH);

        if (!rateLimitResult.success) {
            logger.warn('Search rate limit exceeded', {
                ip: request.headers.get('x-forwarded-for') || 'unknown',
            });
            return createRateLimitResponse(rateLimitResult);
        }

        // ====================================================================
        // 2. VALIDATE AND SANITIZE INPUT
        // ====================================================================
        const searchParams = request.nextUrl.searchParams;
        const rawQuery = searchParams.get("q");

        if (!rawQuery || rawQuery.trim().length === 0) {
            return NextResponse.json([]);
        }

        // Sanitize the search query
        const query = sanitizeInput(rawQuery.trim());

        // Validate query length (min 2, max 100)
        if (query.length < 2) {
            return NextResponse.json([]);
        }

        if (query.length > 100) {
            return NextResponse.json(
                { error: "Search query too long" },
                { status: 400 }
            );
        }

        // ====================================================================
        // 3. EXECUTE SEARCH
        // ====================================================================
        const results = await searchMovies(query);

        // ====================================================================
        // 4. RETURN WITH RATE LIMIT HEADERS
        // ====================================================================
        const response = NextResponse.json(results || []);
        return addRateLimitHeaders(response, rateLimitResult);

    } catch (error) {
        logger.error('Search error', { error: String(error) });
        return createSafeErrorResponse("Failed to search movies", 500);
    }
}
