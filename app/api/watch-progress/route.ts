import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, createRateLimitResponse, RateLimitPresets } from "@/lib/rate-limiter";
import { verifyCSRFFromRequest, clampNumber } from "@/lib/security";

// POST - Save/Update watch progress
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { mediaId, mediaType, progress, duration } = body;

        if (!mediaId || !mediaType || progress === undefined || !duration) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Rate limiting for watch progress updates
        const rateLimitResult = await rateLimit(request, {
            limit: 60, // 60 updates per minute should be enough for video playback
            windowInSeconds: 60,
            identifier: session.user.id,
        });

        if (!rateLimitResult.success) {
            return createRateLimitResponse(rateLimitResult);
        }

        // SECURITY FIX: Verify CSRF token
        const csrfCheck = verifyCSRFFromRequest(request, session.user.id);
        if (!csrfCheck.valid) {
            return csrfCheck.errorResponse;
        }

        // Calculate if video is completed (90% watched)
        const completed = (progress / duration) >= 0.9;

        // Upsert watch progress
        const watchProgress = await prisma.watchProgress.upsert({
            where: {
                userId_mediaId: {
                    userId: session.user.id,
                    mediaId: mediaId,
                },
            },
            update: {
                progress,
                duration,
                completed,
                lastWatched: new Date(),
                mediaType,
            },
            create: {
                userId: session.user.id,
                mediaId,
                mediaType,
                progress,
                duration,
                completed,
            },
        });

        return NextResponse.json(watchProgress);
    } catch (error) {
        console.error("Error saving watch progress:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET - Fetch user's watch history
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // SECURITY FIX: Add rate limiting for GET requests
        const rateLimitResult = await rateLimit(request, {
            ...RateLimitPresets.READ,
            identifier: session.user.id,
        });

        if (!rateLimitResult.success) {
            return createRateLimitResponse(rateLimitResult);
        }

        const { searchParams } = new URL(request.url);
        // SECURITY FIX: Clamp limit to prevent excessive data requests
        const rawLimit = parseInt(searchParams.get("limit") || "10");
        const limit = clampNumber(rawLimit, 1, 50);

        // Fetch watch progress ordered by last watched
        const watchHistory = await prisma.watchProgress.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                lastWatched: "desc",
            },
            take: limit,
        });

        return NextResponse.json(watchHistory);
    } catch (error) {
        console.error("Error fetching watch history:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
