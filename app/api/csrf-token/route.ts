import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateCSRFToken } from '@/lib/security';
import { rateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rate-limiter';

/**
 * GET - Generate a CSRF token for the authenticated user
 * This token must be included in the X-CSRF-Token header for all state-changing requests
 */
export async function GET(request: NextRequest) {
    try {
        // Get user session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Rate limit CSRF token generation
        const rateLimitResult = await rateLimit(request, {
            ...RateLimitPresets.READ,
            identifier: session.user.id,
        });

        if (!rateLimitResult.success) {
            return createRateLimitResponse(rateLimitResult);
        }

        // Generate CSRF token tied to user session
        const token = generateCSRFToken(session.user.id);

        return NextResponse.json({ token });
    } catch (error) {
        console.error('CSRF token generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}
