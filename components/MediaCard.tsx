"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { urlFor } from "@/lib/sanity";
import { Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";
import { SanityImage } from "@/types/sanity";

import { getTMDBPosterPath } from "@/app/actions/tmdb";
import { useEffect, useState } from "react";

interface MediaCardProps {
    id: string;
    title: string;
    slug: string;
    posterImage: SanityImage;
    tmdbId?: number; // Added for TMDB fallback
    tmdbPosterUrl?: string; // Direct URL override (optional)
    rating?: number;
    releaseYear?: number;
    type: "movie" | "tv";
    watchProgress?: {
        progress: number;
        duration: number;
        completed: boolean;
    };
    hideRating?: boolean;
    watchedAt?: string; // Time when watched
    aspectRatio?: string; // Custom aspect ratio (default: 2/3)
}

export function MediaCard({
    title,
    slug,
    posterImage,
    tmdbId,
    tmdbPosterUrl,
    rating,
    releaseYear,
    type,
    watchProgress,
    hideRating = false,
    watchedAt,
    aspectRatio = "3/4",
}: MediaCardProps) {
    const [fetchedPoster, setFetchedPoster] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch if no Sanity poster, no direct override, and we have a TMDB ID
        if (!posterImage?.asset && !tmdbPosterUrl && tmdbId) {
            getTMDBPosterPath(tmdbId, type === 'tv' ? 'tv' : 'movie')
                .then(setFetchedPoster)
                .catch(console.error);
        }
    }, [posterImage, tmdbId, type, tmdbPosterUrl]);

    // Priority: Sanity poster > Direct TMDB URL > Fetched TMDB Poster > Placeholder
    const imageUrl = posterImage?.asset
        ? urlFor(posterImage).width(400).height(600).url()
        : (tmdbPosterUrl || fetchedPoster || "/placeholder.jpg");

    const progressPercentage = watchProgress
        ? (watchProgress.progress / watchProgress.duration) * 100
        : 0;

    const showContinueWatching = watchProgress && !watchProgress.completed && progressPercentage > 5;

    return (
        <Link href={`/watch/${slug}`} className="group block w-full h-full" aria-label={`Watch ${title}`}>
            {/* Card Container */}
            <div
                className="relative w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-md transition-all duration-300 ring-1 ring-white/5"
                style={{ aspectRatio }}
            >

                {/* Poster Image */}
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Dark Gradient Overlay (Always visible at bottom for text contrast if needed, but mainly for hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Play Button Overlay */}
                <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
                    role="button"
                    aria-label={`Play ${title}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            window.location.href = `/watch/${slug}`;
                        }
                    }}
                >
                    <div className="h-14 w-14 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-black/50 backdrop-blur-sm transform transition-transform group-active:scale-95">
                        <Play className="w-6 h-6 fill-current" aria-hidden="true" />
                    </div>
                </div>

                {/* Rating Badge (Top Right) */}
                {rating && !hideRating && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm" aria-label={`Rating: ${rating.toFixed(1)} out of 10`}>
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" aria-hidden="true" />
                        <span className="text-xs font-bold text-white tracking-wide">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                )}

                {/* Time Badge (instead of Continue Watching) */}
                {watchedAt && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 shadow-sm">
                        <span className="text-xs font-semibold text-white tracking-wide">
                            {getTimeAgo(new Date(watchedAt))}
                        </span>
                    </div>
                )}

                {/* Progress Bar */}
                {watchProgress && progressPercentage > 0 && (
                    <ProgressBar progress={progressPercentage} />
                )}
            </div>

            {/* Content Details */}
            <div className="mt-3 space-y-1 px-1">
                <h3 className="font-semibold text-xl text-zinc-100 line-clamp-1 group-hover:text-primary transition-colors duration-200">
                    {title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    {releaseYear && (
                        <span>{releaseYear}</span>
                    )}
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span className="uppercase tracking-wider">{type === "tv" ? "TV Series" : "Movie"}</span>
                </div>
            </div>
        </Link>
    );
}

function getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
}
