'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface WatchProgress {
    time: number
    duration: number
    updatedAt: number
}

interface WatchProgressData {
    [contentId: string]: WatchProgress
}

interface WatchProgressContextType {
    getProgress: (contentId: string) => WatchProgress | null
    saveProgress: (contentId: string, time: number, duration: number) => void
    clearProgress: (contentId: string) => void
    getAllProgress: () => WatchProgressData
}

const WatchProgressContext = createContext<WatchProgressContextType | undefined>(undefined)

const STORAGE_KEY = 'cinemanest-watch-progress'
const MIN_PROGRESS_SECONDS = 10 // Only save if watched more than 10 seconds
const COMPLETION_THRESHOLD = 0.95 // Consider complete if watched 95%+

export function WatchProgressProvider({ children }: { children: ReactNode }) {
    const [progressData, setProgressData] = useState<WatchProgressData>({})
    const [isLoaded, setIsLoaded] = useState(false)

    // Load progress from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                // Clean up old entries (older than 30 days)
                const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
                const cleaned: WatchProgressData = {}
                Object.entries(parsed).forEach(([key, value]) => {
                    const progress = value as WatchProgress
                    if (progress.updatedAt > thirtyDaysAgo) {
                        cleaned[key] = progress
                    }
                })
                setProgressData(cleaned)
            }
        } catch (error) {
            console.error('Failed to load watch progress:', error)
        }
        setIsLoaded(true)
    }, [])

    // Save to localStorage whenever data changes (after initial load)
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData))
            } catch (error) {
                console.error('Failed to save watch progress:', error)
            }
        }
    }, [progressData, isLoaded])

    const getProgress = useCallback((contentId: string): WatchProgress | null => {
        return progressData[contentId] || null
    }, [progressData])

    const saveProgress = useCallback((contentId: string, time: number, duration: number) => {
        // Don't save if watched less than minimum threshold
        if (time < MIN_PROGRESS_SECONDS) return

        // If nearly complete, clear the progress instead
        if (duration > 0 && time / duration >= COMPLETION_THRESHOLD) {
            setProgressData(prev => {
                const newData = { ...prev }
                delete newData[contentId]
                return newData
            })
            return
        }

        setProgressData(prev => ({
            ...prev,
            [contentId]: {
                time,
                duration,
                updatedAt: Date.now()
            }
        }))
    }, [])

    const clearProgress = useCallback((contentId: string) => {
        setProgressData(prev => {
            const newData = { ...prev }
            delete newData[contentId]
            return newData
        })
    }, [])

    const getAllProgress = useCallback(() => {
        return progressData
    }, [progressData])

    return (
        <WatchProgressContext.Provider
            value={{
                getProgress,
                saveProgress,
                clearProgress,
                getAllProgress
            }}
        >
            {children}
        </WatchProgressContext.Provider>
    )
}

export function useWatchProgress() {
    const context = useContext(WatchProgressContext)
    if (!context) {
        throw new Error('useWatchProgress must be used within WatchProgressProvider')
    }
    return context
}
