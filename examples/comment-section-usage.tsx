// Example usage in a movie/watch page

import { CommentSection } from "@/components/CommentSection";
import { useState } from "react";

export default function WatchPage() {
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    // Example mock data (replace with real data from your database)
    const mockComments = [
        {
            id: "1",
            userId: "user1",
            userName: "John Doe",
            userAvatar: "https://i.pravatar.cc/150?img=1",
            content: "This movie was absolutely amazing! The cinematography was breathtaking.",
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            likes: 20,
            dislikes: 1,
            replies: [
                {
                    id: "2",
                    userId: "user2",
                    userName: "Jane Smith",
                    userAvatar: "https://i.pravatar.cc/150?img=2",
                    content: "I completely agree! The director did an excellent job.",
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    likes: 8,
                    dislikes: 0,
                    replies: [],
                },
            ],
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Your video player and movie details here */}

            {/* Comment Section */}
            <CommentSection
                movieId="movie-123"
                initialComments={mockComments}
                onLoginClick={() => setShowAuthDialog(true)}
                onAddComment={(content) => {
                    console.log("New comment:", content);
                    // Save to database
                }}
            />
        </div>
    );
}
