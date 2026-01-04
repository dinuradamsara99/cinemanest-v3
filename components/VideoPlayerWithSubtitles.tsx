"use client";

import { useRef, useEffect } from "react";
import type { PlayerSubtitle } from "@/lib/subtitleConverter";

interface VideoPlayerWithSubtitlesProps {
    videoUrl: string;
    subtitles?: PlayerSubtitle[];
    title?: string;
}

export function VideoPlayerWithSubtitles({
    videoUrl,
    subtitles = [],
    title = "Video",
}: VideoPlayerWithSubtitlesProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Reset video when URL changes
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [videoUrl]);

    return (
        <div className="relative w-full h-full bg-black">
            <video
                ref={videoRef}
                className="w-full h-full"
                controls
                controlsList="nodownload"
                preload="metadata"
                crossOrigin="anonymous"
                title={title}
            >
                {/* Main video source */}
                <source src={videoUrl} type="video/mp4" />

                {/* Subtitle tracks */}
                {subtitles && subtitles.length > 0 && (
                    <>
                        {subtitles.map((subtitle, index) => (
                            <track
                                key={`subtitle-${index}`}
                                kind={subtitle.kind}
                                src={subtitle.url}
                                srcLang={subtitle.language}
                                label={subtitle.label}
                                default={subtitle.default}
                            />
                        ))}
                    </>
                )}

                {/* Fallback message for browsers that don't support video */}
                <p className="text-zinc-400 p-4">
                    Your browser doesn&apos;t support HTML5 video. Here is a{" "}
                    <a href={videoUrl} className="text-blue-500 underline">
                        link to the video
                    </a>{" "}
                    instead.
                </p>
            </video>

            {/* Optional: Video loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="text-zinc-400 text-sm opacity-0 transition-opacity"
                    id="loading-indicator"
                >
                    Loading video...
                </div>
            </div>
        </div>
    );
}
