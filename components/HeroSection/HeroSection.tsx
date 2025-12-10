'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Movie } from '@/types/movie'
import { urlFor } from '@/lib/sanity'
import styles from './HeroSection.module.css'

interface HeroSectionProps {
    movies: Movie[]
}

export default function HeroSection({ movies }: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    // Add wishlist state logic here if needed, or pass from a parent/context

    useEffect(() => {
        if (movies.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length)
        }, 8000)

        return () => clearInterval(interval)
    }, [movies.length])

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % movies.length)
    }

    if (!movies || movies.length === 0) {
        return <div className={styles.placeholder}>No featured movies available</div>
    }

    return (
        <section className={styles.hero}>
            {/* Render ALL movies as slides, but only show the active one via CSS */}
            {movies.map((movie, index) => (
                <div
                    key={movie._id}
                    className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
                >
                    {/* Background Image */}
                    <div className={styles.imageContainer}>
                        {movie.bannerImage?.asset ? (
                            <Image
                                src={urlFor(movie.bannerImage).width(1920).height(1080).url()}
                                alt={movie.bannerImage.alt || movie.title}
                                fill
                                className={styles.image}
                                priority={index === 0} // Only prioritize the first image
                                sizes="100vw"
                            />
                        ) : movie.posterImage?.asset ? (
                            <Image
                                src={urlFor(movie.posterImage).width(1920).height(1080).url()}
                                alt={movie.posterImage.alt || movie.title}
                                fill
                                className={styles.image}
                                priority={index === 0}
                                sizes="100vw"
                            />
                        ) : null}
                        <div className={styles.gradient} />
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        <div className={styles.badge}>Featured</div>
                        <h1 className={styles.title}>{movie.title}</h1>

                        <div className={styles.meta}>
                            <span className={styles.rating}>
                                <Star size={20} fill="var(--color-accent)" />
                                {movie.rating?.toFixed(1) || 'N/A'}
                            </span>
                            {movie.releaseYear && (
                                <>
                                    <span className={styles.dotSeparator} />
                                    <span className={styles.year}>{movie.releaseYear}</span>
                                </>
                            )}
                            {movie.duration && (
                                <>
                                    <span className={styles.dotSeparator} />
                                    <span className={styles.duration}>{movie.duration} min</span>
                                </>
                            )}
                            {movie.genre && movie.genre.length > 0 && (
                                <>
                                    <span className={styles.dotSeparator} />
                                    <span className={styles.genre}>{movie.genre.slice(0, 3).join(', ')}</span>
                                </>
                            )}
                        </div>

                        {movie.description && (
                            <p className={styles.description}>{movie.description}</p>
                        )}

                        <div className={styles.actions}>
                            <Link href={`/watch/${movie.slug.current}`} className={styles.primaryButton}>
                                <Play size={24} fill="currentColor" />
                                Watch Now
                            </Link>
                            {/* Example Wishlist Button placement - requires logic */}
                            <button className={styles.secondaryButton}>
                                <Heart size={24} />
                                Add to List
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Controls (Only show if multiple movies) */}
            {movies.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className={`${styles.navButton} ${styles.navButtonLeft}`}
                        aria-label="Previous movie"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={goToNext}
                        className={`${styles.navButton} ${styles.navButtonRight}`}
                        aria-label="Next movie"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Indicators */}
                    <div className={styles.indicators}>
                        {movies.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}