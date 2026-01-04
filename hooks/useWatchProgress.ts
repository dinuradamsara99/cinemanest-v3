import { useEffect, useState } from "react";

interface WatchProgress {
    id: string;
    mediaId: string;
    mediaType: string;
    progress: number;
    duration: number;
    completed: boolean;
    lastWatched: string;
}

export function useWatchProgress(mediaId?: string) {
    const [progress, setProgress] = useState<WatchProgress | null>(null);
    const [allProgress, setAllProgress] = useState<WatchProgress[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProgress = async (id?: string) => {
        setLoading(true);
        setError(null);

        try {
            const url = id
                ? `/api/watch-progress?mediaId=${id}`
                : `/api/watch-progress`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch progress");
            }

            const data = await response.json();

            if (id) {
                setProgress(data.progress);
            } else {
                setAllProgress(data.progress || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = async (data: {
        mediaId: string;
        mediaType: string;
        progress: number;
        duration: number;
        completed?: boolean;
    }) => {
        try {
            const response = await fetch("/api/watch-progress", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to save progress");
            }

            const result = await response.json();
            setProgress(result.progress);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        }
    };

    useEffect(() => {
        if (mediaId) {
            fetchProgress(mediaId);
        }
    }, [mediaId]);

    return {
        progress,
        allProgress,
        loading,
        error,
        fetchProgress,
        saveProgress,
        refetch: () => fetchProgress(mediaId),
    };
}
