import { authOptions } from "@/lib/auth"
import { client } from "@/sanity/lib/client"
import { getServerSession } from "next-auth"
import { RequestListClient, RequestItem } from "./RequestListClient"

async function getUserRequests(userId: string) {
    return await client.fetch<RequestItem[]>(
        `*[_type == "movieRequest" && userId == $userId] | order(_createdAt desc) {
      _id,
      movieName,
      status,
      notes,
      _createdAt
    }`,
        { userId }
    )
}

export async function UserRequestsList() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return (
            <div className="text-center p-4 text-muted-foreground bg-zinc-900/50 rounded-lg border border-zinc-800">
                Please log in to view your requests.
            </div>
        )
    }

    const requests = await getUserRequests(session.user.id)

    const activeCount = requests.filter((r) =>
        ['pending', 'processing'].includes(r.status)
    ).length

    return <RequestListClient requests={requests} activeCount={activeCount} limit={3} />
}