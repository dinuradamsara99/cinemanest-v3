'use client'

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Volume1,
    Maximize,
    Minimize,
    RotateCcw,
    RotateCw,
    Loader2,
    PictureInPicture2,
    RotateCcw as ResetIcon
} from 'lucide-react'
import { usePinchZoom } from '@/hooks/usePinchZoom'
import { useVideoThumbnails, ThumbnailSprite } from '@/hooks/useVideoThumbnails'
import { usePlaybackSpeed } from '@/hooks/usePlaybackSpeed'
import { useVideoSecurity } from '@/hooks/useSecureVideo'
import { useWatchProgress } from '@/context/WatchProgressContext'
import styles from './VideoPlayer.module.css'

export interface VideoPlayerRef {
    play: () => void
    pause: () => void
    seek: (time: number) => void
    getVideo: () => HTMLVideoElement | null
}

interface VideoPlayerProps {
    src: string
    poster?: string
    title: string
    contentId: string
    subtitle?: string
    thumbnailData?: ThumbnailSprite[] | string
    thumbnailBaseUrl?: string
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
    ({ src, poster, title, contentId, subtitle, thumbnailData, thumbnailBaseUrl }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null)
        const videoRef = useRef<HTMLVideoElement>(null)
        const videoWrapperRef = useRef<HTMLDivElement>(null)
        const progressRef = useRef<HTMLDivElement>(null)
        const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
        const saveProgressIntervalRef = useRef<NodeJS.Timeout | null>(null)

        // Watch progress context
        const { getProgress, saveProgress } = useWatchProgress()

        // Video state
        const [isPlaying, setIsPlaying] = useState(false)
        const [currentTime, setCurrentTime] = useState(0)
        const [duration, setDuration] = useState(0)
        const [buffered, setBuffered] = useState(0)
        const [volume, setVolume] = useState(1)
        const [isMuted, setIsMuted] = useState(false)
        const [isFullscreen, setIsFullscreen] = useState(false)

        // UI state
        const [showControls, setShowControls] = useState(true)
        const [showSettings, setShowSettings] = useState(false)
        const [showVolumeSlider, setShowVolumeSlider] = useState(false)
        const [showSpeedMenu, setShowSpeedMenu] = useState(false)
        const [isBuffering, setIsBuffering] = useState(false)
        const [hasError, setHasError] = useState(false)

        // Seek bar preview state
        const [hoverTime, setHoverTime] = useState<number | null>(null)
        const [hoverPosition, setHoverPosition] = useState(0)
        const [showThumbnailPreview, setShowThumbnailPreview] = useState(false)

        // Visual feedback state
        const [seekIndicator, setSeekIndicator] = useState<{ direction: 'left' | 'right'; seconds: number } | null>(null)
        const [volumeIndicator, setVolumeIndicator] = useState<number | null>(null)
        const seekIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
        const volumeIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

        // Custom hooks
        const { blobUrl, isLoading } = useVideoSecurity(src, containerRef)
        useVideoThumbnails(duration, thumbnailData, thumbnailBaseUrl)
        const { playbackSpeed, setPlaybackSpeed, speeds, getSpeedLabel } = usePlaybackSpeed(videoRef)
        const {
            zoomState,
            handleWheel,
            handleTouchStart,
            handleTouchMove,
            handleTouchEnd,
            handleMouseDown,
            handleMouseMove,
            handleMouseUp,
            resetZoom,
            isZoomed,
        } = usePinchZoom(videoWrapperRef)

        // Expose methods via ref
        useImperativeHandle(ref, () => ({
            play: () => videoRef.current?.play(),
            pause: () => videoRef.current?.pause(),
            seek: (time: number) => {
                if (videoRef.current) {
                    videoRef.current.currentTime = time
                }
            },
            getVideo: () => videoRef.current,
        }))

        // Auto-restore progress on mount
        useEffect(() => {
            const progress = getProgress(contentId)
            if (progress && progress.time > 10 && videoRef.current) {
                videoRef.current.currentTime = progress.time
            }
        }, [contentId, getProgress])

        // Auto-save progress every 10 seconds while playing
        useEffect(() => {
            if (isPlaying && duration > 0) {
                saveProgressIntervalRef.current = setInterval(() => {
                    if (videoRef.current) {
                        saveProgress(contentId, videoRef.current.currentTime, duration)
                    }
                }, 10000)
            }

            return () => {
                if (saveProgressIntervalRef.current) {
                    clearInterval(saveProgressIntervalRef.current)
                }
            }
        }, [isPlaying, duration, contentId, saveProgress])

        // Save progress on unmount
        useEffect(() => {
            const video = videoRef.current
            return () => {
                if (video && duration > 0) {
                    saveProgress(contentId, video.currentTime, duration)
                }
            }
        }, [contentId, duration, saveProgress])

        // Save progress before page unload
        useEffect(() => {
            const handleBeforeUnload = () => {
                if (videoRef.current && duration > 0) {
                    saveProgress(contentId, videoRef.current.currentTime, duration)
                }
            }

            window.addEventListener('beforeunload', handleBeforeUnload)
            return () => window.removeEventListener('beforeunload', handleBeforeUnload)
        }, [contentId, duration, saveProgress])

        // Video event handlers
        useEffect(() => {
            const video = videoRef.current
            if (!video) return

            const handlers = {
                timeupdate: () => setCurrentTime(video.currentTime),
                loadedmetadata: () => {
                    setDuration(video.duration)
                    setHasError(false)
                },
                ended: () => {
                    setIsPlaying(false)
                    saveProgress(contentId, video.currentTime, video.duration)
                },
                waiting: () => setIsBuffering(true),
                canplay: () => {
                    setIsBuffering(false)
                    setHasError(false)
                },
                playing: () => setIsBuffering(false),
                progress: () => {
                    if (video.buffered.length > 0) {
                        setBuffered(video.buffered.end(video.buffered.length - 1))
                    }
                },

                pause: () => {
                    setIsPlaying(false)
                    if (duration > 0) {
                        saveProgress(contentId, video.currentTime, duration)
                    }
                },
                error: () => {
                    setHasError(true)
                    setIsBuffering(false)
                },
            }

            Object.entries(handlers).forEach(([event, handler]) => {
                video.addEventListener(event, handler)
            })

            return () => {
                Object.entries(handlers).forEach(([event, handler]) => {
                    video.removeEventListener(event, handler)
                })
            }
        }, [contentId, duration, saveProgress])

        // Fullscreen change listener
        useEffect(() => {
            const handleFullscreenChange = () => {
                setIsFullscreen(!!document.fullscreenElement)
            }
            document.addEventListener('fullscreenchange', handleFullscreenChange)
            return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }, [])

