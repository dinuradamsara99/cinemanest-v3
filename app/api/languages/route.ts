import { NextRequest, NextResponse } from "next/server";
import { getLanguages } from "@/lib/sanity";
import { rateLimit, createRateLimitResponse, addRateLimitHeaders, RateLimitPresets } from "@/lib/rate-limiter";
import { createSafeErrorResponse, logger } from "@/lib/security";

// ISR: Revalidate languages every hour (static data)
export const revalidate = 3600;

export async function GET(request: NextRequest) {
    try {
        // ====================================================================
        // RATE LIMITING (Prevent abuse)
        // ====================================================================
        const rateLimitResult = await rateLimit(request, RateLimitPresets.READ);

        if (!rateLimitResult.success) {
            logger.warn('Languages rate limit exceeded', {
                ip: request.headers.get('x-forwarded-for') || 'unknown',
            });
            return createRateLimitResponse(rateLimitResult);
        }

        // ====================================================================
        // FETCH LANGUAGES
        // ====================================================================
        const languages = await getLanguages();

        // ====================================================================
        // RETURN WITH RATE LIMIT HEADERS
        // ====================================================================
        const response = NextResponse.json(languages || []);
        return addRateLimitHeaders(response, rateLimitResult);

    } catch (error) {
        logger.error('Languages fetch error', { error: String(error) });
        return createSafeErrorResponse("Failed to fetch languages", 500);
    }
}
