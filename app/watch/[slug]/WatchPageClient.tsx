'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Star, Play } from 'lucide-react'
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
                                    <VideoPlayer
                                        key={isTVShow && movie.seasons
                                            ? `${movie._id}-s${currentSeasonIndex + 1}-e${currentEpisodeIndex + 1}`
                                            : movie._id
                                        }
                                        src={currentVideoUrl}
                                        poster={movie.posterImage?.asset ? urlFor(movie.posterImage).width(1920).url() : undefined}

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


                            </div>
                        </div>
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
                                    <span className={styles.label}>Rating</span>
                                    <div className={styles.ratingValue}>
                                        <Star size={16} fill="var(--color-accent)" strokeWidth={0} />
                                        <span>{movie.rating.toFixed(1)}</span>
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
        </main>
    )
}
