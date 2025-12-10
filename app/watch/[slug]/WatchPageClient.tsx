'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Star, Clock, Calendar, Play, Heart, Tv } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import type { Movie } from '@/types/movie'
import { useWishlist } from '@/context/WishlistContext'
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import EpisodeList from '@/components/EpisodeList/EpisodeList'
import styles from './page.module.css'

type Props = {
    movie: Movie
}

export default function WatchPageClient({ movie }: Props) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()

    // Episode selection state for TV Shows
    const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0)
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)

    // Handle episode selection
    const handleEpisodeSelect = useCallback((seasonIndex: number, episodeIndex: number) => {
        setCurrentSeasonIndex(seasonIndex)
        setCurrentEpisodeIndex(episodeIndex)
    }, [])

    // Determine if this is a TV Show (check both _type from schema and contentType)
    const isTVShow = (movie._type === 'tvshow' || movie.contentType === 'tvshow') && movie.seasons && movie.seasons.length > 0

    // Calculate current video URL
    let currentVideoUrl = movie.videoUrl || ''
    if (isTVShow && movie.seasons) {
        const currentSeason = movie.seasons[currentSeasonIndex]
        const currentEpisode = currentSeason?.episodes?.[currentEpisodeIndex]
        currentVideoUrl = currentEpisode?.videoUrl || ''
    }

    const wishlisted = isInWishlist(movie._id)

    const toggleWishlist = () => {
        if (wishlisted) {
            removeFromWishlist(movie._id)
        } else {
            addToWishlist(movie._id)
        }
    }

    // Check if videoUrl should use iframe (embed links)
    const isEmbedUrl = (() => {
        if (!currentVideoUrl) return false
        const embedPatterns = [
            'youtube.com',
            'youtu.be',
            'vimeo.com',
            'dailymotion.com',
            'streamwish',
            'filemoon',
            'doodstream',
            'upstream.to',
            'mixdrop',
            'hglink.to',
            'streamtape',
            'vidoza',
            'supervideo',
            'embedsito',
            'koyeb.app',
            'workers.dev'
        ]
        return embedPatterns.some(pattern => currentVideoUrl.toLowerCase().includes(pattern))
    })()

    // Get current episode info for display
    const currentEpisodeInfo = isTVShow && movie.seasons
        ? movie.seasons[currentSeasonIndex]?.episodes?.[currentEpisodeIndex]
        : null

    return (
        <main className={styles.main}>
            {/* Back Button */}
            <Link href="/" className={styles.backButton}>
                <ArrowLeft size={20} />
                <span>Back to Home</span>
            </Link>

            {/* Hero Banner Section */}
            <div className={styles.heroSection}>
                <div className={styles.bannerContainer}>
                    {movie.bannerImage?.asset ? (
                        <Image
                            src={urlFor(movie.bannerImage).width(1920).height(800).url()}
                            alt={movie.bannerImage.alt || movie.title}
                            fill
                            className={styles.bannerImage}
                            priority
                        />
                    ) : movie.posterImage?.asset ? (
                        <Image
                            src={urlFor(movie.posterImage).width(1920).height(800).url()}
                            alt={movie.posterImage.alt || movie.title}
                            fill
                            className={styles.bannerImage}
                            priority
                        />
                    ) : (
                        <div className={styles.placeholderBanner}>
                            <Play size={64} />
                        </div>
                    )}
                    <div className={styles.bannerOverlay} />
                </div>

                {/* Movie Info on Banner */}
                <div className={styles.heroContent}>
                    <div className={styles.contentTypeBadge}>
                        {isTVShow ? (
                            <>
                                <Tv size={16} />
                                <span>TV Series</span>
                            </>
                        ) : (
                            <>
                                <Play size={16} />
                                <span>Movie</span>
                            </>
                        )}
                    </div>

                    <h1 className={styles.heroTitle}>{movie.title}</h1>

                    {/* Show current episode for TV Shows */}
                    {isTVShow && currentEpisodeInfo && (
                        <p className={styles.currentEpisode}>
                            S{movie.seasons![currentSeasonIndex].seasonNumber} E{currentEpisodeInfo.episodeNumber}: {currentEpisodeInfo.title}
                        </p>
                    )}

                    <div className={styles.heroMeta}>
                        <div className={styles.rating}>
                            <Star size={20} fill="var(--color-accent)" strokeWidth={0} />
                            <span>{movie.rating.toFixed(1)}</span>
                        </div>
                        {movie.releaseYear && (
                            <span className={styles.metaItem}>
                                <Calendar size={18} />
                                {movie.releaseYear}
                            </span>
                        )}
                        {!isTVShow && movie.duration && (
                            <span className={styles.metaItem}>
                                <Clock size={18} />
                                {movie.duration} min
                            </span>
                        )}
                        {isTVShow && movie.seasons && (
                            <span className={styles.metaItem}>
                                <Tv size={18} />
                                {movie.seasons.length} Season{movie.seasons.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {/* Genres */}
                    {movie.genre && movie.genre.length > 0 && (
                        <div className={styles.genreSection}>
                            {movie.genre.map((genre: string) => (
                                <span key={genre} className={styles.genreTag}>
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Wishlist Button - Icon Only */}
                    <button
                        className={`${styles.wishlistHeroButton} ${wishlisted ? styles.wishlisted : ''}`}
                        onClick={toggleWishlist}
                        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <Heart
                            size={24}
                            fill={wishlisted ? 'currentColor' : 'none'}
                            strokeWidth={2}
                        />
                    </button>
                </div>
            </div>

            {/* Description Section */}
            <div className={styles.container}>
                {movie.description && (
                    <div className={styles.descriptionCard}>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.description}>{movie.description}</p>
                    </div>
                )}

                {/* Video Player Section - Responsive Layout for TV Shows */}
                <div className={`${styles.contentWrapper} ${isTVShow ? styles.tvShowLayout : ''}`}>
                    {/* Video Player */}
                    <div className={styles.videoCard}>
                        <h2 className={styles.sectionTitle}>
                            {isTVShow && currentEpisodeInfo
                                ? `S${movie.seasons![currentSeasonIndex].seasonNumber} E${currentEpisodeInfo.episodeNumber}: ${currentEpisodeInfo.title}`
                                : 'Watch Now'}
                        </h2>
                        {currentVideoUrl ? (
                            isEmbedUrl ? (
                                <div className={styles.videoPlayer}>
                                    <iframe
                                        className={styles.iframe}
                                        src={currentVideoUrl}
                                        title={movie.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                        allowFullScreen
                                        scrolling="no"
                                        frameBorder="0"
                                    />
                                </div>
                            ) : (
                                <VideoPlayer
                                    src={currentVideoUrl}
                                    poster={movie.posterImage?.asset ? urlFor(movie.posterImage).width(1920).url() : undefined}
                                    title={movie.title}
                                    contentId={isTVShow && movie.seasons
                                        ? `${movie._id}-s${currentSeasonIndex + 1}-e${currentEpisodeIndex + 1}`
                                        : movie._id
                                    }
                                    subtitle={isTVShow && currentEpisodeInfo
                                        ? `Season ${movie.seasons![currentSeasonIndex].seasonNumber} Episode ${currentEpisodeInfo.episodeNumber}`
                                        : undefined
                                    }
                                />
                            )
                        ) : (
                            <div className={styles.placeholderVideo}>
                                <div className={styles.placeholderIcon}>
                                    <Play size={48} />
                                </div>
                                <h3 className={styles.placeholderTitle}>No video available</h3>
                                <p className={styles.placeholderText}>Check back later for updates</p>
                            </div>
                        )}
                    </div>

                    {/* Episode List - Only for TV Shows */}
                    {isTVShow && movie.seasons && (
                        <div className={styles.episodeListWrapper}>
                            <EpisodeList
                                seasons={movie.seasons}
                                currentSeasonIndex={currentSeasonIndex}
                                currentEpisodeIndex={currentEpisodeIndex}
                                onEpisodeSelect={handleEpisodeSelect}
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
