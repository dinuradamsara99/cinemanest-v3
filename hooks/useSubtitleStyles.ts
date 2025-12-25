'use client'

import { useState, useEffect } from 'react'
import type { SubtitleStylePreferences, PlayerPreferences } from '@/types/player'
import { DEFAULT_PLAYER_PREFERENCES } from '@/types/player'

const STORAGE_KEY = 'netflix-player-preferences'

// Helper function to get font size in rem
const getFontSize = (size: SubtitleStylePreferences['fontSize']): string => {
    switch (size) {
        case 'small': return '1rem'
        case 'medium': return '1.25rem'
        case 'large': return '1.5rem'
        default: return '1.25rem'
    }
}

// Helper function to get font family
const getFontFamily = (family: SubtitleStylePreferences['fontFamily']): string => {
    switch (family) {
        case 'sans-serif': return "'Inter', 'Helvetica Neue', sans-serif"
        case 'serif': return "'Georgia', 'Times New Roman', serif"
        case 'default':
        default:
            return "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }
}

// Helper function to get background color
const getBackgroundColor = (bg: SubtitleStylePreferences['backgroundColor']): string => {
    switch (bg) {
        case 'transparent': return 'transparent'
        case 'semi-black': return 'rgba(0, 0, 0, 0.75)'
        case 'solid-black': return 'rgba(0, 0, 0, 0.95)'
        default: return 'rgba(0, 0, 0, 0.75)'
    }
}

export function useSubtitleStyles() {
    const [preferences, setPreferences] = useState<PlayerPreferences>(DEFAULT_PLAYER_PREFERENCES)

    // Load preferences from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as PlayerPreferences
                setPreferences(parsed)
            }
        } catch (error) {
            console.error('Failed to load player preferences:', error)
        }
    }, [])

    // Apply subtitle styles using ::cue CSS
    useEffect(() => {
        const styles = preferences.subtitle.styles
        const styleId = 'custom-subtitle-styles'

        let styleEl = document.getElementById(styleId) as HTMLStyleElement

        if (!styleEl) {
            styleEl = document.createElement('style')
            styleEl.id = styleId
            document.head.appendChild(styleEl)
        }

        // Apply ::cue styles
        styleEl.textContent = `
            video::cue {
                font-size: ${getFontSize(styles.fontSize)};
                font-family: ${getFontFamily(styles.fontFamily)};
                color: ${styles.textColor};
                background-color: ${getBackgroundColor(styles.backgroundColor)};
                text-shadow: ${styles.textShadow ? '2px 2px 4px rgba(0, 0, 0, 0.9)' : 'none'};
                line-height: 1.4;
                padding: 0.2em 0.4em;
            }

            video::cue-region {
                ${styles.position === 'raised' ? 'bottom: 15%;' : 'bottom: 5%;'}
            }
        `

        return () => {
            // Cleanup on unmount
            const el = document.getElementById(styleId)
            if (el) {
                el.remove()
            }
        }
    }, [preferences.subtitle.styles])

    // Save preferences to localStorage whenever they change
    const savePreferences = (newPrefs: PlayerPreferences) => {
        setPreferences(newPrefs)
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs))
        } catch (error) {
            console.error('Failed to save player preferences:', error)
        }
    }

    // Update subtitle styles
    const updateSubtitleStyles = (styles: Partial<SubtitleStylePreferences>) => {
        const newPrefs = {
            ...preferences,
            subtitle: {
                ...preferences.subtitle,
                styles: {
                    ...preferences.subtitle.styles,
                    ...styles
                }
            }
        }
        savePreferences(newPrefs)
    }

    // Reset subtitle styles to default
    const resetSubtitleStyles = () => {
        const newPrefs = {
            ...preferences,
            subtitle: {
                ...preferences.subtitle,
                styles: DEFAULT_PLAYER_PREFERENCES.subtitle.styles
            }
        }
        savePreferences(newPrefs)
    }

    // Update subtitle track selection
    const updateSubtitleTrack = (trackLanguage: string | null) => {
        const newPrefs = {
            ...preferences,
            subtitle: {
                ...preferences.subtitle,
                selectedTrack: trackLanguage,
                enabled: trackLanguage !== null
            }
        }
        savePreferences(newPrefs)
    }

    // Update volume and mute
    const updateVolume = (volume: number, muted: boolean) => {
        const newPrefs = {
            ...preferences,
            volume,
            muted
        }
        savePreferences(newPrefs)
    }

    return {
        preferences,
        subtitleStyles: preferences.subtitle.styles,
        updateSubtitleStyles,
        resetSubtitleStyles,
        updateSubtitleTrack,
        updateVolume,
        savePreferences
    }
}
