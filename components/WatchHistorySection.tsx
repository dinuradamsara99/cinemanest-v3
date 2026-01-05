"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { MediaCard } from "@/components/MediaCard";
import { MediaCardSkeleton } from "@/components/MediaCardSkeleton";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface WatchProgress {
    id: string;
    mediaId: string;
    mediaType: string;
    progress: number;
    duration: number;
    completed: boolean;
    lastWatched: string;
}

interface WatchHistorySectionProps {
    userId: string;
}

export function WatchHistorySection({ userId }: WatchHistorySectionProps) {
    const [watchHistory, setWatchHistory] = useState<WatchProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [moviesWithProgress, setMoviesWithProgress] = useState<any[]>([]);

    useEffect(() => {
        async function fetchWatchHistory() {
            try {
                const response = await fetch("/api/watch-progress?limit=6");
                if (response.ok) {
                    const data = await response.json();
                    setWatchHistory(data);

                    // Fetch full movie data for each item
                    const moviePromises = data.map(async (item: WatchProgress) => {
                        try {
                            const res = await fetch(`/api/movie/${item.mediaId}`);
                            if (res.ok) {
                                const movieInfo = await res.json();
                                return {
                                    ...movieInfo,
                                    watchProgress: {
                                        progress: item.progress,
                                        duration: item.duration,
                                        progressPercent: (item.progress / item.duration) * 100,
                                    }
                                };
                            }
                        } catch (error) {
                            console.error(`Error fetching movie ${item.mediaId}:`, error);
                        }
                        return null;
                    });

                    const movieResults = await Promise.all(moviePromises);
                    setMoviesWithProgress(movieResults.filter(Boolean));
                }
            } catch (error) {
                console.error("Error fetching watch history:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchWatchHistory();
    }, [userId]);

    if (loading) {
        return (
            <div className="mb-8">
                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full group"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Continue Watching</h3>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-zinc-800/50 border border-zinc-700 opacity-50" />
                            <div className="h-8 w-8 rounded-full bg-zinc-800/50 border border-zinc-700 opacity-50" />
                        </div>
                    </div>

                    <CarouselContent className="-ml-4 pb-4">
                        {[...Array(6)].map((_, i) => (
                            <CarouselItem key={i} className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                                <MediaCardSkeleton aspectRatio="3/2" />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        );
    }

    if (watchHistory.length === 0) {
        return (
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">Continue Watching</h3>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
                    <Play className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400 text-lg">No watch history yet</p>
                    <p className="text-zinc-600 text-sm mt-2">Start watching to see your progress here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full group"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Continue Watching</h3>
                    <div className="flex items-center gap-2">
                        <CarouselPrevious className="static translate-y-0 translate-x-0 h-8 w-8 bg-zinc-800/50 hover:bg-zinc-700 border-zinc-700" />
                        <CarouselNext className="static translate-y-0 translate-x-0 h-8 w-8 bg-zinc-800/50 hover:bg-zinc-700 border-zinc-700" />
                    </div>
                </div>

                <CarouselContent className="-ml-4 pb-4">
                    {moviesWithProgress.map((movie) => (
                        <CarouselItem key={movie._id} className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                            <div className="h-full">
                                <MediaCard
                                    id={movie._id}
                                    title={movie.title}
                                    slug={movie.slug?.current || movie._id}
                                    posterImage={movie.posterImage}
                                    rating={movie.rating}
                                    releaseYear={movie.releaseYear}
                                    type={movie.type || "movie"}
                                    hideRating={true}
                                    watchedAt={movie.watchedAt}
                                    aspectRatio="3/2"
                                    watchProgress={movie.watchProgress ? {
                                        progress: movie.watchProgress.progress,
                                        duration: movie.watchProgress.duration,
                                        completed: false
                                    } : undefined}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}
