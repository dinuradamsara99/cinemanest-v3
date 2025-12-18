'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Star, Tv } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import { Movie, Season } from '@/types/movie'
import styles from './SeasonCard.module.css'

interface SeasonCardProps {
    tvShow: Movie
    season: Season
}

export default function SeasonCard({ tvShow, season }: SeasonCardProps) {
    // Use TV show poster as fallback if season doesn't have its own poster
    const posterUrl = tvShow.posterImage?.asset
        ? urlFor(tvShow.posterImage).width(400).quality(90).url()
        : '/placeholder-movie.jpg'

    const episodeCount = season.episodes?.length || 0

    return (
        <Link
            href={`/watch/${tvShow.slug.current}?season=${season.seasonNumber}`}
            className="block w-full h-full"
        >
            <article className={styles.card}>

                <div className={styles.imageWrapper}>
                    <Image
                        src={posterUrl}
                        alt={`${tvShow.title} - Season ${season.seasonNumber}`}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                </div>

                {tvShow.rating && (
                    <div className={styles.ratingBadge}>
                        <Star size={14} fill="currentColor" strokeWidth={0} />
                        <span>{tvShow.rating.toFixed(1)}</span>
                    </div>
                )}

                {/* Season Badge */}
                <div className={styles.seasonBadge}>
                    <Tv size={14} />
                    <span>S{season.seasonNumber}</span>
                </div>

                <div className={styles.playButtonContainer}>
                    <div className={styles.playButton}>
                        <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
                    </div>
                </div>

                <div className={styles.contentOverlay}>
                    <div className={styles.info}>
                        <h3 className={styles.title}>{tvShow.title}</h3>
                        <p className={styles.seasonTitle}>
                            Season {season.seasonNumber}
                            {season.title && `: ${season.title}`}
                        </p>

                        <div className={styles.meta}>
                            <span className={styles.metaItem}>
                                {episodeCount} Episode{episodeCount !== 1 ? 's' : ''}
                            </span>
                            {tvShow.releaseYear && (
                                <span className={styles.metaItem}>
                                    {tvShow.releaseYear}
                                </span>
                            )}
                            <span className={styles.qualityBadge}>HD</span>
                        </div>

                        <div className={styles.extraDetails}>
                            {tvShow.genre && tvShow.genre.length > 0 && (
                                <div className={styles.genreList}>
                                    {tvShow.genre.slice(0, 3).map((g, i) => (
                                        <span key={i} className={styles.genreTag}>
                                            {g}
                                            {i < Math.min(tvShow.genre!.length, 3) - 1 ? " •" : ""}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </article>
        </Link>
    )
}
