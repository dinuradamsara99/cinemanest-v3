// Language type from Sanity
import { SanityImage, SanitySlug } from './sanity';

export interface Language {
    _id: string
    title: string
    slug: {
        current: string
    }
}

// Subtitle track type from Sanity
export interface SubtitleTrack {
    _key: string
    label: string
    language: string
    file: {
        asset: {
            _ref: string
            _type: string
            url?: string
        }
    }
    isDefault?: boolean
}

// Episode type for TV Shows
export interface Episode {

    thumbnailSprite: string | undefined
    _key: string
    episodeNumber: number
    title: string
    overview?: string
    thumbnail?: {
        asset: {
            _ref: string
            _type: string
        }
    }
    videoUrl: string
    iframeUrl?: string
    duration?: number
    subtitles?: SubtitleTrack[]
}

// Season type for TV Shows
export interface Season {
    _key: string
    seasonNumber: number
    title?: string
    episodes: Episode[]
}

// Movie type from Sanity (also used for TV Shows)
export interface Movie {
    thumbnailSprite: string | undefined
    _id: string
    _type?: 'movie' | 'tvshow'
    title: string
    contentType?: 'movie' | 'tvshow'
    slug: SanitySlug
    posterImage: SanityImage
    bannerImage: SanityImage
    rating?: number
    tmdbId?: number
    isFeatured?: boolean
    isTrending?: boolean
    description?: string
    releaseYear?: number // Fetched from TMDB
    duration?: number
    genre?: string[]
    videoUrl?: string
    trailerUrl?: string // Fetched from TMDB
    director?: string // Fetched from TMDB
    cast?: { name: string; character: string; profilePath: string | null }[] // Fetched from TMDB
    credit?: string
    seasons?: Season[]
    language?: Language
    categories?: Category[]
    subtitles?: SubtitleTrack[]
    // TMDB-fetched display fields (separate from CMS fields used for filtering)
    tmdbGenres?: string[]; // Fetched from TMDB
    tmdbOriginalLanguage?: string; // Fetched from TMDB
    tmdbPosterPath?: string; // Fetched from TMDB
    tmdbBackdropPath?: string; // Fetched from TMDB
    tmdbKeywords?: string[]; // Fetched from TMDB
}

// Category type from Sanity
export interface Category {
    _id: string
    title: string
    slug: {
        current: string
    }
    description?: string
    movies?: Movie[]
    movieCount?: number
}
