'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Star, Clock, Calendar, Play, Tv } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import type { Movie } from '@/types/movie'
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import EpisodeList from '@/components/EpisodeList/EpisodeList'
import styles from './page.module.css'

type Props = {
    movie: Movie
}

export default function WatchPageClient({ movie }: Props) {
    // Episode selection state for TV Shows
    const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0)
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)

    // Handle episode selection
    const handleEpisodeSelect = useCallback((seasonIndex: number, episodeIndex: number) => {
        setCurrentSeasonIndex(seasonIndex)
        setCurrentEpisodeIndex(episodeIndex)
    }, [])

    const handleScrollToEpisodes = useCallback(() => {
        const el = document.getElementById('episodes')
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
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

    const languageLabel = movie.language?.title

    return (
        <main className={styles.page}>
            <section className={styles.heroSection}>
                <div className={styles.bannerContainer}>
                    {movie.bannerImage?.asset ? (
                        <Image
                            src={urlFor(movie.bannerImage).width(1920).height(900).url()}
                            alt={movie.bannerImage.alt || movie.title}
                            fill
                            className={styles.bannerImage}
                            priority
                        />
                    ) : movie.posterImage?.asset ? (
                        <Image
                            src={urlFor(movie.posterImage).width(1920).height(900).url()}
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

                <div className={styles.heroContent}>
                    <div className={styles.heroTop}>
                        <Link href="/" className={styles.backLink}>
                            <ArrowLeft size={16} />
                            Back to library
                        </Link>
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
                    </div>

                    <div className={styles.heroGrid}>
                        <div className={styles.heroCopy}>
                            <h1 className={styles.heroTitle}>{movie.title}</h1>

                            {isTVShow && currentEpisodeInfo && (
                                <p className={styles.currentEpisode}>
                                    Season {movie.seasons![currentSeasonIndex].seasonNumber} · Episode {currentEpisodeInfo.episodeNumber} — {currentEpisodeInfo.title}
                                </p>
                            )}

                            <div className={styles.heroMeta}>
                                <div className={styles.rating}>
                                    <Star size={18} fill="var(--color-accent)" strokeWidth={0} />
                                    <span>{movie.rating.toFixed(1)}</span>
                                </div>
                                {movie.releaseYear && (
                                    <span className={styles.metaItem}>
                                        <Calendar size={16} />
                                        {movie.releaseYear}
                                    </span>
                                )}
                                {!isTVShow && movie.duration && (
                                    <span className={styles.metaItem}>
                                        <Clock size={16} />
                                        {movie.duration} min
                                    </span>
                                )}
                                {isTVShow && movie.seasons && (
                                    <span className={styles.metaItem}>
                                        <Tv size={16} />
                                        {movie.seasons.length} Season{movie.seasons.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {languageLabel && (
                                    <span className={styles.metaItem}>
                                        <span className={styles.metaDot} />
                                        {languageLabel}
                                    </span>
                                )}
                            </div>

                            {movie.genre && movie.genre.length > 0 && (
                                <div className={styles.genreSection}>
                                    {movie.genre.map((genre: string) => (
                                        <span key={genre} className={styles.genreTag}>
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className={styles.actionRow}>
                                <Link href="#watch" className={styles.primaryButton}>
                                    <Play size={16} />
                                    Watch now
                                </Link>
                                {isTVShow && (
                                    <button type="button" onClick={handleScrollToEpisodes} className={styles.ghostButton}>
                                        <Tv size={16} />
                                        Episodes
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.posterPanel}>
                            <div className={styles.posterFrame}>
                                {movie.posterImage?.asset ? (
                                    <Image
                                        src={urlFor(movie.posterImage).width(700).height(1000).url()}
                                        alt={movie.posterImage.alt || movie.title}
                                        fill
                                        sizes="320px"
                                        className={styles.posterImage}
                                    />
                                ) : (
                                    <div className={styles.posterPlaceholder}>
                                        <Play size={42} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.statGrid}>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Rating</span>
                                    <span className={styles.statValue}>{movie.rating.toFixed(1)}</span>
                                </div>
                                {movie.releaseYear && (
                                    <div className={styles.statCard}>
                                        <span className={styles.statLabel}>Release</span>
                                        <span className={styles.statValue}>{movie.releaseYear}</span>
                                    </div>
                                )}
                                {!isTVShow && movie.duration && (
                                    <div className={styles.statCard}>
                                        <span className={styles.statLabel}>Duration</span>
                                        <span className={styles.statValue}>{movie.duration} min</span>
                                    </div>
                                )}
                                {isTVShow && movie.seasons && (
                                    <div className={styles.statCard}>
                                        <span className={styles.statLabel}>Seasons</span>
                                        <span className={styles.statValue}>{movie.seasons.length}</span>
                                    </div>
                                )}
                                {languageLabel && (
                                    <div className={styles.statCard}>
                                        <span className={styles.statLabel}>Language</span>
                                        <span className={styles.statValue}>{languageLabel}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className={styles.contentShell}>
                <div className={`${styles.layout} ${isTVShow ? styles.withSidebar : ''}`}>
                    <div className={styles.primaryColumn}>
                        {movie.description && (
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h2 className={styles.sectionTitle}>Overview</h2>
                                    <span className={styles.accentPill} />
                                </div>
                                <p className={styles.description}>{movie.description}</p>
                            </div>
                        )}

                        <div id="watch" className={`${styles.card} ${styles.videoCard}`}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.sectionTitle}>
                                    {isTVShow && currentEpisodeInfo
                                        ? `S${movie.seasons![currentSeasonIndex].seasonNumber} · E${currentEpisodeInfo.episodeNumber} — ${currentEpisodeInfo.title}`
                                        : 'Watch now'}
                                </h2>
                                <div className={styles.smallMetaRow}>
                                    <span>{isTVShow ? 'Episode stream' : 'Full feature'}</span>
                                    {currentEpisodeInfo?.duration && (
                                        <span className={styles.mutedText}>{currentEpisodeInfo.duration} min</span>
                                    )}
                                </div>
                            </div>

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
                                        key={isTVShow && movie.seasons
                                            ? `${movie._id}-s${currentSeasonIndex + 1}-e${currentEpisodeIndex + 1}`
                                            : movie._id
                                        }
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
                    </div>

                    <div className={styles.sideColumn}>
                        <div className={`${styles.card} ${styles.detailCard}`}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.sectionTitle}>Details</h3>
                            </div>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Type</span>
                                    <span className={styles.detailValue}>{isTVShow ? 'TV Series' : 'Movie'}</span>
                                </div>
                                {movie.releaseYear && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Release</span>
                                        <span className={styles.detailValue}>{movie.releaseYear}</span>
                                    </div>
                                )}
                                {!isTVShow && movie.duration && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Runtime</span>
                                        <span className={styles.detailValue}>{movie.duration} min</span>
                                    </div>
                                )}
                                {isTVShow && movie.seasons && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Seasons</span>
                                        <span className={styles.detailValue}>{movie.seasons.length}</span>
                                    </div>
                                )}
                                {languageLabel && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Language</span>
                                        <span className={styles.detailValue}>{languageLabel}</span>
                                    </div>
                                )}
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Rating</span>
                                    <span className={styles.detailValue}>
                                        <Star size={14} fill="var(--color-accent)" strokeWidth={0} />
                                        {movie.rating.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isTVShow && movie.seasons && (
                            <div id="episodes" className={`${styles.card} ${styles.episodeCard}`}>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.sectionTitle}>Episodes</h3>
                                </div>
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
            </div>
        </main>
    )
}