        // Attach zoom event listeners
        useEffect(() => {
            const container = containerRef.current
            if (!container) return

            container.addEventListener('wheel', handleWheel, { passive: false })
            container.addEventListener('touchstart', handleTouchStart, { passive: false })
            container.addEventListener('touchmove', handleTouchMove, { passive: false })
            container.addEventListener('touchend', handleTouchEnd)
            container.addEventListener('mousedown', handleMouseDown)
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)

            return () => {
                container.removeEventListener('wheel', handleWheel)
                container.removeEventListener('touchstart', handleTouchStart)
                container.removeEventListener('touchmove', handleTouchMove)
                container.removeEventListener('touchend', handleTouchEnd)
                container.removeEventListener('mousedown', handleMouseDown)
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }
        }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp])

        // Keyboard controls
        useEffect(() => {
            const handleKeyDown = (e: KeyboardEvent) => {
                const activeElement = document.activeElement
                const isInputActive = activeElement?.tagName === 'INPUT' ||
                    activeElement?.tagName === 'TEXTAREA' ||
                    activeElement?.getAttribute('contenteditable') === 'true'

                if (isInputActive) return

                switch (e.key) {
                    case ' ':
                    case 'k':
                        e.preventDefault()
                        togglePlay()
                        break
                    case 'ArrowLeft':
                        e.preventDefault()
                        skip(-10)
                        setSeekIndicator({ direction: 'left', seconds: 10 })
                        if (seekIndicatorTimeoutRef.current) clearTimeout(seekIndicatorTimeoutRef.current)
                        seekIndicatorTimeoutRef.current = setTimeout(() => setSeekIndicator(null), 800)
                        break
                    case 'ArrowRight':
                        e.preventDefault()
                        skip(10)
                        setSeekIndicator({ direction: 'right', seconds: 10 })
                        if (seekIndicatorTimeoutRef.current) clearTimeout(seekIndicatorTimeoutRef.current)
                        seekIndicatorTimeoutRef.current = setTimeout(() => setSeekIndicator(null), 800)
                        break
                    case 'ArrowUp':
                        e.preventDefault()
                        adjustVolume(0.1)
                        setVolumeIndicator(Math.min(100, Math.round((volume + 0.1) * 100)))
                        if (volumeIndicatorTimeoutRef.current) clearTimeout(volumeIndicatorTimeoutRef.current)
                        volumeIndicatorTimeoutRef.current = setTimeout(() => setVolumeIndicator(null), 1000)
                        break
                    case 'ArrowDown':
                        e.preventDefault()
                        adjustVolume(-0.1)
                        setVolumeIndicator(Math.max(0, Math.round((volume - 0.1) * 100)))
                        if (volumeIndicatorTimeoutRef.current) clearTimeout(volumeIndicatorTimeoutRef.current)
                        volumeIndicatorTimeoutRef.current = setTimeout(() => setVolumeIndicator(null), 1000)
                        break
                    case 'm':
                        toggleMute()
                        break
                    case 'f':
                        toggleFullscreen()
                        break
                    case 'Escape':
                        setShowSettings(false)
                        setShowSpeedMenu(false)
                        break
                }
            }

            window.addEventListener('keydown', handleKeyDown)
            return () => window.removeEventListener('keydown', handleKeyDown)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isPlaying, volume])

        // Auto-hide controls
        const resetControlsTimeout = useCallback(() => {
            setShowControls(true)
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
            if (isPlaying && !showSettings && !showSpeedMenu) {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false)
                    setShowVolumeSlider(false)
                }, 3000)
            }
        }, [isPlaying, showSettings, showSpeedMenu])

        // Play/Pause
        const togglePlay = useCallback(() => {
            if (!videoRef.current) return
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }, [isPlaying])

        // Skip forward/backward
        const skip = useCallback((seconds: number) => {
            if (!videoRef.current) return
            videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
        }, [currentTime, duration])

        // Volume controls
        const adjustVolume = useCallback((delta: number) => {
            const newVolume = Math.max(0, Math.min(1, volume + delta))
            setVolume(newVolume)
            setIsMuted(newVolume === 0)
            if (videoRef.current) {
                videoRef.current.volume = newVolume
                videoRef.current.muted = newVolume === 0
            }
        }, [volume])

        const toggleMute = useCallback(() => {
            if (!videoRef.current) return
            const newMuted = !isMuted
            setIsMuted(newMuted)
            videoRef.current.muted = newMuted
            if (newMuted) {
                videoRef.current.volume = 0
            } else {
                videoRef.current.volume = volume || 0.5
                setVolume(volume || 0.5)
            }
        }, [isMuted, volume])

        // Progress bar interaction with thumbnail preview
        const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
            if (!videoRef.current || !progressRef.current) return
            const bounds = progressRef.current.getBoundingClientRect()
            const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width))
            videoRef.current.currentTime = percent * duration
            setCurrentTime(percent * duration)
        }, [duration])

        const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
            if (!progressRef.current) return
            const bounds = progressRef.current.getBoundingClientRect()
            const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width))
            const time = percent * duration
            setHoverTime(time)
            setHoverPosition(e.clientX - bounds.left)
            setShowThumbnailPreview(true)
        }, [duration])

        const handleProgressLeave = useCallback(() => {
            setHoverTime(null)
            setShowThumbnailPreview(false)
        }, [])

        // Fullscreen
        const toggleFullscreen = useCallback(() => {
            if (!containerRef.current) return
            if (document.fullscreenElement) {
                document.exitFullscreen()
            } else {
                containerRef.current.requestFullscreen()
            }
        }, [])

        // Picture in Picture
        const togglePiP = useCallback(async () => {
            if (!videoRef.current) return
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture()
                } else {
                    await videoRef.current.requestPictureInPicture()
                }
            } catch {
                console.log('PiP not supported')
            }
        }, [])

        // Format time
        const formatTime = useCallback((seconds: number) => {
            if (isNaN(seconds)) return '0:00'
            const hrs = Math.floor(seconds / 3600)
            const mins = Math.floor((seconds % 3600) / 60)
            const secs = Math.floor(seconds % 60)
            if (hrs > 0) {
                return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            }
            return `${mins}:${secs.toString().padStart(2, '0')}`
        }, [])

        // Prevent context menu
        const handleContextMenu = (e: React.MouseEvent) => {
            e.preventDefault()
            return false
        }

        // Calculate percentages
        const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
        const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0

        // Volume icon
        const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

        // Zoom transform style
        const videoStyle: React.CSSProperties = {
            transform: `scale(${zoomState.scale}) translate(${zoomState.translateX / zoomState.scale}px, ${zoomState.translateY / zoomState.scale}px)`,
            transformOrigin: `${zoomState.originX}% ${zoomState.originY}%`,
            cursor: isZoomed ? 'grab' : 'pointer',
        }

        return (
            <div
                ref={containerRef}
                className={`${styles.player} ${isFullscreen ? styles.fullscreen : ''}`}
                onMouseMove={resetControlsTimeout}
                onMouseLeave={() => isPlaying && !showSettings && !showSpeedMenu && setShowControls(false)}
                onContextMenu={handleContextMenu}
                tabIndex={0}
                role="application"
                aria-label={`Video player: ${title}`}
            >
                {/* Video Wrapper (for zoom) */}
                <div ref={videoWrapperRef} className={styles.videoWrapper}>
                    <video
                        ref={videoRef}
                        className={styles.video}
                        style={videoStyle}
                        poster={poster}
                        src={blobUrl || src}
                        onClick={togglePlay}
                        onDoubleClick={toggleFullscreen}
                        playsInline
                    />
                </div>

                {/* Loading/Buffering Overlay */}
                {(isLoading || isBuffering) && !hasError && (
                    <div className={styles.loadingOverlay}>
                        <Loader2 className={styles.spinner} size={48} />
                    </div>
                )}

                {/* Seek Indicator */}
                {seekIndicator && (
                    <div className={`${styles.seekIndicator} ${seekIndicator.direction === 'left' ? styles.left : styles.right}`}>
                        <div className={styles.seekIconWrapper}>
                            {seekIndicator.direction === 'left' ? <RotateCcw size={32} /> : <RotateCw size={32} />}
                        </div>
                        <span className={styles.seekSeconds}>{seekIndicator.seconds}s</span>
                    </div>
                )}

                {/* Volume Indicator */}
                {volumeIndicator !== null && (
                    <div className={styles.volumeIndicator}>
                        <Volume2 size={28} />
                        <div className={styles.volumeBarContainer}>
                            <div className={styles.volumeBarFill} style={{ width: `${volumeIndicator}%` }} />
                        </div>
                        <span className={styles.volumeValue}>{volumeIndicator}%</span>
                    </div>
                )}

                {/* Error Overlay */}
                {hasError && (
                    <div className={styles.errorOverlay}>
                        <div className={styles.errorContent}>
                            <Play size={48} className={styles.errorIcon} />
                            <h3 className={styles.errorTitle}>Video Unavailable</h3>
                            <p className={styles.errorText}>This video source is not supported or unavailable.</p>
                        </div>
                    </div>
                )}

                {/* Center Play/Pause Button */}
                <button
                    className={`${styles.centerButton} ${showControls || !isPlaying ? styles.visible : ''}`}
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
                </button>

                {/* Zoom Controls (when zoomed) */}
                {isZoomed && (
                    <div className={`${styles.zoomControls} ${showControls ? styles.visible : ''}`}>
                        <button onClick={resetZoom} className={styles.zoomResetBtn}>
                            <ResetIcon size={18} />
                            <span>Reset Zoom</span>
                        </button>
                        <span className={styles.zoomLevel}>{Math.round(zoomState.scale * 100)}%</span>
                    </div>
                )}

                {/* Bottom Gradient */}
                <div className={`${styles.bottomGradient} ${showControls ? styles.visible : ''}`} />

                {/* Controls Container */}
                <div className={`${styles.controlsContainer} ${showControls ? styles.visible : ''}`}>
                    {/* Title Bar */}
                    <div className={styles.titleBar}>
                        <div className={styles.titleInfo}>
                            <h3 className={styles.videoTitle}>{title}</h3>
                            {subtitle && <p className={styles.videoSubtitle}>{subtitle}</p>}
                        </div>
                        <div className={styles.timeDisplay}>
                            <span>{formatTime(currentTime)}</span>
                            <span className={styles.timeSeparator}>/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Progress Bar with Thumbnail Preview */}
                    <div
                        ref={progressRef}
                        className={styles.progressContainer}
                        onClick={handleProgressClick}
                        onMouseMove={handleProgressHover}
                        onMouseLeave={handleProgressLeave}
                    >
                        {/* Time Preview Tooltip */}
                        {showThumbnailPreview && hoverTime !== null && (
                            <div
                                className={styles.timeTooltip}
                                style={{ left: `${Math.max(30, Math.min(hoverPosition, progressRef.current?.offsetWidth ? progressRef.current.offsetWidth - 30 : 9999))}px` }}
                            >
                                {formatTime(hoverTime)}
                            </div>
                        )}

                        <div className={styles.progressTrack}>
                            <div className={styles.progressBuffered} style={{ width: `${bufferedPercent}%` }} />
                            <div className={styles.progressFilled} style={{ width: `${progressPercent}%` }} />
                            <div className={styles.scrubber} style={{ left: `${progressPercent}%` }} />
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className={styles.controlsRow}>
                        {/* Left Controls */}
                        <div className={styles.leftControls}>
                            <button className={styles.controlBtn} onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                                {isPlaying ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
                            </button>
                            <button className={styles.controlBtn} onClick={() => skip(-10)} aria-label="Rewind 10 seconds">
                                <RotateCcw size={20} />
                            </button>
                            <button className={styles.controlBtn} onClick={() => skip(10)} aria-label="Forward 10 seconds">
                                <RotateCw size={20} />
                            </button>
                        </div>

                        {/* Right Controls */}
                        <div className={styles.rightControls}>
                            {/* Volume */}
                            <div
                                className={styles.volumeWrapper}
                                onMouseEnter={() => setShowVolumeSlider(true)}
                                onMouseLeave={() => setShowVolumeSlider(false)}
                            >
                                <button className={styles.controlBtn} onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                                    <VolumeIcon size={22} />
                                </button>
                                <div className={`${styles.volumeSliderContainer} ${showVolumeSlider ? styles.visible : ''}`}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => {
                                            const newVolume = parseFloat(e.target.value)
                                            setVolume(newVolume)
                                            setIsMuted(newVolume === 0)
                                            if (videoRef.current) {
                                                videoRef.current.volume = newVolume
                                                videoRef.current.muted = false
                                            }
                                        }}
                                        className={styles.volumeSlider}
                                        aria-label="Volume"
                                        style={{
                                            background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)`
                                        }}
                                    />
                                    <span className={styles.volumePercent}>{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                                </div>
                            </div>

                            {/* Playback Speed */}
                            <div className={styles.speedWrapper}>
                                <button
                                    className={`${styles.controlBtn} ${styles.speedBtn}`}
                                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                    aria-label="Playback speed"
                                >
                                    <span className={styles.speedLabel}>{playbackSpeed}x</span>
                                </button>

                                {showSpeedMenu && (
                                    <div className={styles.speedMenu}>
                                        <div className={styles.speedMenuHeader}>Playback Speed</div>
                                        <div className={styles.speedOptions}>
                                            {speeds.map((speed) => (
                                                <button
                                                    key={speed}
                                                    className={`${styles.speedOption} ${playbackSpeed === speed ? styles.active : ''}`}
                                                    onClick={() => {
                                                        setPlaybackSpeed(speed)
                                                        setShowSpeedMenu(false)
                                                    }}
                                                >
                                                    {getSpeedLabel(speed)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* Fullscreen */}
                            <button
                                className={styles.controlBtn}
                                onClick={toggleFullscreen}
                                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            >
                                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                            </button>

                            {/* Picture in Picture */}
                            <button className={styles.controlBtn} onClick={togglePiP} aria-label="Picture in Picture">
                                <PictureInPicture2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer
