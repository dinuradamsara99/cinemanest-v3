'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Star, Calendar, Clock } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import { Movie } from '@/types/movie'
import styles from './MovieCard.module.css'

interface MovieCardProps {
    movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
    const posterUrl = movie.posterImage?.asset
        ? urlFor(movie.posterImage).width(400).quality(90).url()
        : '/placeholder-movie.jpg'

    const displayGenres = movie.genre?.slice(0, 3) || [];

    return (
        <Link href={`/watch/${movie.slug.current}`} className="block w-full h-full">
            <article className={styles.card}>

                <div className={styles.imageWrapper}>
                    <Image
                        src={posterUrl}
                        alt={movie.title}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                </div>

                {movie.rating && (
                    <div className={styles.ratingBadge}>
                        <Star size={14} fill="currentColor" strokeWidth={0} />
                        <span>{movie.rating.toFixed(1)}</span>
                    </div>
                )}

                <div className={styles.playButtonContainer}>
                    <div className={styles.playButton}>
                        {/* Removed tailwind margin class here too */}
                        <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
                    </div>
                </div>

                <div className={styles.contentOverlay}>
                    <div className={styles.info}>
                        <h3 className={styles.title}>{movie.title}</h3>

                        <div className={styles.meta}>
                            {movie.releaseYear && (
                                /* ✅ FIX: Used styles.metaItem for alignment */
                                <span className={styles.metaItem}>
                                    <Calendar size={14} strokeWidth={2.5} />
                                    {movie.releaseYear}
                                </span>
                            )}
                            {movie.duration && (
                                /* ✅ FIX: Used styles.metaItem for alignment */
                                <span className={styles.metaItem}>
                                    <Clock size={14} strokeWidth={2.5} />
                                    {movie.duration}m
                                </span>
                            )}
                            <span className={styles.qualityBadge}>HD</span>
                        </div>

                        <div className={styles.extraDetails}>
                            {displayGenres.length > 0 && (
                                <div className={styles.genreList}>
                                    {displayGenres.map((g, i) => (
                                        <span key={i} className={styles.genreTag}>
                                            {g}
                                            {i < displayGenres.length - 1 ? " •" : ""}
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