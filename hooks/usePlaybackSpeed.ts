'use client'

import { useState, useEffect, useCallback, RefObject } from 'react'

const STORAGE_KEY = 'cinemanest-playback-speed'

export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const
export type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number]

interface UsePlaybackSpeedReturn {
    playbackSpeed: PlaybackSpeed
    setPlaybackSpeed: (speed: PlaybackSpeed) => void
    speeds: readonly PlaybackSpeed[]
    getSpeedLabel: (speed: PlaybackSpeed) => string
}

export function usePlaybackSpeed(
    videoRef: RefObject<HTMLVideoElement | null>
): UsePlaybackSpeedReturn {
    const [playbackSpeed, setPlaybackSpeedState] = useState<PlaybackSpeed>(1)

    // Load saved speed from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const parsedSpeed = parseFloat(saved) as PlaybackSpeed
            if (PLAYBACK_SPEEDS.includes(parsedSpeed)) {
                setPlaybackSpeedState(parsedSpeed)
                if (videoRef.current) {
                    videoRef.current.playbackRate = parsedSpeed
                }
            }
        }
    }, [videoRef])

    // Apply playback rate when video element is ready
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed
        }
    }, [videoRef, playbackSpeed])

    // Set playback speed and save to localStorage
    const setPlaybackSpeed = useCallback((speed: PlaybackSpeed) => {
        if (!PLAYBACK_SPEEDS.includes(speed)) return

        setPlaybackSpeedState(speed)

        if (videoRef.current) {
            videoRef.current.playbackRate = speed
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, speed.toString())
        }
    }, [videoRef])

    // Get human-readable label for speed
    const getSpeedLabel = useCallback((speed: PlaybackSpeed): string => {
        if (speed === 1) return 'Normal'
        return `${speed}x`
    }, [])

    return {
        playbackSpeed,
        setPlaybackSpeed,
        speeds: PLAYBACK_SPEEDS,
        getSpeedLabel,
    }
}
