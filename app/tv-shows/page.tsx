import { Suspense } from "react";
import { Metadata } from "next";
import MovieRow from "@/components/MovieRow/MovieRow";
import { getTVShows } from "@/lib/sanity";
import { SkeletonRow } from "@/components/skeletons";
import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "TV Shows - CinemaNest",
    description: "Browse and watch TV shows on CinemaNest",
};

async function TVShowsSection() {
    const tvShows = await getTVShows();

    if (!tvShows || tvShows.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h2>No TV shows available</h2>
                <p>Check back later for updates!</p>
            </div>
        );
    }

    return <MovieRow title="All TV Shows" movies={tvShows} />;
}

export default function TVShowsPage() {
    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h1 className={styles.title}>TV Shows</h1>
                <p className={styles.subtitle}>
                    Explore our collection of TV series
                </p>
            </div>

            <Suspense fallback={<SkeletonRow />}>
                <TVShowsSection />
            </Suspense>
        </main>
    );
}
