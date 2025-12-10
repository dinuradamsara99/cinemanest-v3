import React from 'react'
import SkeletonCard from './SkeletonCard'
import styles from '@/styles/Skeleton.module.css'

/**
 * SkeletonRow - Horizontal Movie List Skeleton
 * 
 * Features:
 * - Row title placeholder
 * - Grid of skeleton cards:
 *   - Desktop: 6 cards
 *   - Tablet: 4 cards
 *   - Mobile: 3 cards
 *   - Small Mobile: 2 cards
 * - Smooth shimmer animation
 * - Fully responsive
 */
export default function SkeletonRow() {
    return (
        <div className={styles.rowContainer}>
            {/* Row Title */}
            <div className={styles.rowTitle}>
                <div className={styles.shimmer} />
            </div>

            {/* Movie Cards Grid */}
            <div className={styles.rowCards}>
                {/* Render 6 cards (responsive CSS handles visibility) */}
                {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        </div>
    )
}
