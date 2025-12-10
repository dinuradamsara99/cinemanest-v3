import React from 'react'
import MovieCard from '../MovieCard/MovieCard'
import { Movie } from '@/types/movie'
import styles from './MovieRow.module.css'

interface MovieRowProps {
    title: string
    movies: Movie[]
}

export default function MovieRow({ title, movies }: MovieRowProps) {
    if (!movies || movies.length === 0) {
        return null
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.scrollContainer}>
                <div className={styles.movieGrid}>
                    {movies.map((movie) => (
                        <MovieCard key={movie._id} movie={movie} />
                    ))}
                </div>
            </div>
        </section>
    )
}
