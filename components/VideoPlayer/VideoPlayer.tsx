'use client'

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from 'react'
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Volume1,
    Maximize,
    Minimize,
    PictureInPicture2,
    ChevronsRight,
    ChevronsLeft,
    RotateCcw
} from 'lucide-react'
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
    autoPlay?: boolean
    className?: string
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
    ({ src, poster, autoPlay = false, className }, ref) => {
        // Refs
        const containerRef = useRef<HTMLDivElement>(null)
        const videoRef = useRef<HTMLVideoElement>(null)
        const progressRef = useRef<HTMLDivElement>(null)
        const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
        const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
        const lastClickTimeRef = useRef<number>(0)

        // Player State
        const [isPlaying, setIsPlaying] = useState(false)
        const [currentTime, setCurrentTime] = useState(0)
        const [duration, setDuration] = useState(0)
        const [buffered, setBuffered] = useState(0)
        const [volume, setVolume] = useState(1)
        const [isMuted, setIsMuted] = useState(false)
        const [isFullscreen, setIsFullscreen] = useState(false)
        const [showControls, setShowControls] = useState(true)
        const [isBuffering, setIsBuffering] = useState(false)
        const [videoError, setVideoError] = useState(false)
        const [hasEnded, setHasEnded] = useState(false)

        // Interaction State
        const [isDragging, setIsDragging] = useState(false)
        const [hoverTime, setHoverTime] = useState<number | null>(null)
        const [hoverPosition, setHoverPosition] = useState(0)

        // Animations / Overlays
        const [skipAnimation, setSkipAnimation] = useState<'left' | 'right' | null>(null)
        const [centerIcon, setCenterIcon] = useState<'play' | 'pause' | null>(null)

        useImperativeHandle(ref, () => ({
            play: () => videoRef.current?.play(),
            pause: () => videoRef.current?.pause(),
            seek: (time: number) => { if (videoRef.current) videoRef.current.currentTime = time },
            getVideo: () => videoRef.current,
        }))

        // --- Control Visibility Logic ---
        const showControlsFunc = useCallback(() => {
            setShowControls(true)
            document.body.style.cursor = 'default'
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)

            if (isPlaying && !isDragging) {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false)
                    if (!containerRef.current?.matches(':hover')) {
                        // Logic if mouse leaves
                    }
                }, 2500)
            }
        }, [isPlaying, isDragging])

        // --- Playback Logic ---
        const togglePlay = useCallback(() => {
            if (!videoRef.current) return
            if (videoRef.current.paused || videoRef.current.ended) {
                videoRef.current.play().catch(e => console.error("Play error:", e))
                setCenterIcon('play')
            } else {
                videoRef.current.pause()
                setCenterIcon('pause')
                setShowControls(true)
            }
            setTimeout(() => setCenterIcon(null), 600)
        }, [])

        const handleVolumeChange = (newVolume: number) => {
            if (!videoRef.current) return
            const clamped = Math.max(0, Math.min(1, newVolume))
            videoRef.current.volume = clamped
            videoRef.current.muted = clamped === 0
            setVolume(clamped)
            setIsMuted(clamped === 0)
        }

        const toggleMute = () => {
            if (!videoRef.current) return
            const nextMuteState = !isMuted
            videoRef.current.muted = nextMuteState
            setIsMuted(nextMuteState)
            if (!nextMuteState && volume === 0) {
                handleVolumeChange(0.5) // Unmute to 50% if volume was 0
            }
        }

        const skip = (seconds: number) => {
            if (!videoRef.current) return
            const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
            videoRef.current.currentTime = newTime
            setCurrentTime(newTime)
            showControlsFunc()

            // Trigger Animation
            setSkipAnimation(seconds > 0 ? 'right' : 'left')
            setTimeout(() => setSkipAnimation(null), 500)
        }

        // --- Smart Click Handler (Tap vs Double Tap) ---
        const handleSmartClick = (e: React.MouseEvent | React.TouchEvent) => {
            // If clicking controls, ignore
            if ((e.target as HTMLElement).closest(`.${styles.controlsOverlay}`)) return

            const now = Date.now()
            const timeSinceLastClick = now - lastClickTimeRef.current
            const DOUBLE_TAP_DELAY = 300 // ms

            if (timeSinceLastClick < DOUBLE_TAP_DELAY) {
                // DOUBLE TAP DETECTED
                if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)

                // Calculate click position (Left or Right side of screen)
                const rect = containerRef.current?.getBoundingClientRect()
                if (rect) {
                    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX
                    const clickX = clientX - rect.left

                    if (clickX < rect.width / 2) {
                        skip(-10) // Left side -> Rewind
                    } else {
                        skip(10) // Right side -> Forward
                    }
                }
            } else {
                // SINGLE TAP DETECTED (Wait to see if it becomes double)
                clickTimeoutRef.current = setTimeout(() => {
                    // It was just a single tap -> Toggle Play
                    togglePlay()
                }, DOUBLE_TAP_DELAY)
            }

            lastClickTimeRef.current = now
        }

        const toggleFullscreen = async () => {
            if (!containerRef.current) return
            if (!document.fullscreenElement) {
                try {
                    await containerRef.current.requestFullscreen()
                    setIsFullscreen(true)
                } catch (e) { console.error(e) }
            } else {
                await document.exitFullscreen()
                setIsFullscreen(false)
            }
        }

        // --- Seek Handling ---
        const handleSeekStart = () => setIsDragging(true)

        const handleSeekMove = useCallback((e: MouseEvent | TouchEvent) => {
            if (!progressRef.current || !videoRef.current) return
            const rect = progressRef.current.getBoundingClientRect()
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
            const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
            const seekTime = percentage * duration

            if (isDragging) {
                videoRef.current.currentTime = seekTime
                setCurrentTime(seekTime)
            }
        }, [duration, isDragging])

        const handleSeekEnd = useCallback(() => {
            setIsDragging(false)
            if (isPlaying) videoRef.current?.play()
        }, [isPlaying])

        useEffect(() => {
            if (isDragging) {
                window.addEventListener('mousemove', handleSeekMove)
                window.addEventListener('mouseup', handleSeekEnd)
                window.addEventListener('touchmove', handleSeekMove)
                window.addEventListener('touchend', handleSeekEnd)
            }
            return () => {
                window.removeEventListener('mousemove', handleSeekMove)
                window.removeEventListener('mouseup', handleSeekEnd)
                window.removeEventListener('touchmove', handleSeekMove)
                window.removeEventListener('touchend', handleSeekEnd)
            }
        }, [isDragging, handleSeekMove, handleSeekEnd])

        // --- Video Events ---
        useEffect(() => {
            const video = videoRef.current
            if (!video) return

            const onTimeUpdate = () => setCurrentTime(video.currentTime)
            const onDurationChange = () => setDuration(video.duration)
            const onWaiting = () => setIsBuffering(true)
            const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); setHasEnded(false); }
            const onPause = () => setIsPlaying(false)
            const onEnded = () => { setIsPlaying(false); setHasEnded(true); setShowControls(true); }
            const onError = () => { setVideoError(true); setIsBuffering(false); }
            const onProgress = () => {
                if (video.buffered.length > 0) {
                    setBuffered(video.buffered.end(video.buffered.length - 1))
                }
            }

            video.addEventListener('timeupdate', onTimeUpdate)
            video.addEventListener('durationchange', onDurationChange)
            video.addEventListener('waiting', onWaiting)
            video.addEventListener('playing', onPlaying)
            video.addEventListener('pause', onPause)
            video.addEventListener('ended', onEnded)
            video.addEventListener('error', onError)
            video.addEventListener('progress', onProgress)

            if (autoPlay) video.play().catch(() => { })

            return () => {
                video.removeEventListener('timeupdate', onTimeUpdate)
                video.removeEventListener('durationchange', onDurationChange)
                video.removeEventListener('waiting', onWaiting)
                video.removeEventListener('playing', onPlaying)
                video.removeEventListener('pause', onPause)
                video.removeEventListener('ended', onEnded)
                video.removeEventListener('error', onError)
                video.removeEventListener('progress', onProgress)
            }
        }, [autoPlay])

        // Format Time
        const formatTime = (time: number) => {
            const minutes = Math.floor(time / 60)
            const seconds = Math.floor(time % 60)
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        }

        const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

        return (
            <div
                ref={containerRef}
                className={`${styles.player} ${isFullscreen ? styles.fullscreen : ''} ${!showControls && isPlaying ? styles.hideCursor : ''} ${className || ''}`}
                onMouseMove={showControlsFunc}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                onClick={handleSmartClick} // Handle both single and double tap
                onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'k') togglePlay()
                    if (e.key === 'f') toggleFullscreen()
                    if (e.key === 'ArrowRight') skip(5)
                    if (e.key === 'ArrowLeft') skip(-5)
                }}
                tabIndex={0}
            >
                <div className={styles.videoWrapper}>
                    <video
                        ref={videoRef}
                        src={src}
                        className={styles.video}
                        playsInline
                        poster={poster}
                    />
                </div>

                {/* OVERLAYS LAYER */}
                <div className={styles.overlayLayer}>
                    {/* 1. Buffering / Loading */}
                    {isBuffering && !videoError && (
                        <div className={styles.loader}>
                            <div className={styles.spinner}></div>
                        </div>
                    )}

                    {/* 2. Skip Animation (Double Tap) */}
                    {skipAnimation && (
                        <div className={`${styles.skipOverlay} ${skipAnimation === 'right' ? styles.right : styles.left}`}>
                            <div className={styles.skipIcon}>
                                {skipAnimation === 'right' ? <ChevronsRight size={32} /> : <ChevronsLeft size={32} />}
                            </div>
                            <span className={styles.skipText}>{skipAnimation === 'right' ? '+10s' : '-10s'}</span>
                        </div>
                    )}

                    {/* 3. Center Play/Pause Animation */}
                    {centerIcon && (
                        <div className={styles.centerPulse}>
                            {centerIcon === 'play' ? <Play fill="white" size={48} /> : <Pause fill="white" size={48} />}
                        </div>
                    )}

                    {/* 4. Replay Button if Ended */}
                    {hasEnded && (
                        <button onClick={() => { videoRef.current?.play() }} className={styles.centerPulse} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                            <RotateCcw color="white" size={48} />
                        </button>
                    )}
                </div>

                {/* CONTROLS BAR */}
                <div className={`${styles.controlsOverlay} ${showControls || !isPlaying ? styles.visible : ''}`} onClick={(e) => e.stopPropagation()}>

                    {/* Progress Bar */}
                    <div
                        className={styles.progressBarContainer}
                        ref={progressRef}
                        onMouseDown={handleSeekStart}
                        onTouchStart={handleSeekStart}
                        onMouseMove={(e) => {
                            if (!progressRef.current) return
                            const rect = progressRef.current.getBoundingClientRect()
                            const pos = e.clientX - rect.left
                            setHoverPosition(pos)
                            setHoverTime((pos / rect.width) * duration)
                        }}
                        onMouseLeave={() => setHoverTime(null)}
                    >
                        {/* Hover Time Tooltip */}
                        {hoverTime !== null && hoverTime >= 0 && (
                            <div className={styles.thumbnailTooltip} style={{ left: hoverPosition }}>
                                <span className={styles.tooltipTime}>{formatTime(hoverTime)}</span>
                            </div>
                        )}

                        <div className={styles.progressTrack}>
                            <div className={styles.progressBuffered} style={{ width: `${(buffered / duration) * 100}%` }} />
                            <div className={styles.progressCurrent} style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                            <div className={styles.scrubber} style={{ left: `${(currentTime / duration) * 100}%` }} />
                        </div>
                    </div>

                    <div className={styles.controlsRow}>
                        <div className={styles.leftControls}>
                            <button onClick={togglePlay} className={styles.iconBtn}>
                                {isPlaying ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" />}
                            </button>

                            <div className={styles.volumeContainer}>
                                <button onClick={toggleMute} className={styles.iconBtn}>
                                    <VolumeIcon size={24} />
                                </button>
                                <div className={styles.volumeSliderContainer}>
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.05"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                        className={styles.volumeSlider}
                                    />
                                </div>
                            </div>

                            <div className={styles.timeDisplay}>
                                <span>{formatTime(currentTime)}</span>
                                <span style={{ opacity: 0.5, margin: '0 4px' }}>/</span>
                                <span>{formatTime(duration || 0)}</span>
                            </div>
                        </div>

                        <div className={styles.rightControls}>
                            <button
                                className={`${styles.iconBtn} ${styles.pipBtn}`}
                                onClick={() => {
                                    if (document.pictureInPictureElement) document.exitPictureInPicture()
                                    else videoRef.current?.requestPictureInPicture()
                                }}
                            >
                                <PictureInPicture2 size={20} />
                            </button>
                            <button onClick={toggleFullscreen} className={styles.iconBtn}>
                                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
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