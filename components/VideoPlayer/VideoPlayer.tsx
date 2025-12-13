'use client'

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from 'react'
import Image from 'next/image'
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    PictureInPicture2,
    ChevronsRight,
    ChevronsLeft
} from 'lucide-react'
import { usePinchZoom } from '@/hooks/usePinchZoom'
import { useVideoThumbnails, ThumbnailSprite } from '@/hooks/useVideoThumbnails'
import { useVideoSecurity } from '@/hooks/useSecureVideo'
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
    className?: string
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
    ({ src, poster, title, thumbnailData, thumbnailBaseUrl, className }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null)
        const videoRef = useRef<HTMLVideoElement>(null)
        const videoWrapperRef = useRef<HTMLDivElement>(null)
        const progressRef = useRef<HTMLDivElement>(null)
        const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

        // Animation Refs
        const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
        const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null)
        const seekAccumulatorRef = useRef<number>(0)

        // States
        const [isPlaying, setIsPlaying] = useState(false)
        const [currentTime, setCurrentTime] = useState(0)
        const [duration, setDuration] = useState(0)
        const [buffered, setBuffered] = useState(0)
        const [volume, setVolume] = useState(1)
        const [isMuted, setIsMuted] = useState(false)
        const [isFullscreen, setIsFullscreen] = useState(false)
        const [hasPlayedOnce, setHasPlayedOnce] = useState(false)
        const [showControls, setShowControls] = useState(true)

        const [isBuffering, setIsBuffering] = useState(false)

        // Hover/Drag States
        const [hoverTime, setHoverTime] = useState<number | null>(null)
        const [hoverPosition, setHoverPosition] = useState(0)
        const [showThumbnailPreview, setShowThumbnailPreview] = useState(false)
        const [isDragging, setIsDragging] = useState(false)

        // Animation States
        const [volumeOverlay, setVolumeOverlay] = useState<{ show: boolean, val: number, muted: boolean } | null>(null)
        const [seekOverlay, setSeekOverlay] = useState<{ show: boolean, type: 'forward' | 'rewind', seconds: number } | null>(null)
        const [centerPlayIcon, setCenterPlayIcon] = useState<'play' | 'pause' | null>(null)

        // Hooks
        const { blobUrl, isLoading } = useVideoSecurity(src, containerRef)
        useVideoThumbnails(duration, thumbnailData, thumbnailBaseUrl)

        const { zoomState } = usePinchZoom(videoWrapperRef)

        useImperativeHandle(ref, () => ({
            play: () => videoRef.current?.play(),
            pause: () => videoRef.current?.pause(),
            seek: (time: number) => { if (videoRef.current) videoRef.current.currentTime = time },
            getVideo: () => videoRef.current,
        }))

        // --- Logic Functions ---

        const showControlsTemporarily = useCallback(() => {
            setShowControls(true)
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
            if (isPlaying && !isDragging) {
                controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500)
            }
        }, [isPlaying, isDragging])

        const handleContainerClick = () => {
            // Mobile: Tap shows controls first, then toggles play
            if (window.matchMedia('(hover: none)').matches) {
                if (!showControls) {
                    showControlsTemporarily()
                    return
                }
            }
            togglePlay()
        }

        const togglePlay = useCallback(() => {
            if (!videoRef.current) return
            if (isPlaying) {
                videoRef.current.pause()
                setCenterPlayIcon('pause')
                setShowControls(true) // Keep controls on pause
                if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
            } else {
                videoRef.current.play().catch(() => { })
                setCenterPlayIcon('play')
                showControlsTemporarily()
            }
            setTimeout(() => setCenterPlayIcon(null), 600)
        }, [isPlaying, showControlsTemporarily])

        const handleKeyboardVolume = useCallback((delta: number) => {
            setVolume(prev => {
                let newVol = Math.max(0, Math.min(1, prev + delta))
                newVol = parseFloat(newVol.toFixed(2))
                if (videoRef.current) {
                    videoRef.current.volume = newVol
                    videoRef.current.muted = newVol === 0
                }
                const isNowMuted = newVol === 0
                setIsMuted(isNowMuted)
                setVolumeOverlay({ show: true, val: newVol, muted: isNowMuted })
                if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current)
                volumeTimeoutRef.current = setTimeout(() => setVolumeOverlay(null), 1000)
                return newVol
            })
        }, [])

        const handleKeyboardSeek = useCallback((direction: 'left' | 'right') => {
            if (!videoRef.current) return
            const step = direction === 'right' ? 10 : -10
            seekAccumulatorRef.current += step
            const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + step))
            videoRef.current.currentTime = newTime
            setCurrentTime(newTime)
            setSeekOverlay({
                show: true,
                type: direction === 'right' ? 'forward' : 'rewind',
                seconds: Math.abs(seekAccumulatorRef.current)
            })
            if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current)
            seekTimeoutRef.current = setTimeout(() => {
                setSeekOverlay(null)
                seekAccumulatorRef.current = 0
            }, 800)
            showControlsTemporarily()
        }, [duration, showControlsTemporarily])

        const toggleFullscreen = useCallback(async () => {
            if (!containerRef.current) return
            if (document.fullscreenElement) {
                await document.exitFullscreen()
                setIsFullscreen(false)
            } else {
                await containerRef.current.requestFullscreen()
                setIsFullscreen(true)
            }
        }, [])

        // Video Event Listeners
        useEffect(() => {
            const video = videoRef.current
            if (!video) return
            const onTimeUpdate = () => setCurrentTime(video.currentTime)
            const onDurationChange = () => setDuration(video.duration)
            const onPlay = () => { setIsPlaying(true); setHasPlayedOnce(true); }
            const onPause = () => setIsPlaying(false)
            const onWaiting = () => setIsBuffering(true)
            const onPlaying = () => setIsBuffering(false)
            const onProgress = () => { if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1)) }

            video.addEventListener('timeupdate', onTimeUpdate)
            video.addEventListener('durationchange', onDurationChange)
            video.addEventListener('play', onPlay)
            video.addEventListener('pause', onPause)
            video.addEventListener('waiting', onWaiting)
            video.addEventListener('playing', onPlaying)
            video.addEventListener('progress', onProgress)
            return () => {
                video.removeEventListener('timeupdate', onTimeUpdate)
                video.removeEventListener('durationchange', onDurationChange)
                video.removeEventListener('play', onPlay)
                video.removeEventListener('pause', onPause)
                video.removeEventListener('waiting', onWaiting)
                video.removeEventListener('playing', onPlaying)
                video.removeEventListener('progress', onProgress)
            }
        }, [])

        // Seek Handling
        const handleSeekStart = () => { setIsDragging(true) }
        const handleSeekMove = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
            if (!progressRef.current || !videoRef.current) return
            const rect = progressRef.current.getBoundingClientRect()
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
            const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
            const seekTime = percentage * duration
            if (isDragging) { videoRef.current.currentTime = seekTime; setCurrentTime(seekTime) }
        }, [duration, isDragging])
        const handleSeekEnd = useCallback(() => { setIsDragging(false); if (isPlaying) showControlsTemporarily() }, [isPlaying, showControlsTemporarily])

        useEffect(() => {
            if (isDragging) {
                window.addEventListener('mousemove', handleSeekMove as (e: MouseEvent) => void)
                window.addEventListener('mouseup', handleSeekEnd)
                window.addEventListener('touchmove', handleSeekMove as (e: TouchEvent) => void)
                window.addEventListener('touchend', handleSeekEnd)
            }
            return () => {
                window.removeEventListener('mousemove', handleSeekMove as (e: MouseEvent) => void)
                window.removeEventListener('mouseup', handleSeekEnd)
                window.removeEventListener('touchmove', handleSeekMove as (e: TouchEvent) => void)
                window.removeEventListener('touchend', handleSeekEnd)
            }
        }, [isDragging, handleSeekMove, handleSeekEnd])

        const formatTime = (seconds: number) => {
            if (isNaN(seconds)) return '00:00'
            const date = new Date(seconds * 1000)
            const hh = date.getUTCHours()
            const mm = date.getUTCMinutes()
            const ss = date.getUTCSeconds().toString().padStart(2, '0')
            if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
            return `${mm}:${ss}`
        }
        useEffect(() => {
            const handleClickOutside = (e: MouseEvent | TouchEvent) => {
                if (!containerRef.current) return

                // Check if click/tap is outside the video container
                const target = e.target as Node
                if (!containerRef.current.contains(target)) {
                    // Hide controls when clicking outside
                    if (isPlaying) {
                        setShowControls(false)
                        if (controlsTimeoutRef.current) {
                            clearTimeout(controlsTimeoutRef.current)
                        }
                    }
                }
            }

            // Add listeners for both mouse and touch events
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('touchstart', handleClickOutside)

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
                document.removeEventListener('touchstart', handleClickOutside)
            }
        }, [isPlaying])

        const VolumeIcon = isMuted || volume === 0 ? VolumeX : Volume2

        return (
            <div
                ref={containerRef}
                className={`${styles.player} ${isFullscreen ? styles.fullscreen : ''} ${!showControls && isPlaying ? styles.hideCursor : ''} ${className || ''}`}
                onMouseMove={showControlsTemporarily}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                onClick={handleContainerClick} // Mobile tap handling
                onDoubleClick={toggleFullscreen}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
                    if (e.key === 'f') { toggleFullscreen(); }
                    if (e.key === 'ArrowRight') { handleKeyboardSeek('right'); }
                    if (e.key === 'ArrowLeft') { handleKeyboardSeek('left'); }
                }}
            >
                <div ref={videoWrapperRef} className={styles.videoWrapper}>
                    {poster && !hasPlayedOnce && (
                        <Image
                            src={poster}
                            alt={title}
                            fill
                            className={styles.poster}
                            priority
                        />
                    )}
                    <video
                        ref={videoRef}
                        src={blobUrl || src}
                        className={styles.video}
                        playsInline
                        style={{ transform: `scale(${zoomState.scale}) translate(${zoomState.translateX}px, ${zoomState.translateY}px)` }}
                    />
                </div>

                {/* Overlays (Center Play, Seek, Volume) */}
                <div className={styles.overlayLayer}>
                    {centerPlayIcon && (
                        <div className={styles.centerPulse}>
                            {centerPlayIcon === 'play' ? <Play fill="white" size={60} /> : <Pause fill="white" size={60} />}
                        </div>
                    )}
                    {seekOverlay && (
                        <div className={styles.seekOverlay}>
                            <div className={styles.seekIconWrapper}>
                                {seekOverlay.type === 'forward' ? <ChevronsRight size={48} /> : <ChevronsLeft size={48} />}
                            </div>
                            <span className={styles.seekText}>{seekOverlay.type === 'forward' ? '+' : '-'}{seekOverlay.seconds}s</span>
                        </div>
                    )}
                    {volumeOverlay && (
                        <div className={styles.volumeBezel}>
                            <VolumeIcon size={32} />
                            <div className={styles.bezelBar}>
                                <div className={styles.bezelFill} style={{ width: `${volumeOverlay.muted ? 0 : volumeOverlay.val * 100}%` }} />
                            </div>
                            <span className={styles.bezelText}>{volumeOverlay.muted ? '0%' : Math.round(volumeOverlay.val * 100) + '%'}</span>
                        </div>
                    )}
                    {(isBuffering || isLoading) && <div className={styles.loader}><div className={styles.spinner}></div></div>}
                </div>

                {/* --- CONTROLS BAR --- */}
                {/* ✅ STOP PROPAGATION HERE TO FIX BUTTON CLICK ISSUE */}
                <div
                    className={`${styles.controlsOverlay} ${showControls ? styles.visible : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.controlsContent}>
                        {/* Progress Bar */}
                        <div
                            className={styles.progressBarContainer}
                            ref={progressRef}
                            onMouseDown={handleSeekStart}
                            onTouchStart={handleSeekStart}
                            onMouseMove={(e) => {
                                if (!progressRef.current) return
                                const rect = progressRef.current.getBoundingClientRect()
                                setHoverPosition(e.clientX - rect.left)
                                setHoverTime(((e.clientX - rect.left) / rect.width) * duration)
                                setShowThumbnailPreview(true)
                            }}
                            onMouseLeave={() => setShowThumbnailPreview(false)}
                        >
                            {showThumbnailPreview && hoverTime !== null && (
                                <div className={styles.thumbnailTooltip} style={{ left: hoverPosition }}>
                                    <div className={styles.tooltipTime}>{formatTime(hoverTime)}</div>
                                </div>
                            )}
                            <div className={styles.progressTrack}>
                                <div className={styles.progressBuffered} style={{ width: `${(buffered / duration) * 100}%` }} />
                                <div className={styles.progressCurrent} style={{ width: `${(currentTime / duration) * 100}%` }}>
                                    <div className={styles.scrubber} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row Buttons */}
                        <div className={styles.controlsRow}>
                            <div className={styles.leftControls}>
                                <button onClick={togglePlay} className={styles.iconBtn}>
                                    {isPlaying ? <Pause fill="white" /> : <Play fill="white" />}
                                </button>

                                <div className={styles.volumeContainer}>
                                    <button onClick={() => handleKeyboardVolume(isMuted ? 0.5 : -1)} className={styles.iconBtn}>
                                        <VolumeIcon />
                                    </button>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => handleKeyboardVolume(parseFloat(e.target.value) - volume)}
                                        className={styles.volumeSlider}
                                    />
                                </div>

                                <div className={styles.timeDisplay}>
                                    <span>{formatTime(currentTime)}</span>
                                    <span className={styles.timeSeparator}>/</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className={styles.rightControls}>
                                <button className={styles.iconBtn} onClick={() => document.pictureInPictureElement ? document.exitPictureInPicture() : videoRef.current?.requestPictureInPicture()}><PictureInPicture2 size={20} /></button>
                                <button onClick={toggleFullscreen} className={styles.iconBtn}>{isFullscreen ? <Minimize /> : <Maximize />}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)

VideoPlayer.displayName = 'VideoPlayer'
export default VideoPlayer