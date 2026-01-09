import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/sanity";
import { rateLimit, createRateLimitResponse, addRateLimitHeaders, RateLimitPresets } from "@/lib/rate-limiter";
import { createSafeErrorResponse, logger } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        // ====================================================================
        // RATE LIMITING (Prevent abuse)
        // ====================================================================
        const rateLimitResult = await rateLimit(request, RateLimitPresets.READ);

        if (!rateLimitResult.success) {
            logger.warn('Categories rate limit exceeded', {
                ip: request.headers.get('x-forwarded-for') || 'unknown',
            });
            return createRateLimitResponse(rateLimitResult);
        }

        // ====================================================================
        // FETCH CATEGORIES
        // ====================================================================
        const categories = await getCategories();

        // ====================================================================
        // RETURN WITH RATE LIMIT HEADERS
        // ====================================================================
        const response = NextResponse.json(categories || []);
        return addRateLimitHeaders(response, rateLimitResult);

    } catch (error) {
        logger.error('Categories fetch error', { error: String(error) });
        return createSafeErrorResponse("Failed to fetch categories", 500);
    }
}
