'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
    Play, Pause, Volume2, VolumeX, Volume1,
    Maximize, Minimize,
    ChevronsRight, ChevronsLeft
} from 'lucide-react'
import styles from './VideoPlayer.module.css'

export interface Subtitle {
    url: string
    label: string
    language: string
    kind?: 'subtitles' | 'captions' | 'descriptions'
    default?: boolean
}

interface VideoPlayerProps {
    videoUrl: string
    subtitleUrl?: string
    subtitles?: Subtitle[]
    poster?: string
    title?: string
    autoPlay?: boolean
    className?: string
}

const VideoPlayerWithSubtitles: React.FC<VideoPlayerProps> = ({
    videoUrl,
    subtitleUrl,
    subtitles = [],
    poster,
    autoPlay = false,
    className = '',
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const playPromiseRef = useRef<Promise<void> | null>(null)

    // --- State ---
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [buffered, setBuffered] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isWaiting, setIsWaiting] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [error, setError] = useState(false)

    // Subtitle State
    const [convertedSubtitles, setConvertedSubtitles] = useState<Subtitle[]>([])
    const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number>(-1)

    // Animation Feedback State
    const [feedback, setFeedback] = useState<{ type: 'vol-up' | 'vol-down' | 'mute' | 'forward' | 'rewind', value?: string } | null>(null)
    const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // --- 1. Animation Trigger Helper ---
    const triggerFeedback = useCallback((type: 'vol-up' | 'vol-down' | 'mute' | 'forward' | 'rewind', value?: string) => {
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
        setFeedback({ type, value })
        // Clear animation after 600ms
        feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 600)
    }, [])

    // --- 2. Action Helpers ---

    const togglePlay = useCallback(() => {
        if (!videoRef.current) return
        if (videoRef.current.paused) {
            playPromiseRef.current = videoRef.current.play()
            playPromiseRef.current.catch(() => { /* Ignore abort errors */ })
            setIsPlaying(true)
        } else {
            videoRef.current.pause()
            setIsPlaying(false)
        }
    }, [])

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`)
            })
        } else {
            document.exitFullscreen()
        }
    }, [])

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return
        const newMuted = !isMuted
        videoRef.current.muted = newMuted
        setIsMuted(newMuted)

        // Feedback Logic
        if (newMuted) {
            triggerFeedback('mute')
        } else {
            if (volume === 0) {
                // If unmuting from 0, set to 50%
                const defaultVol = 0.5
                setVolume(defaultVol)
                videoRef.current.volume = defaultVol
                triggerFeedback('vol-up', '50%')
            } else {
                triggerFeedback('vol-up', `${Math.round(volume * 100)}%`)
            }
        }
    }, [isMuted, volume, triggerFeedback])

    const skip = useCallback((amount: number) => {
        if (!videoRef.current) return
        videoRef.current.currentTime += amount
        // Trigger Animation
        triggerFeedback(amount > 0 ? 'forward' : 'rewind', `${Math.abs(amount)}s`)
    }, [triggerFeedback])

    const adjustVolume = useCallback((amount: number) => {
        if (!videoRef.current) return
        let newVol = videoRef.current.volume + amount
        if (newVol > 1) newVol = 1
        if (newVol < 0) newVol = 0

        videoRef.current.volume = newVol
        setVolume(newVol)
        setIsMuted(newVol === 0)

        // Trigger Animation
        const percent = Math.round(newVol * 100)
        triggerFeedback(amount > 0 ? 'vol-up' : 'vol-down', `${percent}%`)
    }, [triggerFeedback])

    // --- 3. Keyboard Listeners ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault()
                    togglePlay()
                    break
                case 'f':
                    e.preventDefault()
                    toggleFullscreen()
                    break
                case 'm':
                    e.preventDefault()
                    toggleMute()
                    break
                case 'arrowright':
                    e.preventDefault()
                    skip(5)
                    break
                case 'arrowleft':
                    e.preventDefault()
                    skip(-5)
                    break
                case 'arrowup':
                    e.preventDefault()
                    adjustVolume(0.1)
                    break
                case 'arrowdown':
                    e.preventDefault()
                    adjustVolume(-0.1)
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [togglePlay, toggleFullscreen, toggleMute, skip, adjustVolume])

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    // --- 4. Subtitle Logic ---
    const allSubtitles: Subtitle[] = React.useMemo(() => {
        const subs = [...subtitles]
        if (subtitleUrl && !subs.some(s => s.url === subtitleUrl)) {
            subs.push({
                url: subtitleUrl,
                label: 'Default',
                language: 'en',
                kind: 'subtitles',
                default: subs.length === 0,
            })
        }
        return subs
    }, [subtitleUrl, subtitles])

    useEffect(() => {
        const convertSubtitles = async () => {
            const converted = await Promise.all(
                allSubtitles.map(async (subtitle) => {
                    if (subtitle.url.toLowerCase().endsWith('.srt')) {
                        try {
                            const response = await fetch(subtitle.url)
                            const txt = await response.text()
                            const vtt = 'WEBVTT\n\n' + txt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
                            const blob = new Blob([vtt], { type: 'text/vtt' })
                            return { ...subtitle, url: URL.createObjectURL(blob) }
                        } catch {
                            return subtitle
                        }
                    }
                    return subtitle
                })
            )
            setConvertedSubtitles(converted)
            if (converted.length > 0) setActiveSubtitleIndex(0)
        }
        if (allSubtitles.length > 0) convertSubtitles()

        return () => {
            convertedSubtitles.forEach(s => {
                if (s.url.startsWith('blob:')) URL.revokeObjectURL(s.url)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allSubtitles])

    useEffect(() => {
        if (videoRef.current && activeSubtitleIndex !== -1) {
            const tracks = videoRef.current.textTracks
            if (tracks && tracks[activeSubtitleIndex]) {
                for (let i = 0; i < tracks.length; i++) {
                    tracks[i].mode = 'hidden'
                }
                tracks[activeSubtitleIndex].mode = 'showing'
            }
        }
    }, [activeSubtitleIndex, convertedSubtitles])

    // --- 5. Video Event Handlers ---
    const handleTimeUpdate = () => {
        if (!videoRef.current) return
        setCurrentTime(videoRef.current.currentTime)

        if (videoRef.current.buffered.length > 0) {
            const currentT = videoRef.current.currentTime
            // Find active buffer
            let bufferEnd = 0
            for (let i = 0; i < videoRef.current.buffered.length; i++) {
                if (videoRef.current.buffered.start(i) <= currentT && videoRef.current.buffered.end(i) >= currentT) {
                    bufferEnd = videoRef.current.buffered.end(i)
                    break
                }
            }
            // Fallback for visual continuity
            if (bufferEnd === 0 && videoRef.current.buffered.length > 0) {
                bufferEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
            }
            setBuffered(bufferEnd)
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value)
        setVolume(vol)
        if (videoRef.current) {
            videoRef.current.volume = vol
            videoRef.current.muted = vol === 0
        }
        setIsMuted(vol === 0)
    }

    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500)
        }
    }

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00"
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    if (error) {
        return (
            <div className={`${styles.playerWrapper} ${className}`}>
                <div className={styles.errorState}>
                    <span style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</span>
                    <p>Unable to load video</p>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className={`${styles.playerWrapper} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onDoubleClick={toggleFullscreen}
        >
            <video
                ref={videoRef}
                src={videoUrl}
                poster={poster}
                className={styles.videoElement}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onWaiting={() => setIsWaiting(true)}
                onPlaying={() => {
                    setIsWaiting(false)
                    setIsPlaying(true)
                }}
                onPause={() => setIsPlaying(false)}
                onError={() => setError(true)}
                crossOrigin="anonymous"
                playsInline
                autoPlay={autoPlay}
            >
                {convertedSubtitles.map((sub, idx) => (
                    <track
                        key={idx}
                        src={sub.url}
                        kind={sub.kind || 'subtitles'}
                        label={sub.label}
                        srcLang={sub.language}
                        default={sub.default}
                    />
                ))}
            </video>

            {/* --- Center Layer (Play Button / Loader) --- */}
            <div className={styles.centerOverlay}>
                {isWaiting ? (
                    <div className={styles.loader}></div>
                ) : (
                    !isPlaying && (
                        <button onClick={togglePlay} className={styles.bigPlayButton}>
                            {/* size={32} අයින් කළා, දැන් CSS වලින් size එක හැදෙනවා */}
                            <Play strokeWidth={3} />
                        </button>
                    )
                )}
            </div>

            {/* --- ANIMATIONS: Feedback Overlay --- */}
            {feedback && (
                <>
                    {/* Volume / Mute Feedback */}
                    {(feedback.type === 'vol-up' || feedback.type === 'vol-down' || feedback.type === 'mute') && (
                        <div className={styles.feedbackOverlay}>
                            {feedback.type === 'mute' ? <VolumeX className={styles.feedbackIcon} /> :
                                feedback.type === 'vol-up' ? <Volume2 className={styles.feedbackIcon} /> :
                                    <Volume1 className={styles.feedbackIcon} />}
                            <span className={styles.feedbackText}>
                                {feedback.type === 'mute' ? 'Muted' : feedback.value}
                            </span>
                        </div>
                    )}

                    {/* Forward Animation */}
                    {feedback.type === 'forward' && (
                        <div className={styles.skipOverlayRight}>
                            <div className={styles.skipContent}>
                                <ChevronsRight className={styles.skipIcon} size={50} />
                                <span className={styles.skipText}>+{feedback.value}</span>
                            </div>
                        </div>
                    )}

                    {/* Rewind Animation */}
                    {feedback.type === 'rewind' && (
                        <div className={styles.skipOverlayLeft}>
                            <div className={styles.skipContent}>
                                <ChevronsLeft className={styles.skipIcon} size={50} />
                                <span className={styles.skipText}>-{feedback.value}</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* --- Bottom Controls --- */}
            <div className={`${styles.controlsOverlay} ${showControls || !isPlaying ? styles.controlsVisible : ''}`}>

                {/* Progress Bar */}
                <div className={styles.progressContainer}>
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className={styles.progressSlider}
                        step="0.1"
                    />
                    <div className={styles.progressBuffered} style={{ width: `${(buffered / (duration || 1)) * 100}%` }} />
                    <div className={styles.progressFilled} style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                    <div className={styles.scrubberKnob} style={{ left: `${(currentTime / (duration || 1)) * 100}%` }} />
                </div>

                {/* Buttons Row */}
                <div className={styles.controlsRow}>
                    <div className={styles.leftGroup}>
                        <button onClick={togglePlay} className={styles.iconBtn}>
                            {isPlaying ? <Pause className={styles.largeIcon} /> : <Play className={styles.largeIcon} />}
                        </button>

                        <div className={styles.volumeGroup}>
                            <button onClick={toggleMute} className={styles.iconBtn}>
                                {isMuted || volume === 0 ? <VolumeX className={styles.icon} /> : <Volume2 className={styles.icon} />}
                            </button>
                            <div className={styles.volumeSliderContainer}>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className={styles.volumeSlider}
                                />
                            </div>
                        </div>

                        <span className={styles.timeDisplay}>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className={styles.rightGroup}>
                        <button onClick={toggleFullscreen} className={styles.iconBtn}>
                            {isFullscreen ? <Minimize className={styles.icon} /> : <Maximize className={styles.icon} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayerWithSubtitles