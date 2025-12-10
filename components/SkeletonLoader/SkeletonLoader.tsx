import React from 'react'
import styles from './SkeletonLoader.module.css'

// Skeleton Card - For Movie Posters
export function SkeletonCard() {
    return <div className={styles.skeletonCard} />
}

// Skeleton Hero - Main Banner Section
export function SkeletonHero() {
    return (
        <div className={styles.skeletonHero}>
            <div className={styles.skeletonHeroBanner} />
            <div className={styles.skeletonHeroContent}>
                {/* Title */}
                <div className={styles.skeletonTitle} />

                {/* Metadata (Rating, Year, Duration) */}
                <div className={styles.skeletonMeta}>
                    <div className={styles.skeletonMetaItem} />
                    <div className={styles.skeletonMetaItem} />
                    <div className={styles.skeletonMetaItem} />
                </div>

                {/* Genres */}
                <div className={styles.skeletonGenres}>
                    <div className={styles.skeletonGenre} />
                    <div className={styles.skeletonGenre} />
                    <div className={styles.skeletonGenre} />
                </div>

                {/* Description Lines */}
                <div className={styles.skeletonDescription}>
                    <div className={styles.skeletonDescLine} />
                    <div className={styles.skeletonDescLine} />
                    <div className={styles.skeletonDescLine} />
                </div>

                {/* Action Buttons */}
                <div className={styles.skeletonButtons}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.skeletonButton} />
                </div>
            </div>
        </div>
    )
}

// Skeleton Row - Horizontal Movie List
export function SkeletonRow() {
    return (
        <div className={styles.skeletonRow}>
            {/* Row Title */}
            <div className={styles.skeletonRowTitle} />

            {/* Movie Cards */}
            <div className={styles.skeletonRowCards}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className={styles.skeletonRowCard}>
                        <SkeletonCard />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Combined Skeleton - Full Page Loading
export function SkeletonFullPage() {
    return (
        <>
            <SkeletonHero />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
        </>
    )
}

// Export individual components
const SkeletonLoader = {
    Card: SkeletonCard,
    Hero: SkeletonHero,
    Row: SkeletonRow,
    FullPage: SkeletonFullPage,
}

export default SkeletonLoader
