import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { client } from "@/sanity/lib/client"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Verify the userId matches the session user
    if (userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Count active requests (pending or processing)
        const count = await client.fetch(
            `count(*[_type == "movieRequest" && userId == $userId && (status == "pending" || status == "processing")])`,
            { userId }
        )

        return NextResponse.json({ count })
    } catch (error) {
        console.error("Failed to fetch active count:", error)
        return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 })
    }
}
