import { notFound } from "next/navigation";
import { getMoviesByLanguage } from "@/lib/sanity";
import { ContentGrid } from "@/components/ContentGrid";
import { MediaCard } from "@/components/MediaCard";
import type { Movie } from "@/types/movie";

interface LanguagePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LanguagePage(props: LanguagePageProps) {
  const params = await props.params;
  const { slug } = params;

  // Fetch movies/TV shows by language from Sanity
  const movies = await getMoviesByLanguage(slug);

  // If no content found for the language, show 404
  if (!movies || movies.length === 0) {
    notFound();
  }

  // Get language title from the first item (all should have same language)
  const languageTitle = movies[0]?.language?.title || "Language";

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Language Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{languageTitle} Content</h1>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            Browse all movies and TV shows in {languageTitle} language on CinemaNest
          </p>
          <div className="mt-6 h-1 w-24 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Language Content Grid */}
        <ContentGrid title={`${languageTitle} Content`}>
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
export async function generateMetadata(props: LanguagePageProps) {
  const params = await props.params;
  const { slug } = params;
  const movies = await getMoviesByLanguage(slug);

  if (!movies || movies.length === 0) {
    return {
      title: "Language Not Found",
    };
  }

  const languageTitle = movies[0]?.language?.title || "Language";

  return {
    title: `${languageTitle} Content - CinemaNest`,
    description: `Browse all movies and TV shows in ${languageTitle} language on CinemaNest`,
    openGraph: {
      title: `${languageTitle} Content - CinemaNest`,
      description: `Browse all movies and TV shows in ${languageTitle} language`,
      type: 'website',
    },
  };
}