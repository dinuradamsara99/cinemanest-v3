import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import MovieRow from "@/components/MovieRow/MovieRow";
import {
  getMoviesByLanguage,
  getLanguages,
  getAllLanguageSlugs,
} from "@/lib/sanity";
import { SkeletonRow } from "@/components/skeletons";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

// Add generateStaticParams function for static export
export async function generateStaticParams() {
  const slugs = await getAllLanguageSlugs();
  return slugs.map((slug: string) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const languages = await getLanguages();
  const language = languages.find(
    (lang: { slug: { current: string } }) => lang.slug.current === slug
  );

  if (!language) {
    return {
      title: "Language Not Found - CinemaNest",
    };
  }

  return {
    title: `${language.title} Movies - CinemaNest`,
    description: `Watch ${language.title} movies on CinemaNest`,
  };
}

async function LanguageMoviesSection({ slug }: { slug: string }) {
  const movies = await getMoviesByLanguage(slug);
  const languages = await getLanguages();
  const language = languages.find(
    (lang: { slug: { current: string } }) => lang.slug.current === slug
  );

  if (!movies || movies.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No movies found in {language?.title}</h2>
        <p>Check back later for updates!</p>
      </div>
    );
  }

  return <MovieRow title={`${language?.title} Movies`} movies={movies} />;
}

export default async function LanguageMoviesPage({ params }: Props) {
  const { slug } = await params;
  const languages = await getLanguages();
  const language = languages.find(
    (lang: { slug: { current: string } }) => lang.slug.current === slug
  );

  if (!language) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>{language.title} Movies</h1>
        <p className={styles.subtitle}>
          Explore our collection of {language.title} movies
        </p>
      </div>

      <Suspense fallback={<SkeletonRow />}>
        <LanguageMoviesSection slug={slug} />
      </Suspense>
    </main>
  );
}
