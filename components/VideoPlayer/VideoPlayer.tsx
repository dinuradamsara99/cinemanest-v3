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
    Maximize,
    Minimize,
    PictureInPicture2,
    ChevronsRight,
    ChevronsLeft,
    RotateCcw,
    Settings,
    Check
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
    primaryColor?: string
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
    ({ src, poster, autoPlay = false, className, primaryColor = '#E50914' }, ref) => {
        // Refs
        const containerRef = useRef<HTMLDivElement>(null)
        const videoRef = useRef<HTMLVideoElement>(null)
        const progressRef = useRef<HTMLDivElement>(null)
        const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
        const lastClickTimeRef = useRef<number>(0)
        const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
        const [hasEnded, setHasEnded] = useState(false)
        const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null)

        // Advanced State
        const [playbackSpeed, setPlaybackSpeed] = useState(1)
        const [showSettings, setShowSettings] = useState(false)

        // Interaction State
        const [isDragging, setIsDragging] = useState(false)
        const [hoverTime, setHoverTime] = useState<number | null>(null)
        const [hoverPosition, setHoverPosition] = useState(0)

        // Animations
        const [skipAnimation, setSkipAnimation] = useState<'left' | 'right' | null>(null)
        const [centerIcon, setCenterIcon] = useState<'play' | 'pause' | null>(null)

        useImperativeHandle(ref, () => ({
            play: () => videoRef.current?.play(),
            pause: () => videoRef.current?.pause(),
            seek: (time: number) => { if (videoRef.current) videoRef.current.currentTime = time },
            getVideo: () => videoRef.current,
        }))

        // --- Controls Visibility ---
        const handleMouseMove = useCallback(() => {
            setShowControls(true)
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
            if (isPlaying && !isDragging && !showSettings) {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false)
                    setShowSettings(false)
                }, 2500)
            }
        }, [isPlaying, isDragging, showSettings])

        useEffect(() => {
            if (!isPlaying) {
                setShowControls(true)
                if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
            } else {
                handleMouseMove()
            }
        }, [isPlaying, handleMouseMove])

        // --- Playback Logic ---
        const togglePlay = useCallback(() => {
            if (!videoRef.current) return
            if (videoRef.current.paused || videoRef.current.ended) {
                videoRef.current.play().catch(console.error)
                setCenterIcon('play')
            } else {
                videoRef.current.pause()
                setCenterIcon('pause')
            }
            setShowSettings(false)
            setTimeout(() => setCenterIcon(null), 600)
        }, [])

        const handleVolumeChange = (newVolume: number) => {
            if (!videoRef.current) return
            const v = Math.max(0, Math.min(1, newVolume))
            videoRef.current.volume = v
            videoRef.current.muted = v === 0
            setVolume(v)
            setIsMuted(v === 0)
        }

        const toggleMute = () => {
            if (!videoRef.current) return
            const nextState = !isMuted
            videoRef.current.muted = nextState
            setIsMuted(nextState)
            if (!nextState && volume === 0) handleVolumeChange(0.5)
        }

        const skip = (seconds: number) => {
            if (!videoRef.current) return
            const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
            videoRef.current.currentTime = newTime
            setCurrentTime(newTime)
            handleMouseMove()
            
            // Only show animation if NOT buffering (User Request)
            if (!isBuffering) {
                setSkipAnimation(seconds > 0 ? 'right' : 'left')
                setTimeout(() => setSkipAnimation(null), 500)
            }
        }

        const handleSmartClick = (e: React.MouseEvent | React.TouchEvent) => {
            if ((e.target as HTMLElement).closest(`.${styles.controlsOverlay}`)) return
            if ((e.target as HTMLElement).closest(`.${styles.settingsMenu}`)) return
            
            // Close settings if open
            if (showSettings) {
                setShowSettings(false)
                return
            }

            const now = Date.now()
            if (now - lastClickTimeRef.current < 300) {
                // Double Click
                if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
                const rect = containerRef.current?.getBoundingClientRect()
                if (rect) {
                    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX
                    const clickX = clientX - rect.left
                    clickX < rect.width / 2 ? skip(-10) : skip(10)
                }
            } else {
                // Single Click
                clickTimeoutRef.current = setTimeout(() => togglePlay(), 300)
            }
            lastClickTimeRef.current = now
        }

        // --- Seek Logic ---
        const handleSeekStart = () => setIsDragging(true)
        const handleSeekMove = useCallback((e: MouseEvent | TouchEvent) => {
            if (!progressRef.current || !videoRef.current) return
            const rect = progressRef.current.getBoundingClientRect()
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
            const time = percent * duration
            if (isDragging) {
                videoRef.current.currentTime = time
                setCurrentTime(time)
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

        // --- Event Listeners ---
        useEffect(() => {
            const video = videoRef.current
            if (!video) return

            const updateTime = () => setCurrentTime(video.currentTime)
            const updateDur = () => setDuration(video.duration)
            const onWaiting = () => setIsBuffering(true)
            const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); setHasEnded(false) }
            const onPause = () => setIsPlaying(false)
            const onEnded = () => { setIsPlaying(false); setHasEnded(true); setShowControls(true) }
            const onProgress = () => {
                if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1))
            }
            const onLoadedMeta = () => {
                setDuration(video.duration)
                if (video.videoWidth && video.videoHeight) {
                    setVideoAspectRatio(video.videoWidth / video.videoHeight)
                }
            }

            video.addEventListener('timeupdate', updateTime)
            video.addEventListener('durationchange', updateDur)
            video.addEventListener('waiting', onWaiting)
            video.addEventListener('playing', onPlaying)
            video.addEventListener('pause', onPause)
            video.addEventListener('ended', onEnded)
            video.addEventListener('progress', onProgress)
            video.addEventListener('loadedmetadata', onLoadedMeta)

            return () => {
                video.removeEventListener('timeupdate', updateTime)
                video.removeEventListener('durationchange', updateDur)
                video.removeEventListener('waiting', onWaiting)
                video.removeEventListener('playing', onPlaying)
                video.removeEventListener('pause', onPause)
                video.removeEventListener('ended', onEnded)
                video.removeEventListener('progress', onProgress)
                video.removeEventListener('loadedmetadata', onLoadedMeta)
            }
        }, [])

        const changeSpeed = (rate: number) => {
            if (videoRef.current) {
                videoRef.current.playbackRate = rate
                setPlaybackSpeed(rate)
                setShowSettings(false)
            }
        }

        const toggleFullscreen = async () => {
            if (!containerRef.current) return
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen()
                setIsFullscreen(true)
            } else {
                await document.exitFullscreen()
                setIsFullscreen(false)
            }
        }

        const formatTime = (t: number) => {
            const m = Math.floor(t / 60)
            const s = Math.floor(t % 60)
            return `${m}:${s < 10 ? '0' : ''}${s}`
        }

        return (
            <div
                ref={containerRef}
                className={`${styles.player} ${isFullscreen ? styles.fullscreen : ''} ${!showControls && isPlaying ? styles.hideCursor : ''} ${className || ''}`}
                style={{ 
                    aspectRatio: videoAspectRatio ? `${videoAspectRatio}` : '16/9',
                    '--primary-color': primaryColor 
                } as React.CSSProperties}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                onClick={handleSmartClick}
            >
                <video
                    ref={videoRef}
                    src={src}
                    className={styles.video}
                    poster={poster}
                    playsInline
                />

                {/* --- OVERLAYS --- */}
                <div className={styles.overlayLayer}>
                    {/* Buffering Loader (Supersedes everything else) */}
                    {isBuffering && (
                        <div className={styles.loader}>
                            <div className={styles.spinner}></div>
                        </div>
                    )}

                    {/* Animations - Only show if NOT buffering */}
                    {!isBuffering && (
                        <>
                            {/* Skip Animation */}
                            {skipAnimation && (
                                <div className={`${styles.skipOverlay} ${skipAnimation === 'right' ? styles.right : styles.left}`}>
                                    {skipAnimation === 'right' ? <ChevronsRight size={36} /> : <ChevronsLeft size={36} />}
                                    <span>{skipAnimation === 'right' ? '+10s' : '-10s'}</span>
                                </div>
                            )}

                            {/* Center Icon Pulse */}
                            {centerIcon && (
                                <div className={styles.centerPulse}>
                                    {centerIcon === 'play' ? <Play fill="white" size={48} /> : <Pause fill="white" size={48} />}
                                </div>
                            )}

                            {/* Replay Button */}
                            {hasEnded && (
                                <button onClick={() => videoRef.current?.play()} className={styles.replayBtn}>
                                    <RotateCcw size={48} />
                                    <span>Replay</span>
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* --- CONTROLS --- */}
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
                        {hoverTime !== null && hoverTime >= 0 && (
                            <div className={styles.thumbnailTooltip} style={{ left: hoverPosition }}>
                                {formatTime(hoverTime)}
                            </div>
                        )}
                        
                        <div className={styles.progressTrack}>
                            <div className={styles.progressBuffered} style={{ width: `${(buffered / duration) * 100}%` }} />
                            <div className={styles.progressCurrent} style={{ width: `${(currentTime / duration) * 100}%` }} />
                            <div className={styles.scrubber} style={{ left: `${(currentTime / duration) * 100}%` }} />
                        </div>
                    </div>

                    <div className={styles.controlsRow}>
                        {/* Left Side */}
                        <div className={styles.leftControls}>
                            <button onClick={togglePlay} className={styles.iconBtn}>
                                {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
                            </button>
                            
                            <div className={styles.volumeGroup}>
                                <button onClick={toggleMute} className={styles.iconBtn}>
                                    {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                    className={styles.volumeSlider}
                                />
                            </div>

                            <div className={styles.timeDisplay}>
                                <span>{formatTime(currentTime)}</span>
                                <span className={styles.separator}>/</span>
                                <span>{formatTime(duration || 0)}</span>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className={styles.rightControls}>
                            {/* Settings Menu */}
                            <div className={styles.settingsContainer}>
                                <button onClick={() => setShowSettings(!showSettings)} className={`${styles.iconBtn} ${showSettings ? styles.active : ''}`}>
                                    <Settings size={20} />
                                </button>
                                {showSettings && (
                                    <div className={styles.settingsMenu}>
                                        <div className={styles.settingsHeader}>Speed</div>
                                        {[0.5, 1, 1.5, 2].map(speed => (
                                            <button 
                                                key={speed} 
                                                onClick={() => changeSpeed(speed)}
                                                className={playbackSpeed === speed ? styles.activeOption : ''}
                                            >
                                                {speed}x
                                                {playbackSpeed === speed && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={() => document.pictureInPictureElement ? document.exitPictureInPicture() : videoRef.current?.requestPictureInPicture()} className={styles.iconBtn}>
                                <PictureInPicture2 size={20} />
                            </button>
                            
                            <button onClick={toggleFullscreen} className={styles.iconBtn}>
                                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
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
