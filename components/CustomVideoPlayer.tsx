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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";


// Interface for subtitles (Assuming this structure based on previous code)
export interface PlayerSubtitle {
    url: string;
    language: string;
    label: string;
    kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
    default?: boolean;
}

interface CustomVideoPlayerProps {
    videoUrl: string;
    subtitles?: PlayerSubtitle[];
    title?: string;
    poster?: string;
    startTime?: number; // Resume from this time in seconds
    mediaId?: string; // Movie/Episode ID for tracking
    mediaType?: string; // "movie" or "episode"
    isTVShow?: boolean; // Whether this is a TV show
}

export function CustomVideoPlayer({
    videoUrl,
    subtitles = [],
    title = "Video",
    poster,
    startTime = 0,
    mediaId,
    mediaType = "movie",
}: CustomVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();
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
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    if (error.name !== "AbortError") {
                        console.error("Error playing video:", error);
                    }
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
        if (newVolume === 0) {
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
    const handleSeek = (value: number[]) => {
        const newTime = value[0];
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    // Skip backward 10 seconds
    const skipBackward = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);

        // Trigger Animation
        setShowBackwardAnim(true);
        setTimeout(() => setShowBackwardAnim(false), 500);
    }, []);

    // Skip forward 10 seconds
    const skipForward = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);

        // Trigger Animation
        setShowForwardAnim(true);
        setTimeout(() => setShowForwardAnim(false), 500);
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
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    // Handle Touch/Click on Video Overlay
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        // Handle Double Tap Logic
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Double tap detected
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            // Determine click X position relative to container
            let clientX;
            if ('touches' in e) {
                // For touch events
                clientX = e.touches[0].clientX;
            } else {
                // For mouse events
                clientX = (e as React.MouseEvent).clientX;
            }

            const x = clientX - rect.left;
            const width = rect.width;

            if (x < width * 0.35) {
                // Left 35% -> Skip Backward
                skipBackward();
            } else if (x > width * 0.65) {
                // Right 35% -> Skip Forward
                skipForward();
            } else {
                // Center -> Toggle Fullscreen or just Play/Pause (Optional)
                togglePlay();
            }
        } else {
            // Single tap -> Toggle Controls visibility
            if (showControls) {
                setShowControls(false);
            } else {
                setShowControls(true);
                resetControlsTimeout();
            }
        }

        lastTapRef.current = now;
    };


    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // If user is typing in an input, ignore shortcuts
            if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

            if (!videoRef.current) return;

            switch (e.key) {
                case " ":
                case "k":
                    e.preventDefault();
                    togglePlay();
                    resetControlsTimeout();
                    break;
                case "f":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case "m":
                    e.preventDefault();
                    toggleMute();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    skipBackward();
                    resetControlsTimeout();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    skipForward();
                    resetControlsTimeout();
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    handleVolumeChange([Math.min(1, volume + 0.1)]);
                    resetControlsTimeout();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    handleVolumeChange([Math.max(0, volume - 0.1)]);
                    resetControlsTimeout();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [togglePlay, toggleFullscreen, toggleMute, volume, skipBackward, skipForward, resetControlsTimeout]);



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
        const handleEnded = () => {
            setIsPlaying(false);
        };

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

    // ... rest of the component ...


    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Reset video on URL change
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        wasFullscreenBeforeChange.current = isFullscreen;

        video.pause();
        video.currentTime = startTime; // Resume from saved position

        setIsPlaying(false);
        setCurrentTime(startTime);
        setIsLoading(true);

        if (isFirstRender.current) {
            isFirstRender.current = false;
            video.load();

            // Set start time after metadata loads
            const handleLoadedMetadata = () => {
                if (startTime > 0) {
                    video.currentTime = startTime;
                }
            };
            video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
            return;
        }

        setIsTransitioning(true);
        video.load();

        const timer = setTimeout(() => {
            setIsTransitioning(false);
            // Set start time after load
            if (startTime > 0 && video.duration) {
                video.currentTime = Math.min(startTime, video.duration);
            }
            if (wasFullscreenBeforeChange.current && containerRef.current) {
                containerRef.current.requestFullscreen().catch((err) => {
                    console.log("Could not restore fullscreen:", err);
                });
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [videoUrl, isFullscreen, startTime]);

    // Enable first subtitle by default
    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const handleLoadedMetadata = () => {
            const tracks = video.textTracks;
            if (tracks.length > 0) {
                tracks[0].mode = "showing";
                for (let i = 1; i < tracks.length; i++) {
                    tracks[i].mode = "hidden";
                }
            }
        };
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }, [subtitles]);

    // Watch progress tracking - save every 10 seconds
    useEffect(() => {
        if (!mediaId || !videoRef.current) return;

        console.log('[Watch Progress] Starting tracking for:', mediaId);

        let hasWatchedFor10Seconds = false;
        const video = videoRef.current;

        const saveProgress = async () => {
            if (!video || !mediaId) return;

            const progress = video.currentTime;
            const videoDuration = video.duration;

            console.log('[Watch Progress] Attempting to save:', {
                mediaId,
                mediaType,
                progress,
                duration: videoDuration,
                hasWatched10s: hasWatchedFor10Seconds
            });

            // Only save if we have valid data and video has been watched for at least 10 seconds
            if (progress > 0 && videoDuration > 0 && progress >= 10) {
                try {
                    console.log('[Watch Progress] Sending API request...');
                    const response = await fetch('/api/watch-progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mediaId,
                            mediaType,
                            progress,
                            duration: videoDuration
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('[Watch Progress] Successfully saved:', data);
                    } else {
                        console.error('[Watch Progress] API error:', response.status, await response.text());
                    }
                } catch (error) {
                    console.error('[Watch Progress] Error saving:', error);
                }
            } else {
                console.log('[Watch Progress] Skipped - not enough progress yet');
            }
        };

        // Save progress every 10 seconds
        const interval = setInterval(() => {
            if (video.currentTime >= 10 && !hasWatchedFor10Seconds) {
                hasWatchedFor10Seconds = true;
                console.log('[Watch Progress] Reached 10 seconds, saving...');
                saveProgress();
            } else if (hasWatchedFor10Seconds) {
                console.log('[Watch Progress] Periodic save...');
                saveProgress();
            }
        }, 10000); // Every 10 seconds

        // Save progress when video ends or component unmounts
        const handleBeforeUnload = () => saveProgress();
        const handleEnded = () => saveProgress();

        video.addEventListener('ended', handleEnded);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(interval);
            saveProgress(); // Save one last time before cleanup
            video.removeEventListener('ended', handleEnded);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [mediaId, mediaType]);


    // Mouse move handler
    const handleMouseMove = () => {
        resetControlsTimeout();
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={handleOverlayClick}
        >
            {/* Video Element with Transition */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={videoUrl}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center bg-black"
                >
                    <video
                        ref={videoRef}
                        className="w-full h-full max-h-screen object-contain"
                        // onClick removed here to let parent div handle double taps
                        onDoubleClick={toggleFullscreen}
                        preload="metadata"
                        playsInline
                        crossOrigin="anonymous"
                        title={title}
                        poster={poster}
                    >
                        <source src={videoUrl} type="video/mp4" />
                        {subtitles.map((subtitle, index) => (
                            <track
                                key={`subtitle-${index}`}
                                kind={subtitle.kind || "subtitles"}
                                src={subtitle.url}
                                srcLang={subtitle.language}
                                label={subtitle.label}
                                default={subtitle.default}
                            />
                        ))}
                    </video>
                </motion.div>
            </AnimatePresence>

            {/* Double Tap Animations - Left */}
            <AnimatePresence>
                {showBackwardAnim && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, x: -50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-white/80 z-40 pointer-events-none"
                    >
                        <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                            <ChevronsLeft className="w-10 h-10" />
                        </div>
                        <span className="text-sm font-bold mt-2 text-shadow">10s</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Double Tap Animations - Right */}
            <AnimatePresence>
                {showForwardAnim && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-white/80 z-40 pointer-events-none"
                    >
                        <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                            <ChevronsRight className="w-10 h-10" />
                        </div>
                        <span className="text-sm font-bold mt-2 text-shadow">10s</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transition Overlay */}
            {isTransitioning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 pointer-events-none"
                >
                    <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
                    <p className="text-white text-lg font-semibold">Loading Video...</p>
                </motion.div>
            )}

            {/* Loading Overlay */}
            {isLoading && !isTransitioning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none z-40">
                    <Loader2 className="h-12 w-12 text-white animate-spin" />
                </div>
            )}

            {/* Play/Pause Overlay (Center Button) */}
            <div
                className={cn(
                    "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-30",
                    showControls && !isLoading ? "opacity-100" : "opacity-0"
                )}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering double tap logic
                        togglePlay();
                    }}
                    className="pointer-events-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all hover:scale-110"
                >
                    {isPlaying ? (
                        <Pause className="h-8 w-8 md:h-10 md:w-10 text-white fill-white" />
                    ) : (
                        <Play className="h-8 w-8 md:h-10 md:w-10 text-white fill-white ml-1" />
                    )}
                </button>
            </div>

            {/* Controls Bar */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 px-4 pb-4 pt-20 z-40",
                    showControls
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                )}
                onClick={(e) => e.stopPropagation()} // Prevent closing controls when clicking on bar
            >
                {/* Progress Bar */}
                <div className="relative group/progress mb-4 flex items-center h-4 cursor-pointer touch-none">
                    {/* Background Track */}
                    <div className="absolute w-full h-1 bg-white/20 rounded-full" />

                    {/* Buffer Track */}
                    <div
                        className="absolute h-1 bg-white/30 rounded-full transition-all duration-300"
                        style={{ width: `${(buffered / duration) * 100}%` }}
                    />

                    {/* Slider */}
                    <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="z-10 w-full"
                    />
                </div>

                <div className="flex items-center justify-between gap-2 md:gap-4">
                    {/* Left Controls */}
                    <div className="flex items-center gap-1 md:gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePlay}
                            className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/20"
                        >
                            {isPlaying ? (
                                <Pause className="h-4 w-4 md:h-5 md:w-5 fill-white" />
                            ) : (
                                <Play className="h-4 w-4 md:h-5 md:w-5 fill-white" />
                            )}
                        </Button>

                        {/* Skip Backward 10s - Hidden on Mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={skipBackward}
                            className="hidden md:inline-flex h-9 w-9 text-white hover:bg-white/20"
                            title="Skip backward 10s"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>

                        {/* Skip Forward 10s - Hidden on Mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={skipForward}
                            className="hidden md:inline-flex h-9 w-9 text-white hover:bg-white/20"
                            title="Skip forward 10s"
                        >
                            <RotateCw className="h-5 w-5" />
                        </Button>

                        {/* Volume Control */}
                        <div className="flex items-center group/volume">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/20"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="h-4 w-4 md:h-5 md:w-5" />
                                ) : (
                                    <Volume2 className="h-4 w-4 md:h-5 md:w-5" />
                                )}
                            </Button>
                            {/* Volume Slider - Hidden on Mobile initially, or smaller */}
                            <div className="w-0 overflow-hidden md:w-20 group-hover/volume:w-20 transition-all duration-300 flex items-center">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={handleVolumeChange}
                                    className="w-20 cursor-pointer ml-2"
                                />
                            </div>
                        </div>

                        {/* Time Display */}
                        <div className="text-white text-xs md:text-sm font-medium tabular-nums ml-2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    {/* Center - Title (Fullscreen only) */}
                    {isFullscreen && title && (
                        <div className="hidden md:flex flex-1 justify-center px-4">
                            <p className="text-white text-sm md:text-base font-semibold drop-shadow-lg truncate max-w-md">
                                {title}
                            </p>
                        </div>
                    )}

                    {/* Right Controls */}
                    <div className="flex items-center gap-1 md:gap-2">
                        {/* Fullscreen Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleFullscreen}
                            className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/20"
                        >
                            {isFullscreen ? (
                                <Minimize className="h-4 w-4 md:h-5 md:w-5" />
                            ) : (
                                <Maximize className="h-4 w-4 md:h-5 md:w-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}