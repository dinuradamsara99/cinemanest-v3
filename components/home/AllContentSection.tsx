
import { getRecentlyAddedMovies } from "@/lib/sanity";
import { ContentGrid } from "@/components/ContentGrid";
import { MediaCard } from "@/components/MediaCard";
import { Movie } from "@/types/movie";

export async function AllContentSection() {
    try {
        const content = await getRecentlyAddedMovies(30);

        if (!content || content.length === 0) {
            return null;
        }

        return (
            <ContentGrid title="Recently Added">
                {content.map((item: Movie) => (
                    <MediaCard
                        key={item._id}
                        id={item._id}
                        title={item.title}
                        slug={item.slug.current}
                        posterImage={item.posterImage}
                        tmdbId={item.tmdbId}
                        rating={item.rating}
                        releaseYear={item.releaseYear}
                        type={item._type === "tvshow" ? "tv" : "movie"}
                    />
                ))}
            </ContentGrid>
        );
    } catch (error) {
        console.error("Failed to fetch content:", error);
        return <div className="w-full h-40 flex items-center justify-center text-zinc-500">Failed to load content. Please check your connection.</div>;
    }
}
