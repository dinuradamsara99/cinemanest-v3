// Example usage in a movie/watch page

import { CommentSection } from "@/components/CommentSection";
import { useState } from "react";

export default function WatchPage() {
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    // Example mock data (replace with real data from your database)
    // Example mock data (replace with real data from your database)
    // const mockComments = [...];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Your video player and movie details here */}

            {/* Comment Section */}
            <CommentSection
                movieId="movie-123"
                onLoginClick={() => setShowAuthDialog(true)}
            />
        </div>
    );
}
