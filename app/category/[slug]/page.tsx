import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import MovieRow from "@/components/MovieRow/MovieRow";
import {
    getMoviesByCategory,
    getCategories,
    getAllCategorySlugs,
} from "@/lib/sanity";
import { SkeletonRow } from "@/components/skeletons";
import styles from "./page.module.css";

type Props = {
    params: Promise<{ slug: string }>;
};

// Add generateStaticParams function for static export
export async function generateStaticParams() {
    const slugs = await getAllCategorySlugs();
    return slugs.map((slug: string) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const categories = await getCategories();
    const category = categories.find(
        (cat: { slug: { current: string } }) => cat.slug.current === slug
    );

    if (!category) {
        return {
            title: "Category Not Found - CinemaNest",
        };
    }

    return {
        title: `${category.title} Movies - CinemaNest`,
        description: category.description || `Watch ${category.title} movies on CinemaNest`,
    };
}

async function CategoryMoviesSection({ slug }: { slug: string }) {
    const categoryData = await getMoviesByCategory(slug);

    if (!categoryData || !categoryData.movies || categoryData.movies.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h2>No movies found in this category</h2>
                <p>Check back later for updates!</p>
            </div>
        );
    }

    return <MovieRow title={`${categoryData.title} Movies`} movies={categoryData.movies} />;
}

export default async function CategoryMoviesPage({ params }: Props) {
    const { slug } = await params;
    const categories = await getCategories();
    const category = categories.find(
        (cat: { slug: { current: string } }) => cat.slug.current === slug
    );

    if (!category) {
        notFound();
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h1 className={styles.title}>{category.title}</h1>
                <p className={styles.subtitle}>
                    {category.description || `Explore our collection of ${category.title} movies`}
                </p>
            </div>

            <Suspense fallback={<SkeletonRow />}>
                <CategoryMoviesSection slug={slug} />
            </Suspense>
        </main>
    );
}
