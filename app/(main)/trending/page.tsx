import { getTrendingMovies } from "@/lib/sanity";
import { MediaCard } from "@/components/MediaCard";

export default async function TrendingPage() {
    const trending = await getTrendingMovies(50);

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <div className="container mx-auto px-4">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                        Trending Now
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        What&apos;s hot right now - the most popular movies and shows
                    </p>
                </div>

                {/* Trending Content Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {trending?.map((item: any) => (
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
                </div>

                {trending?.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-zinc-400 text-lg">No trending content available at the moment.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
