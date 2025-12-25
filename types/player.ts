// TypeScript interfaces for the Netflix-style video player

export interface SubtitleTrack {
    label: string
    src: string
    language: string
    default?: boolean
}

export interface SubtitleStylePreferences {
    fontSize: 'small' | 'medium' | 'large'
    fontFamily: 'default' | 'sans-serif' | 'serif'
    textColor: string
    backgroundColor: 'transparent' | 'semi-black' | 'solid-black'
    textShadow: boolean
    position: 'bottom' | 'raised'
}

export interface PlayerPreferences {
    subtitle: {
        enabled: boolean
        selectedTrack: string | null
        styles: SubtitleStylePreferences
    }
    volume: number
    muted: boolean
}

export interface NetflixVideoPlayerProps {
    videoUrl: string
    subtitles?: SubtitleTrack[]
    poster?: string
    title?: string
    autoPlay?: boolean
    onEnded?: () => void
    className?: string
}

// Default subtitle style preferences
export const DEFAULT_SUBTITLE_STYLES: SubtitleStylePreferences = {
    fontSize: 'medium',
    fontFamily: 'default',
    textColor: '#FFFFFF',
    backgroundColor: 'semi-black',
    textShadow: true,
    position: 'bottom'
}

// Default player preferences
export const DEFAULT_PLAYER_PREFERENCES: PlayerPreferences = {
    subtitle: {
        enabled: true,
        selectedTrack: null,
        styles: DEFAULT_SUBTITLE_STYLES
    },
    volume: 1,
    muted: false
}
