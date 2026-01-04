import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const mediaId = searchParams.get("mediaId");

        if (mediaId) {
            // Get specific media progress
            const progress = await prisma.watchProgress.findUnique({
                where: {
                    userId_mediaId: {
                        userId: user.id,
                        mediaId: mediaId,
                    },
                },
            });

            return NextResponse.json({ progress });
        } else {
            // Get all user progress
            const allProgress = await prisma.watchProgress.findMany({
                where: { userId: user.id },
                orderBy: { lastWatched: "desc" },
            });

            return NextResponse.json({ progress: allProgress });
        }
    } catch (error) {
        console.error("Error fetching watch progress:", error);
        return NextResponse.json(
            { error: "Failed to fetch watch progress" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const { mediaId, mediaType, progress, duration, completed } = body;

        if (!mediaId || !mediaType || progress === undefined || !duration) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Upsert watch progress
        const watchProgress = await prisma.watchProgress.upsert({
            where: {
                userId_mediaId: {
                    userId: user.id,
                    mediaId: mediaId,
                },
            },
            update: {
                progress,
                duration,
                completed: completed || false,
                lastWatched: new Date(),
            },
            create: {
                userId: user.id,
                mediaId,
                mediaType,
                progress,
                duration,
                completed: completed || false,
            },
        });

        return NextResponse.json({ success: true, progress: watchProgress });
    } catch (error) {
        console.error("Error saving watch progress:", error);
        return NextResponse.json(
            { error: "Failed to save watch progress" },
            { status: 500 }
        );
    }
}
