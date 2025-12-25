'use client'

import { useEffect } from 'react'

interface UseKeyboardShortcutsProps {
    onPlayPause: () => void
    onSeekBackward: () => void
    onSeekForward: () => void
    onVolumeUp: () => void
    onVolumeDown: () => void
    onToggleFullscreen: () => void
    onToggleMute: () => void
    onToggleSubtitles: () => void
    enabled?: boolean
}

export function useKeyboardShortcuts({
    onPlayPause,
    onSeekBackward,
    onSeekForward,
    onVolumeUp,
    onVolumeDown,
    onToggleFullscreen,
    onToggleMute,
    onToggleSubtitles,
    enabled = true
}: UseKeyboardShortcutsProps) {
    useEffect(() => {
        if (!enabled) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return
            }

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault()
                    onPlayPause()
                    break

                case 'arrowleft':
                case 'j':
                    e.preventDefault()
                    onSeekBackward()
                    break

                case 'arrowright':
                case 'l':
                    e.preventDefault()
                    onSeekForward()
                    break

                case 'arrowup':
                    e.preventDefault()
                    onVolumeUp()
                    break

                case 'arrowdown':
                    e.preventDefault()
                    onVolumeDown()
                    break

                case 'f':
                    e.preventDefault()
                    onToggleFullscreen()
                    break

                case 'm':
                    e.preventDefault()
                    onToggleMute()
                    break

                case 'c':
                    e.preventDefault()
                    onToggleSubtitles()
                    break

                default:
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [
        enabled,
        onPlayPause,
        onSeekBackward,
        onSeekForward,
        onVolumeUp,
        onVolumeDown,
        onToggleFullscreen,
        onToggleMute,
        onToggleSubtitles
    ])
}
