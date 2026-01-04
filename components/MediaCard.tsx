"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { urlFor } from "@/lib/sanity";
import { Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";

interface MediaCardProps {
    id: string;
    title: string;
    slug: string;
    posterImage: any;
    rating?: number;
    releaseYear?: number;
    type: "movie" | "tv";
    watchProgress?: {
        progress: number;
        duration: number;
        completed: boolean;
    };
}

export function MediaCard({
    title,
    slug,
    posterImage,
    rating,
    releaseYear,
    type,
    watchProgress,
}: MediaCardProps) {
    const imageUrl = posterImage?.asset
        ? urlFor(posterImage).width(400).height(600).url()
        : "/placeholder.jpg";

    const progressPercentage = watchProgress
        ? (watchProgress.progress / watchProgress.duration) * 100
        : 0;

    const showContinueWatching = watchProgress && !watchProgress.completed && progressPercentage > 5;

    return (
        <Link href={`/watch/${slug}`} className="group block w-full h-full">
            {/* Card Container */}
            <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 shadow-md  transition-all duration-300 ring-1 ring-white/5">

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
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                    <div className="h-14 w-14 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-black/50 backdrop-blur-sm transform transition-transform group-active:scale-95">
                        <Play className="w-6 h-6 fill-current" />
                    </div>
                </div>

                {/* Rating Badge (Top Right) */}
                {rating && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        <span className="text-xs font-bold text-white tracking-wide">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                )}

                {/* Continue Watching Badge */}
                {showContinueWatching && (
                    <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md border border-red-500/20 rounded-lg px-2.5 py-1 shadow-sm">
                        <span className="text-xs font-semibold text-white tracking-wide">
                            CONTINUE
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
