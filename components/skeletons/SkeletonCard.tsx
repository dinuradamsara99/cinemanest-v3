import React from 'react'
import styles from '@/styles/Skeleton.module.css'

/**
 * SkeletonCard - Movie Poster Skeleton
 * 
 * Features:
 * - 2:3 aspect ratio (matches real movie posters)
 * - Rounded corners (12px)
 * - Shimmer animation
 * - Fully responsive
 */
export default function SkeletonCard() {
    return (
        <div className={styles.cardContainer}>
            <div className={styles.card}>
                <div className={styles.shimmer} />
            </div>
        </div>
    )
}
