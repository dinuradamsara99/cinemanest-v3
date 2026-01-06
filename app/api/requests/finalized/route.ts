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
        // Fetch completed and rejected requests for the user
        const requests = await client.fetch(
            `*[_type == "movieRequest" && userId == $userId && (status == "completed" || status == "rejected")] | order(_createdAt desc) {
                _id,
                movieName,
                status,
                notes,
                _createdAt
            }`,
            { userId }
        )

        return NextResponse.json(requests)
    } catch (error) {
        console.error("Failed to fetch finalized requests:", error)
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
    }
}
