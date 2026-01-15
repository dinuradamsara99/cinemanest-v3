
import { getTVShows } from "@/lib/sanity";
import { ContentGrid } from "@/components/ContentGrid";
import { MediaCard } from "@/components/MediaCard";
import { Movie } from "@/types/movie";

export async function TVShowsSection() {
    try {
        const tvShows = await getTVShows(15);

        if (!tvShows || tvShows.length === 0) {
            return null;
        }

        return (
            <ContentGrid title="Popular TV Shows">
                {tvShows.map((show: Movie) => (
                    <MediaCard
                        key={show._id}
                        id={show._id}
                        title={show.title}
                        slug={show.slug.current}
                        posterImage={show.posterImage}
                        tmdbId={show.tmdbId}
                        rating={show.rating}
                        releaseYear={show.releaseYear}
                        type="tv"
                    />
                ))}
            </ContentGrid>
        );
    } catch (error) {
        console.error("Failed to fetch TV shows:", error);
        return <div className="w-full h-40 flex items-center justify-center text-zinc-500">Failed to load content. Please check your connection.</div>;
    }
}
