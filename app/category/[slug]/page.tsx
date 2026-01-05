import { notFound } from "next/navigation";
import { getMoviesByCategory } from "@/lib/sanity";
import { ContentGrid } from "@/components/ContentGrid";
import { MediaCard } from "@/components/MediaCard";
import type { Movie } from "@/types/movie";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const { slug } = params;

  // Fetch category and its movies from Sanity
  const categoryData = await getMoviesByCategory(slug);

  // If no category found, show 404
  if (!categoryData || !categoryData.movies || categoryData.movies.length === 0) {
    notFound();
  }

  const { title: categoryTitle, description: categoryDescription, movies } = categoryData;

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{categoryTitle}</h1>
          {categoryDescription && (
            <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
              {categoryDescription}
            </p>
          )}
          <div className="mt-6 h-1 w-24 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Category Content Grid */}
        <ContentGrid title={`${categoryTitle} Content`}>
          {movies.map((movie: Movie) => (
            <MediaCard
              key={movie._id}
              id={movie._id}
              title={movie.title}
              slug={movie.slug.current}
              posterImage={movie.posterImage}
              rating={movie.rating}
              releaseYear={movie.releaseYear}
              type={movie._type === 'tvshow' ? 'tv' : 'movie'}
            />
          ))}
        </ContentGrid>
      </div>
    </main>
  );
}

// Generate metadata for SEO
export async function generateMetadata(props: CategoryPageProps) {
  const params = await props.params;
  const { slug } = params;
  const categoryData = await getMoviesByCategory(slug);

  if (!categoryData) {
    return {
      title: "Category Not Found",
    };
  }

  const { title: categoryTitle, description: categoryDescription } = categoryData;

  return {
    title: `${categoryTitle} - CinemaNest`,
    description: categoryDescription || `Browse all movies and TV shows in the ${categoryTitle} category on CinemaNest`,
    openGraph: {
      title: `${categoryTitle} - CinemaNest`,
      description: categoryDescription || `Browse all movies and TV shows in the ${categoryTitle} category`,
      type: 'website',
    },
  };
}