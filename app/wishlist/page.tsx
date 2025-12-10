'use client'

import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { getMovies } from '@/lib/sanity'
import { useWishlist } from '@/context/WishlistContext'
import type { Movie } from '@/types/movie'
import MovieCard from '@/components/MovieCard/MovieCard'
import styles from './page.module.css'

export default function WishlistPage() {
    const { wishlist } = useWishlist()
    const [wishlistedMovies, setWishlistedMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadWishlistedMovies() {
            if (wishlist.length === 0) {
                setWishlistedMovies([])
                setLoading(false)
                return
            }

            try {
                const allMovies = await getMovies(100)
                const filtered = allMovies.filter((movie: { _id: string }) => wishlist.includes(movie._id))
                setWishlistedMovies(filtered)
            } catch (error) {
                console.error('Error loading wishlisted movies:', error)
            } finally {
                setLoading(false)
            }
        }

        loadWishlistedMovies()
    }, [wishlist])

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <div className={styles.iconContainer}>
                    <Heart size={48} fill="var(--color-accent)" strokeWidth={0} />
                </div>
                <h1 className={styles.title}>My Wishlist</h1>
                <p className={styles.subtitle}>
                    {wishlist.length === 0
                        ? 'Your saved movies and shows'
                        : `${wishlist.length} ${wishlist.length === 1 ? 'movie' : 'movies'} saved`}
                </p>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading your wishlist...</div>
            ) : wishlistedMovies.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <Heart size={64} />
                    </div>
                    <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
                    <p className={styles.emptyText}>
                        Start adding movies and shows to your wishlist to watch them later!
                    </p>
                </div>
            ) : (
                <div className={styles.moviesGrid}>
                    {wishlistedMovies.map(movie => (
                        <MovieCard key={movie._id} movie={movie} />
                    ))}
                </div>
            )}
        </main>
    )
}
