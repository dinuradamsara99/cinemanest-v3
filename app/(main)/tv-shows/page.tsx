import { getTVShows } from "@/lib/sanity";
import { MediaCard } from "@/components/MediaCard";
import { ContentCarousel, CarouselItemWrapper } from "@/components/ContentCarousel";

export default async function TVShowsPage() {
    const tvShows = await getTVShows(50);

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <div className="container mx-auto px-4">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                        TV Shows
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Discover the best TV series from around the world
                    </p>
                </div>

                {/* TV Shows Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {tvShows?.map((show: any) => (
                        <MediaCard
                            key={show._id}
                            id={show._id}
                            title={show.title}
                            slug={show.slug.current}
                            posterImage={show.posterImage}
                            rating={show.rating}
                            releaseYear={show.releaseYear}
                            type="tv"
                        />
                    ))}
                </div>

                {tvShows?.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-zinc-400 text-lg">No TV shows found.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
