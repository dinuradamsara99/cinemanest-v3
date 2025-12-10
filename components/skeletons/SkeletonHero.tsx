import React from 'react'
import styles from '@/styles/Skeleton.module.css'

/**
 * SkeletonHero - Netflix-style Hero Banner Skeleton
 * 
 * Features:
 * - Large banner placeholder (80vh desktop, 50vh mobile)
 * - Title, metadata, description, and button placeholders
 * - Smooth shimmer animation
 * - Fully responsive
 */
export default function SkeletonHero() {
    return (
        <div className={styles.heroContainer}>
            {/* Banner Background */}
            <div className={styles.heroBanner}>
                <div className={styles.shimmer} />
            </div>

            {/* Content Overlay */}
            <div className={styles.heroContent}>
                {/* Title */}
                <div className={styles.heroTitle}>
                    <div className={styles.shimmer} />
                </div>

                {/* Metadata (Rating, Year, Duration) */}
                <div className={styles.heroMetadata}>
                    <div className={styles.metaItem}>
                        <div className={styles.shimmer} />
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.shimmer} />
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.shimmer} />
                    </div>
                </div>

                {/* Description Lines */}
                <div className={styles.heroDescription}>
                    <div className={styles.descLine}>
                        <div className={styles.shimmer} />
                    </div>
                    <div className={styles.descLine}>
                        <div className={styles.shimmer} />
                    </div>
                    <div className={styles.descLine}>
                        <div className={styles.shimmer} />
                    </div>
                    <div className={styles.descLine}>
                        <div className={styles.shimmer} />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.heroButtons}>
                    <div className={styles.button}>
                        <div className={styles.shimmer} />
                    </div>
                    <div className={styles.button}>
                        <div className={styles.shimmer} />
                    </div>
                </div>
            </div>
        </div>
    )
}
