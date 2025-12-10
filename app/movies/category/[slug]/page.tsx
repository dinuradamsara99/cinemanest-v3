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
  try {
    const slugs = await getAllCategorySlugs();
    if (!slugs) return [];
    return slugs.map((slug: string) => ({
      slug,
    }));
  } catch (error) {
    console.error("Failed to generate category slugs:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const categories = await getCategories();
    if (!categories) {
      return {
        title: "Category Not Found - CinemaNest",
      };
    }
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
      description:
        category.description || `Watch ${category.title} movies on CinemaNest`,
    };
  } catch (error) {
    console.error("Failed to generate category metadata:", error);
    return {
      title: "Category - CinemaNest",
    };
  }
}

async function CategoryMoviesSection({ slug }: { slug: string }) {
  try {
    const categoryData = await getMoviesByCategory(slug);

    if (
      !categoryData ||
      !categoryData.movies ||
      categoryData.movies.length === 0
    ) {
      return (
        <div className={styles.emptyState}>
          <h2>No movies found in this category</h2>
          <p>Check back later for updates!</p>
        </div>
      );
    }

    return (
      <MovieRow
        title={`${categoryData.title} Movies`}
        movies={categoryData.movies}
      />
    );
  } catch (error) {
    console.error("Failed to fetch category movies:", error);
    return (
      <div className={styles.errorState}>
        <h2>Failed to load movies</h2>
        <p>
          There was an error loading movies for this category. Please try again
          later.
        </p>
      </div>
    );
  }
}

export default async function CategoryMoviesPage({ params }: Props) {
  try {
    const { slug } = await params;
    const categories = await getCategories();
    if (!categories) {
      notFound();
    }
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
            {category.description ||
              `Explore our collection of ${category.title} movies`}
          </p>
        </div>

        <Suspense fallback={<SkeletonRow />}>
          <CategoryMoviesSection slug={slug} />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error("Failed to render category page:", error);
    return (
      <main className={styles.main}>
        <div className={styles.errorState}>
          <h2>Error Loading Category</h2>
          <p>
            There was an error loading this category. Please try again later.
          </p>
        </div>
      </main>
    );
  }
}
