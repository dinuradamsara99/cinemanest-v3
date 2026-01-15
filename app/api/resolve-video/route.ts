import { NextRequest, NextResponse } from 'next/server';
import { resolveVideoUrl } from '@/lib/video-resolver';

// Cache resolved URLs for 1 hour
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
    try {
        const { embedUrl } = await request.json();

        if (!embedUrl) {
            return NextResponse.json(
                { error: 'embedUrl is required' },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(embedUrl);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Check cache first
        const cached = cache.get(embedUrl);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log('[Video Resolver] Cache hit for:', embedUrl);
            return NextResponse.json({
                success: true,
                cached: true,
                ...cached.data,
            });
        }

        console.log('[Video Resolver] Resolving:', embedUrl);

        // Resolve the video URL
        const resolved = await resolveVideoUrl(embedUrl);

        if (!resolved) {
            return NextResponse.json(
                { error: 'Could not extract video URL', success: false },
                { status: 404 }
            );
        }

        // Cache the result
        cache.set(embedUrl, {
            data: resolved,
            timestamp: Date.now(),
        });

        console.log('[Video Resolver] Resolved:', resolved.url);

        return NextResponse.json({
            success: true,
            cached: false,
            ...resolved,
        });
    } catch (error) {
        console.error('[Video Resolver] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}

// GET method for health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Video Resolver API is running',
        supportedProviders: ['vidfast', 'filemoon', 'streamwish', 'doodstream'],
    });
}
