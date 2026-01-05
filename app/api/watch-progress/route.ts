import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");

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
