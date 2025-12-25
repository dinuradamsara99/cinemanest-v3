'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Play, Youtube } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import type { Movie, Category } from '@/types/movie'
import VideoPlayerWithSubtitles from '@/components/VideoPlayer/VideoPlayerWithSubtitles'
import { convertSanitySubtitlesToPlayerFormat } from '@/lib/subtitleConverter'
import EpisodeList from '@/components/EpisodeList/EpisodeList'
import TrailerModal from '@/components/TrailerModal/TrailerModal'
import styles from './page.module.css'

type Props = {
    movie: Movie
}

export default function WatchPageClient({ movie }: Props) {
    // Episode selection state for TV Shows
    const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0)
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
    // Trailer modal state
    const [trailerOpen, setTrailerOpen] = useState(false)



    // Handle episode selection
    const handleEpisodeSelect = useCallback((seasonIndex: number, episodeIndex: number) => {
        setCurrentSeasonIndex(seasonIndex)
        setCurrentEpisodeIndex(episodeIndex)
    }, [])

    // Trailer handlers
    const handleOpenTrailer = () => setTrailerOpen(true)
    const handleCloseTrailer = () => setTrailerOpen(false)
    const handleTrailerEnd = () => {
        setTrailerOpen(false)
        // Trailer ended, user can now watch the full video
    }



    // Determine if this is a TV Show (check both _type from schema and contentType)
    const isTVShow = (movie._type === 'tvshow' || movie.contentType === 'tvshow') && movie.seasons && movie.seasons.length > 0

    // Calculate current video URL and subtitles
    let currentVideoUrl = movie.videoUrl || ''
    let currentSubtitles = movie.subtitles // Default to movie level subtitles

    if (isTVShow && movie.seasons) {
        const currentSeason = movie.seasons[currentSeasonIndex]
        const currentEpisode = currentSeason?.episodes?.[currentEpisodeIndex]
        currentVideoUrl = currentEpisode?.videoUrl || ''
        // For TV shows, only use episode-level subtitles (no show-level fallback)
        currentSubtitles = currentEpisode?.subtitles
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
            'youtu.be',
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
            {/* Ambient Background */}
            <div className={styles.ambientBackground}>
                {movie.posterImage?.asset && (
                    <Image
                        src={urlFor(movie.posterImage).width(200).url()}
                        alt=""
                        fill
                        className={styles.ambientImage}
                        priority
                    />
                )}
                <div className={styles.ambientOverlay} />
            </div>



            <div className={styles.mainContainer}>
                {/* Hero / Player Section */}
                <section className={styles.playerSection} id="watch">
                    {/* Top Navigation */}
                    <div className={styles.topNav}>
                        <Link href="/" className={styles.backButton}>
                            <ArrowLeft size={20} />
                            <span>Back to Browse</span>
                        </Link>
                    </div>

                    <div className={styles.playerContainer}>
                        <div className={styles.playerWrapper}>
                            {currentVideoUrl ? (
                                isEmbedUrl ? (
                                    <iframe
                                        className={styles.iframe}
                                        src={currentVideoUrl}
                                        title={movie.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                        allowFullScreen
                                        scrolling="no"
                                        frameBorder="0"
                                    />
                                ) : (
                                    <VideoPlayerWithSubtitles
                                        key={isTVShow && movie.seasons
                                            ? `${movie._id}-s${currentSeasonIndex + 1}-e${currentEpisodeIndex + 1}`
                                            : movie._id
                                        }
                                        videoUrl={currentVideoUrl}
                                        poster={movie.posterImage?.asset ? urlFor(movie.posterImage).width(1920).url() : undefined}
                                        title={movie.title}
                                        subtitles={convertSanitySubtitlesToPlayerFormat(currentSubtitles)}
                                    />
                                )
                            ) : (
                                <div className={styles.placeholderVideo}>
                                    <div className={styles.placeholderIcon}>
                                        <Play size={48} />
                                    </div>
                                    <h3>Video Unavailable</h3>
                                    <p>Please check back later</p>
                                </div>
                            )}
                        </div>

                        {/* Player Controls / Meta */}
                        <div className={styles.playerMeta}>
                            <div className={styles.playerHeader}>
                                <div className={styles.titleGroup}>
                                    <h1>
                                        {isTVShow && currentEpisodeInfo
                                            ? currentEpisodeInfo.title
                                            : movie.title}
                                    </h1>
                                    {isTVShow && currentEpisodeInfo && (
                                        <span className={styles.episodeBadge}>
                                            S{movie.seasons![currentSeasonIndex].seasonNumber} E{currentEpisodeInfo.episodeNumber}
                                        </span>
                                    )}
                                </div>

                                {/* Trailer Button */}
                                {movie.trailerUrl && (
                                    <button onClick={handleOpenTrailer} className={styles.trailerButton}>
                                        <Youtube size={20} />
                                        <span>Watch Trailer</span>
                                    </button>
                                )}

                            </div>
                        </div>

                        {/* Credit Section */}
                        {movie.credit && (
                            <div className={styles.creditSection}>
                                <div className={styles.creditCard}>
                                    <div className={styles.creditIcon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="16" x2="12" y2="12" />
                                            <line x1="12" y1="8" x2="12.01" y2="8" />
                                        </svg>
                                    </div>
                                    <p className={styles.creditText}>{movie.credit}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Content Details & Episodes */}
                <div className={styles.contentGrid}>
                    <div className={styles.leftColumn}>
                        {/* Episodes Section - First for TV Shows */}
                        {isTVShow && movie.seasons && (
                            <div id="episodes" className={styles.episodesSection}>
                                <div className={styles.sectionHeader}>
                                    <h2>Episodes</h2>
                                    <span className={styles.seasonCount}>
                                        {movie.seasons.length} Season{movie.seasons.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className={styles.episodeListCard}>
                                    <EpisodeList
                                        seasons={movie.seasons}
                                        currentSeasonIndex={currentSeasonIndex}
                                        currentEpisodeIndex={currentEpisodeIndex}
                                        onEpisodeSelect={handleEpisodeSelect}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Description Section - Always visible for both movies and TV shows */}
                        {movie.description && (
                            <div className={styles.aboutSection}>
                                <div className={styles.sectionHeader}>
                                    <h2>{isTVShow ? 'About This Show' : 'About This Movie'}</h2>
                                </div>
                                <div className={styles.aboutContent}>
                                    <p className={styles.description}>{movie.description}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.metaCard}>
                            <h3>Details</h3>
                            <div className={styles.metaGrid}>
                                <div className={styles.metaItem}>
                                    <span className={styles.label}>IMDb</span>
                                    <div className={styles.ratingValue}>
                                        <span>{movie.rating.toFixed(1)}/10</span>
                                    </div>
                                </div>
                                {movie.releaseYear && (
                                    <div className={styles.metaItem}>
                                        <span className={styles.label}>Released</span>
                                        <span>{movie.releaseYear}</span>
                                    </div>
                                )}
                                <div className={styles.metaItem}>
                                    <span className={styles.label}>Type</span>
                                    <span>{isTVShow ? 'TV Series' : 'Movie'}</span>
                                </div>
                                {languageLabel && (
                                    <div className={styles.metaItem}>
                                        <span className={styles.label}>Language</span>
                                        <span>{languageLabel}</span>
                                    </div>
                                )}
                                {movie.genre && movie.genre.length > 0 && (
                                    <div className={styles.metaItem}>
                                        <span className={styles.label}>Genres</span>
                                        <div className={styles.genreTags}>
                                            {movie.genre.map(g => (
                                                <span key={g} className={styles.miniTag}>{g}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {movie.categories && movie.categories.length > 0 && (
                                    <div className={styles.metaItem}>
                                        <span className={styles.label}>Genre</span>
                                        <div className={styles.genreTags}>
                                            {movie.categories.map((category: Category) => (
                                                <span key={category._id} className={styles.miniTag}>{category.title}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {movie.posterImage?.asset && (
                            <div className={styles.posterCard}>
                                <Image
                                    src={urlFor(movie.posterImage).width(400).url()}
                                    alt={movie.title}
                                    width={300}
                                    height={450}
                                    className={styles.sidebarPoster}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Trailer Modal */}
            {trailerOpen && movie.trailerUrl && (
                <TrailerModal
                    trailerUrl={movie.trailerUrl}
                    isOpen={trailerOpen}
                    onClose={handleCloseTrailer}
                    onTrailerEnd={handleTrailerEnd}
                    movieTitle={movie.title}
                />
            )}
        </main>
    )
}
