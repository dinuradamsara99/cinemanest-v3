"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Loader2,
    RotateCcw,
    RotateCw,
    ChevronsRight,
    ChevronsLeft,
    Volume1,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// Interface for Subtitles
export interface PlayerSubtitle {
    url: string;
    language: string;
    label: string;
    kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
    default?: boolean;
}

// Interface for Props
interface CustomVideoPlayerProps {
    videoUrl: string;
    subtitles?: PlayerSubtitle[];
    title?: string;
    poster?: string;
    startTime?: number;
    mediaId?: string;
    mediaType?: string;
    isTVShow?: boolean;
}

export function CustomVideoPlayer({
    videoUrl,
    subtitles = [],
    title = "Video",
    poster,
    startTime = 0,
    mediaId,
    mediaType = "movie",
    isTVShow = false,
}: CustomVideoPlayerProps) {
    // Typed Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const tapTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined); // New ref for debouncing taps
    const isFirstRender = useRef(true);
    const wasFullscreenBeforeChange = useRef(false);
    const lastTapRef = useRef<number>(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const [buffered, setBuffered] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // States for Double Tap Animations
    const [showForwardAnim, setShowForwardAnim] = useState(false);
    const [showBackwardAnim, setShowBackwardAnim] = useState(false);
    const [skipAmount, setSkipAmount] = useState(10);

    // Format time helper
    const formatTime = (seconds: number) => {
        if (!isFinite(seconds)) return "0:00";
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Play/Pause toggle
    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error: unknown) => {
                    const err = error as Error;
                    if (err.name !== "AbortError") console.error("Error playing video:", error);
                });
            }
        }
    }, [isPlaying]);

    // Volume control
    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    };

    // Mute toggle
    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
            if (!isMuted && volume === 0) {
                setVolume(0.5);
                videoRef.current.volume = 0.5;
            }
        }
    }, [isMuted, volume]);

    // Seek control
    const handleSeek = (value: number[]) => {
        const newTime = value[0];
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    // Skip backward/forward
    const skipBackward = useCallback((skipSeconds: number = 10) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - skipSeconds);
        setSkipAmount(skipSeconds);
        setShowBackwardAnim(true);
        setTimeout(() => setShowBackwardAnim(false), 600);
    }, []);

    const skipForward = useCallback((skipSeconds: number = 10) => {
        if (!videoRef.current) return;
        if (duration > 0) { // Check if duration exists
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + skipSeconds);
        } else {
            videoRef.current.currentTime += skipSeconds;
        }
        setSkipAmount(skipSeconds);
        setShowForwardAnim(true);
        setTimeout(() => setShowForwardAnim(false), 600);
    }, [duration]);

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
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    }, [isPlaying]);

    // Handle interactions (Updated for Debouncing)
    const handleOverlayInteraction = useCallback((clientX: number) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = clientX - rect.left;
        const width = rect.width;
        const relativeX = x / width;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Double tap detected!

            // Cancel the single tap action (showing controls)
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current);
                tapTimeoutRef.current = undefined;
            }

            // Perform Skip or Play Toggle
            if (relativeX < 0.40) skipBackward(10);
            else if (relativeX > 0.60) skipForward(10);
            else togglePlay();

            lastTapRef.current = 0; // Reset
        } else {
            // Single tap detected - wait to confirm it's not a double tap
            lastTapRef.current = now;

            tapTimeoutRef.current = setTimeout(() => {
                // If this code runs, it means no second tap happened
                if (showControls) {
                    setShowControls(false);
                } else {
                    setShowControls(true);
                    resetControlsTimeout();
                }
                tapTimeoutRef.current = undefined;
            }, DOUBLE_TAP_DELAY);
        }
    }, [skipBackward, skipForward, togglePlay, showControls, resetControlsTimeout]);

    // Mouse/Touch handlers
    const handleMouseClick = (e: React.MouseEvent<HTMLDivElement>) => handleOverlayInteraction(e.clientX);
    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.changedTouches.length > 0) handleOverlayInteraction(e.changedTouches[0].clientX);
    };

    // Cleanup tap timeout on unmount
    useEffect(() => {
        return () => {
            if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
            if (!videoRef.current) return;

            switch (e.key.toLowerCase()) {
                case " ":
                case "k": e.preventDefault(); togglePlay(); resetControlsTimeout(); break;
                case "f": e.preventDefault(); toggleFullscreen(); break;
                case "m": e.preventDefault(); toggleMute(); break;
                case "arrowleft": e.preventDefault(); skipBackward(); resetControlsTimeout(); break;
                case "arrowright": e.preventDefault(); skipForward(); resetControlsTimeout(); break;
                case "arrowup": e.preventDefault(); handleVolumeChange([Math.min(1, volume + 0.1)]); resetControlsTimeout(); break;
                case "arrowdown": e.preventDefault(); handleVolumeChange([Math.max(0, volume - 0.1)]); resetControlsTimeout(); break;
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [togglePlay, toggleFullscreen, toggleMute, volume, skipBackward, skipForward, resetControlsTimeout]);

    // Video Event Listeners
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
            if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1));
        };
        const handleEnded = () => setIsPlaying(false);

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("loadeddata", handleLoadedData);
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("progress", handleProgress);
        video.addEventListener("ended", handleEnded);

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("durationchange", handleDurationChange);
            video.removeEventListener("loadeddata", handleLoadedData);
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("progress", handleProgress);
            video.removeEventListener("ended", handleEnded);
        };
    }, [videoUrl]);

    // Fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Video Load & Resume Logic
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        wasFullscreenBeforeChange.current = isFullscreen;
        video.pause();
        video.currentTime = startTime;
        setIsPlaying(false);
        setCurrentTime(startTime);
        setIsLoading(true);

        if (isFirstRender.current) {
            isFirstRender.current = false;
            video.load();
            const handleLoadedMetadata = () => {
                if (startTime > 0) video.currentTime = startTime;
            };
            video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
            return;
        }

        setIsTransitioning(true);
        video.load();
        const timer = setTimeout(() => {
            setIsTransitioning(false);
            if (startTime > 0 && video.duration) video.currentTime = Math.min(startTime, video.duration);
            if (wasFullscreenBeforeChange.current && containerRef.current) {
                containerRef.current.requestFullscreen().catch((err: unknown) => console.log(err));
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [videoUrl, startTime]);

    // Watch Progress Saver
    useEffect(() => {
        if (!mediaId || !videoRef.current) return;
        let hasWatchedFor10s = false;
        const video = videoRef.current;
        const saveProgress = async () => {
            if (!video || !mediaId) return;
            const progress = video.currentTime;
            if (progress > 0 && video.duration > 0 && progress >= 10) {
                try {
                    await fetch('/api/watch-progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mediaId, mediaType, progress, duration: video.duration })
                    });
                } catch (e) { console.error(e); }
            }
        };
        const interval = setInterval(() => {
            if (video.currentTime >= 10 && !hasWatchedFor10s) { hasWatchedFor10s = true; saveProgress(); }
            else if (hasWatchedFor10s) saveProgress();
        }, 10000);
        const handleUnload = () => saveProgress();
        video.addEventListener('ended', handleUnload);
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            clearInterval(interval);
            saveProgress(); // Last save
            video.removeEventListener('ended', handleUnload);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [mediaId, mediaType]);

    // Volume Icon Logic
    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeX className="h-5 w-5 md:h-6 md:w-6" />;
        if (volume < 0.5) return <Volume1 className="h-5 w-5 md:h-6 md:w-6" />;
        return <Volume2 className="h-5 w-5 md:h-6 md:w-6" />;
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group overflow-hidden select-none touch-manipulation font-sans"
            onMouseMove={() => resetControlsTimeout()}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={handleMouseClick}
            onTouchEnd={handleTouchEnd}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain z-10"
                onDoubleClick={toggleFullscreen}
                preload="auto"
                playsInline
                crossOrigin="anonymous"
                title={title}
                poster={poster}
                src={videoUrl}
            >
                {subtitles.map((sub, i) => (
                    <track key={i} kind={sub.kind || "subtitles"} src={sub.url} srcLang={sub.language} label={sub.label} default={sub.default} />
                ))}
            </video>

            {/* Double Tap Animations */}
            <AnimatePresence>
                {showBackwardAnim && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute left-[15%] top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-40 pointer-events-none text-white drop-shadow-lg"
                    >
                        <ChevronsLeft className="w-12 h-12" />
                        <span className="text-sm font-bold mt-1">-{skipAmount}s</span>
                    </motion.div>
                )}
                {showForwardAnim && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute right-[15%] top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-40 pointer-events-none text-white drop-shadow-lg"
                    >
                        <ChevronsRight className="w-12 h-12" />
                        <span className="text-sm font-bold mt-1">+{skipAmount}s</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loaders */}
            {(isLoading || isTransitioning) && (
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/10 pointer-events-none">
                    <Loader2 className="h-12 w-12 text-white animate-spin drop-shadow-lg" />
                </div>
            )}

            {/* Large Center Play/Pause (Animated) */}
            <AnimatePresence>
                {!isPlaying && !isLoading && !isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                    >
                        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-full border border-white/10 shadow-2xl">
                            <Play className="h-10 w-10 text-white fill-white ml-1" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Controls Bar */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 z-50 flex flex-col justify-end px-3 md:px-5 pb-3 md:pb-5 pt-24",
                    showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. Progress Bar Row */}
                <div className="w-full mb-3 flex items-center group/progress h-5 cursor-pointer touch-none relative">
                    {/* Hit Area (Invisible but clickable) */}
                    <div className="absolute inset-0 z-20" />

                    {/* Background Track */}
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden relative">
                        {/* Buffer */}
                        <div
                            className="absolute top-0 left-0 h-full bg-white/30 transition-all duration-300"
                            style={{ width: `${(buffered / duration) * 100}%` }}
                        />
                        {/* Slider Component */}
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={0.1}
                            onValueChange={handleSeek}
                            className={cn(
                                "absolute inset-0 z-30",
                                "[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-md",
                                "[&_[role=slider]]:opacity-0 group-hover/progress:[&_[role=slider]]:opacity-100 [&_[role=slider]]:transition-opacity",
                                "[&_.bg-primary]:bg-red-600" // Netflix red style progress
                            )}
                        />
                    </div>
                </div>

                {/* 2. Buttons Row */}
                <div className="flex items-center justify-between">
                    {/* Left Group: Play, Skip, Volume, Time */}
                    <div className="flex items-center gap-1 md:gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePlay}
                            className="h-10 w-10 text-white hover:bg-white/10 hover:text-white rounded-full"
                        >
                            {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
                        </Button>

                        {/* Desktop Skip Buttons */}
                        <div className="hidden md:flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => skipBackward(10)} className="h-9 w-9 text-zinc-200 hover:bg-white/10 hover:text-white rounded-full">
                                <RotateCcw className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => skipForward(10)} className="h-9 w-9 text-zinc-200 hover:bg-white/10 hover:text-white rounded-full">
                                <RotateCw className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Volume Controls */}
                        <div className="flex items-center group/volume ml-1 md:ml-0">
                            <Button variant="ghost" size="icon" onClick={toggleMute} className="h-9 w-9 text-white hover:bg-white/10 hover:text-white rounded-full">
                                {getVolumeIcon()}
                            </Button>
                            {/* Volume Slider: Hidden on mobile, slide-out on desktop */}
                            <div className="w-0 overflow-hidden sm:w-0 sm:group-hover/volume:w-24 transition-all duration-300 flex items-center">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={handleVolumeChange}
                                    className={cn(
                                        "w-20 ml-2 cursor-pointer",
                                        "[&_[role=track]]:bg-white/20", // Track background
                                        "[&_[role=range]]:bg-white",   // Filled part
                                        "[&_[role=slider]]:bg-white [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 shadow-sm" // Thumb style
                                    )}
                                />
                            </div>
                        </div>

                        {/* Time Display */}
                        <div className="text-zinc-300 text-xs md:text-sm font-medium tabular-nums ml-2 select-none">
                            <span className="text-white">{formatTime(currentTime)}</span>
                            <span className="opacity-50 mx-1">/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Right Group: Title, Fullscreen */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Title (Shows on large screens) */}
                        <h4 className="hidden lg:block text-white text-sm font-semibold tracking-wide drop-shadow-md max-w-[200px] truncate">
                            {title}
                        </h4>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleFullscreen}
                            className="h-9 w-9 text-white hover:bg-white/10 hover:text-white rounded-full"
                        >
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}