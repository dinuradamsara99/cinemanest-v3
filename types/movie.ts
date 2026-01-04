// Language type from Sanity
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
    slug: {
        current: string
    }
    posterImage: {
        asset: {
            _ref: string
            _type: string
        } | {
            _id: string
            url: string
        }
        alt?: string
    }
    bannerImage: {
        asset: {
            _ref: string
            _type: string
        } | {
            _id: string
            url: string
        }
        alt?: string
    }
    rating: number
    isFeatured?: boolean
    isTrending?: boolean
    description?: string
    releaseYear: number
    duration?: number
    genre?: string[]
    videoUrl?: string
    trailerUrl?: string
    credit?: string
    seasons?: Season[]
    language?: Language
    categories?: Category[]
    subtitles?: SubtitleTrack[]
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
