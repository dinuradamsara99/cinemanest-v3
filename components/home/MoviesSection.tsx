
import { getMovies } from "@/lib/sanity";
import { ContentGrid } from "@/components/ContentGrid";
import { MediaCard } from "@/components/MediaCard";
import { Movie } from "@/types/movie";

export async function MoviesSection() {
    try {
        const movies = await getMovies(15);

        if (!movies || movies.length === 0) {
            return null;
        }

        return (
            <ContentGrid title="Popular Movies">
                {movies.map((movie: Movie) => (
                    <MediaCard
                        key={movie._id}
                        id={movie._id}
                        title={movie.title}
                        slug={movie.slug.current}
                        posterImage={movie.posterImage}
                        tmdbId={movie.tmdbId}
                        rating={movie.rating}
                        releaseYear={movie.releaseYear}
                        type="movie"
                    />
                ))}
            </ContentGrid>
        );
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        return <div className="w-full h-40 flex items-center justify-center text-zinc-500">Failed to load content. Please check your connection.</div>;
    }
}
