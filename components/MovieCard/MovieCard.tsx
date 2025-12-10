'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Star, Heart } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import { Movie } from '@/types/movie'
import { useWishlist } from '@/context/WishlistContext'
import styles from './MovieCard.module.css'

interface MovieCardProps {
    movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
    const wishlisted = isInWishlist(movie._id)

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation when clicking wishlist button
        if (wishlisted) {
            removeFromWishlist(movie._id)
        } else {
            addToWishlist(movie._id)
        }
    }

    return (
        <div className={styles.card}>
            {/* Wishlist Button - Top Right Corner */}
            <button
                className={`${styles.wishlistButton} ${wishlisted ? styles.wishlisted : ''}`}
                onClick={toggleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Heart
                    size={20}
                    fill={wishlisted ? 'currentColor' : 'none'}
                    strokeWidth={2}
                />
            </button>

            <Link href={`/watch/${movie.slug.current}`} className={styles.link}>
                {/* Movie Poster */}
                <div className={styles.imageContainer}>
                    {movie.posterImage?.asset ? (
                        <Image
                            src={urlFor(movie.posterImage).width(400).url()}
                            alt={movie.title}
                            fill
                            className={styles.image}
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    ) : (
                        <div className={styles.placeholder}>
                            <Play size={48} />
                        </div>
                    )}

                    {/* Overlay on Hover */}
                    <div className={styles.overlay}>
                        <button className={styles.playButton} aria-label="Play movie">
                            <Play size={32} />
                        </button>
                    </div>
                </div>

                {/* Movie Info */}
                <div className={styles.info}>
                    <h3 className={styles.title}>{movie.title}</h3>
                    <div className={styles.meta}>
                        {movie.rating && (
                            <div className={styles.rating}>
                                <Star size={14} fill="currentColor" />
                                <span>{movie.rating.toFixed(1)}</span>
                            </div>
                        )}
                        {movie.releaseYear && (
                            <span className={styles.year}>{movie.releaseYear}</span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    )
}
