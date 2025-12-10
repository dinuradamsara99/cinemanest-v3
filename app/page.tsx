import { Suspense } from "react";
import { Metadata } from "next";
import HeroSection from "@/components/HeroSection/HeroSection";
import MovieRow from "@/components/MovieRow/MovieRow";
import {
  getFeaturedMovies,
  getTrendingMovies,
  getRecentlyAddedMovies,
} from "@/lib/sanity";
import { SkeletonHero, SkeletonRow } from "@/components/skeletons";
import styles from "./page.module.css";
import { Movie } from "@/types/movie";

export const metadata: Metadata = {
  title: "CinemaNest - Stream Movies & TV Shows",
  description:
    "Watch the latest movies and TV shows. Discover trending content and recently added titles.",
};

async function FeaturedContent() {
  const movies = await getFeaturedMovies();
  // Handle case when data fetching fails
  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    return <div className={styles.error}>Failed to load featured movies</div>;
  }
  return <HeroSection movies={movies as Movie[]} />;
}

async function TrendingContent() {
  const movies = await getTrendingMovies(12);
  // Handle case when data fetching fails
  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    return <div className={styles.error}>Failed to load trending content</div>;
  }
  return <MovieRow title="Trending Now 🔥" movies={movies as Movie[]} />;
}

async function RecentlyAddedContent() {
  const movies = await getRecentlyAddedMovies(12);
  // Handle case when data fetching fails
  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    return (
      <div className={styles.error}>Failed to load recently added content</div>
    );
  }
  return <MovieRow title="Recently Added" movies={movies as Movie[]} />;
}

export default async function HomePage() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <Suspense fallback={<SkeletonHero />}>
        <FeaturedContent />
      </Suspense>

      {/* Trending Now Section */}
      <Suspense fallback={<SkeletonRow />}>
        <TrendingContent />
      </Suspense>

      {/* Recently Added Section */}
      <Suspense fallback={<SkeletonRow />}>
        <RecentlyAddedContent />
      </Suspense>
    </main>
  );
}
