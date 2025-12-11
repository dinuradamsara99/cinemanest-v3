'use client' // 👈 This is important for interactivity

import React, { useState } from 'react'
import MovieCard from '../MovieCard/MovieCard'
import { Movie } from '@/types/movie'
import styles from './MovieRow.module.css'

interface MovieRowProps {
    title: string
    movies: Movie[]
}

export default function MovieRow({ title, movies }: MovieRowProps) {
    // State to track how many movies to show
    // මුලින් ෆිල්ම් 12ක් පෙන්නනවා.
    const [visibleCount, setVisibleCount] = useState(12)

    if (!movies || movies.length === 0) {
        return null
    }

    // බටන් එක එබුවම තව 12ක් වැඩි වෙනවා
    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 12)
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
            </div>

            {/* The Grid */}
            <div className={styles.gridContainer}>
                {movies.slice(0, visibleCount).map((movie) => (
                    <div key={movie._id} className={styles.cardWrapper}>
                        <MovieCard movie={movie} />
                    </div>
                ))}
            </div>

            {/* Load More Button - Only shows if there are more movies hidden */}
            {visibleCount < movies.length && (
                <div className={styles.loadMoreContainer}>
                    <button onClick={handleLoadMore} className={styles.loadMoreBtn}>
                        Load More Movies
                    </button>
                </div>
            )}
        </section>
    )
}