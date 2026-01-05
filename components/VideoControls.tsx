"use client";

import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipForward,
    RotateCcw,
    RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VideoControlsProps {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    buffered: number;
    volume: number;
    isMuted: boolean;
    isFullscreen: boolean;
    title?: string;
    isTVShow?: boolean;
    showControls: boolean;
    onTogglePlay: () => void;
    onSeek: (value: number[]) => void;
    onVolumeChange: (value: number[]) => void;
    onToggleMute: () => void;
    onToggleFullscreen: () => void;
    onSkipBackward: () => void;
    onSkipForward: () => void;
    onNextEpisode?: () => void;
    formatTime: (seconds: number) => string;
}

export function VideoControls({
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    isFullscreen,
    title,
    isTVShow,
    showControls,
    onTogglePlay,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onToggleFullscreen,
    onSkipBackward,
    onSkipForward,
    onNextEpisode,
    formatTime,
}: VideoControlsProps) {
    return (
        <div
            className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 px-4 pb-4 pt-20 z-40",
                showControls
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
            )}
            onClick={(e) => e.stopPropagation()}
            role="group"
            aria-label="Video Controls"
        >
            {/* Progress Bar */}
            <div className="relative group/progress mb-4 flex items-center h-4 cursor-pointer touch-none">
                {/* Background Track */}
                <div className="absolute w-full h-1 bg-white/20 rounded-full" />

                {/* Buffer Track */}
                <div
                    className="absolute h-1 bg-white/30 rounded-full transition-all duration-300"
                    style={{ width: `${(buffered / (duration || 1)) * 100}%` }}
                />

                {/* Slider */}
                <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={onSeek}
                    className="z-10 w-full"
                    aria-label="Seek video"
                />
            </div>

            <div className="flex items-center justify-between gap-2 md:gap-4">
                {/* Left Controls */}
                <div className="flex items-center gap-1 md:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onTogglePlay}
                        className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause className="h-4 w-4 md:h-5 md:w-5 fill-white" />
                        ) : (
                            <Play className="h-4 w-4 md:h-5 md:w-5 fill-white" />
                        )}
                    </Button>

                    {/* Skip Backward 10s */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onSkipBackward}
                        className="hidden md:inline-flex h-9 w-9 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-primary"
                        title="Skip backward 10s"
                        aria-label="Skip backward 10 seconds"
                    >
                        <RotateCcw className="h-5 w-5" />
                    </Button>

                    {/* Skip Forward 10s */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onSkipForward}
                        className="hidden md:inline-flex h-9 w-9 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-primary"
                        title="Skip forward 10s"
                        aria-label="Skip forward 10 seconds"
                    >
                        <RotateCw className="h-5 w-5" />
                    </Button>

                    {/* Volume Control */}
                    <div className="flex items-center group/volume">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleMute}
                            className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="h-4 w-4 md:h-5 md:w-5" />
                            ) : (
                                <Volume2 className="h-4 w-4 md:h-5 md:w-5" />
                            )}
                        </Button>
                        <div className="w-0 overflow-hidden md:w-20 group-hover/volume:w-20 focus-within:w-20 transition-all duration-300 flex items-center">
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                max={1}
                                step={0.01}
                                onValueChange={onVolumeChange}
                                className="w-20 cursor-pointer ml-2"
                                aria-label="Volume"
                            />
                        </div>
                    </div>

                    {/* Time Display */}
                    <div className="text-white text-xs md:text-sm font-medium tabular-nums ml-2" aria-live="off">
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
                    {/* Next Episode */}
                    {isFullscreen && isTVShow && onNextEpisode && (
                        <Button
                            onClick={onNextEpisode}
                            className="bg-white text-black hover:bg-zinc-200 h-7 md:h-8 gap-1 md:gap-2 px-2 md:px-3 mr-1 focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Next Episode"
                        >
                            <SkipForward className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="text-[10px] md:text-xs font-bold">Next</span>
                        </Button>
                    )}

                    {/* Fullscreen Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleFullscreen}
                        className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
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
    );
}
