'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { Movie } from '@/types/movie'
import { urlFor } from '@/lib/sanity'
import styles from './HeroSection.module.css'

interface HeroSectionProps {
    movies: Movie[]
}

export default function HeroSection({ movies }: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    // Auto-slide logic
    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, [movies.length])

    useEffect(() => {
        if (movies.length <= 1 || isHovered) return
        const interval = setInterval(nextSlide, 8000)
        return () => clearInterval(interval)
    }, [movies.length, isHovered, nextSlide])

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1))
    }

    if (!movies || movies.length === 0) return null

    return (
        <section
            className={styles.hero}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {movies.map((movie, index) => {
                // FIX: Determine the valid image source explicitly BEFORE using urlFor
                const imageSource = movie.bannerImage?.asset ? movie.bannerImage : movie.posterImage;

                return (
                    <div
                        key={movie._id}
                        className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
                    >
                        {/* Background Layer */}
                        <div className={styles.imageContainer}>
                            {/* FIX: Check if imageSource.asset exists to prevent the crash */}
                            {imageSource?.asset && (
                                <Image
                                    src={urlFor(imageSource).width(1920).height(1080).url()}
                                    alt={movie.title}
                                    fill
                                    className={styles.image}
                                    priority={index === 0}
                                    sizes="100vw"
                                    quality={90}
                                />
                            )}
                            {/* Cinematic Gradients */}
                            <div className={styles.vignette} />
                            <div className={styles.bottomGradient} />
                        </div>

                        {/* Content Layer */}
                        <div className={styles.contentContainer}>
                            <div className={styles.content}>
                                <div className={styles.badgeWrapper}>
                                    <span className={styles.badge}>
                                        Top Rated
                                    </span>
                                    <div className={styles.ratingBadge}>
                                        <Star size={14} fill="currentColor" />
                                        <span>{movie.rating?.toFixed(1)}</span>
                                    </div>
                                </div>

                                <h1 className={styles.title}>{movie.title}</h1>

                                <div className={styles.metaData}>
                                    <span className={styles.year}>{movie.releaseYear || '2024'}</span>
                                    <span className={styles.separator}>•</span>
                                    <span className={styles.duration}>{movie.duration ? `${movie.duration}m` : 'N/A'}</span>
                                    {movie.genre && movie.genre.length > 0 && (
                                        <>
                                            <span className={styles.separator}>•</span>
                                            <span className={styles.genre}>{movie.genre.slice(0, 2).join(', ')}</span>
                                        </>
                                    )}
                                </div>

                                <p className={styles.description}>{movie.description}</p>

                                <div className={styles.actions}>
                                    <Link href={`/watch/${movie.slug.current}`} className={styles.primaryBtn}>
                                        <Play size={20} fill="currentColor" />
                                        <span>Watch Now</span>
                                    </Link>
                                    <button className={styles.secondaryBtn}>
                                        <Info size={20} />
                                        <span>More Info</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Navigation Controls */}
            {movies.length > 1 && (
                <>
                    <div className={styles.navArrows}>
                        <button onClick={prevSlide} className={styles.arrowBtn} aria-label="Previous">
                            <ChevronLeft size={28} />
                        </button>
                        <button onClick={nextSlide} className={styles.arrowBtn} aria-label="Next">
                            <ChevronRight size={28} />
                        </button>
                    </div>

                    <div className={styles.indicators}>
                        {movies.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}