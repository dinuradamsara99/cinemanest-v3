"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

// Interface for subtitles
export interface PlayerSubtitle {
    url: string;
    language: string;
    label: string;
    kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
    default?: boolean;
}

interface VideoPlayerProps {
    videoUrl: string;
    subtitles?: PlayerSubtitle[];
    title?: string;
    poster?: string;
    startTime?: number;
    mediaId?: string;
    mediaType?: string;
}

export function VideoPlayer({
    videoUrl,
    subtitles = [],
    title = "Video",
    poster,
    startTime = 0,
    mediaId,
    mediaType = "movie",
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [buffered, setBuffered] = useState(0);

    // Format time to MM:SS
    const formatTime = (seconds: number) => {
        if (!isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Play/Pause toggle
    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    }, [isPlaying]);

    // Volume control
    const handleVolumeChange = (value: number) => {
        setVolume(value);
        if (videoRef.current) {
            videoRef.current.volume = value;
        }
        if (value === 0) {
            setIsMuted(true);
        } else if (isMuted) {
            setIsMuted(false);
        }
    };

    // Mute toggle
    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    // Seek control
    const handleSeek = (value: number) => {
        setCurrentTime(value);
        if (videoRef.current) {
            videoRef.current.currentTime = value;
        }
    };

    // Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [isFullscreen]);

    // Auto-hide controls
    const resetControlsTimeout = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    // Video event listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handleLoadedData = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleProgress = () => {
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("loadeddata", handleLoadedData);
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("progress", handleProgress);

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("durationchange", handleDurationChange);
            video.removeEventListener("loadeddata", handleLoadedData);
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("progress", handleProgress);
        };
    }, [videoUrl]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Set start time
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (startTime > 0) {
            video.currentTime = startTime;
        }
    }, [startTime, videoUrl]);

    // Watch progress tracking
    useEffect(() => {
        if (!mediaId) return;
        const video = videoRef.current;
        if (!video) return;

        let hasWatchedFor10Seconds = false;

        const saveProgress = async () => {
            if (!video || !mediaId) return;
            const progress = video.currentTime;
            const videoDuration = video.duration;

            if (progress > 0 && videoDuration > 0 && progress >= 10) {
                try {
                    await fetch("/api/watch-progress", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            mediaId,
                            mediaType,
                            progress,
                            duration: videoDuration,
                        }),
                    });
                } catch (error) {
                    console.error("[Watch Progress] Error saving:", error);
                }
            }
        };

        const interval = setInterval(() => {
            if (video.currentTime >= 10 && !hasWatchedFor10Seconds) {
                hasWatchedFor10Seconds = true;
                saveProgress();
            } else if (hasWatchedFor10Seconds) {
                saveProgress();
            }
        }, 10000);

        const handleBeforeUnload = () => saveProgress();
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            clearInterval(interval);
            saveProgress();
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [mediaId, mediaType]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group overflow-hidden"
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
                preload="metadata"
                playsInline
                crossOrigin="anonymous"
                poster={poster}
                onContextMenu={(e) => e.preventDefault()}
            >
                <source src={videoUrl} type="video/mp4" />
                {subtitles.map((subtitle, index) => (
                    <track
                        key={`subtitle-${index}`}
                        kind={subtitle.kind || "subtitles"}
                        src={subtitle.url}
                        srcLang={subtitle.language}
                        label={subtitle.label}
                        default={subtitle.default || index === 0}
                    />
                ))}
            </video>

            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none z-40">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            )}

            {/* Center Play Button */}
            <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-30 ${showControls && !isLoading ? "opacity-100" : "opacity-0"
                    }`}
            >
                <button
                    onClick={togglePlay}
                    className="pointer-events-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all hover:scale-110 flex items-center justify-center shadow-2xl"
                >
                    {isPlaying ? (
                        <Pause className="w-8 h-8 md:w-10 md:h-10 text-white fill-white" />
                    ) : (
                        <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
                    )}
                </button>
            </div>

            {/* Bottom Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-all duration-300 px-3 md:px-6 pb-3 md:pb-4 pt-16 md:pt-20 z-40 ${showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
            >
                {/* Progress Bar */}
                <div className="relative w-full h-1 md:h-1.5 bg-white/20 rounded-full mb-3 md:mb-4 cursor-pointer group/progress">
                    {/* Buffer Bar */}
                    <div
                        className="absolute inset-y-0 left-0 bg-white/30 rounded-full transition-all duration-300"
                        style={{ width: `${bufferProgress}%` }}
                    />
                    {/* Progress Bar */}
                    <div
                        className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-150"
                        style={{ width: `${progress}%` }}
                    />
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        step="0.1"
                        value={currentTime}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                        style={{ left: `calc(${progress}% - 6px)` }}
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between gap-2 md:gap-4">
                    {/* Left Side */}
                    <div className="flex items-center gap-1 md:gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
                            ) : (
                                <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
                            )}
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-1 md:gap-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                ) : (
                                    <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                )}
                            </button>

                            {/* Volume Slider */}
                            <div className="hidden md:flex items-center w-0 group-hover/volume:w-20 transition-all duration-300 overflow-hidden">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Time Display */}
                        <div className="hidden sm:flex items-center gap-1 text-white text-xs md:text-sm font-medium tabular-nums ml-1">
                            <span>{formatTime(currentTime)}</span>
                            <span className="text-white/60">/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-1 md:gap-2">
                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                        >
                            {isFullscreen ? (
                                <Minimize className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            ) : (
                                <Maximize className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
