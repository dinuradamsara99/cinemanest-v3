import { getMovies, getTVShows, getFeaturedMovies } from "@/lib/sanity";
import { MediaCard } from "@/components/MediaCard";
import { ContentGrid } from "@/components/ContentGrid";
import { HeroSlider } from "@/components/HeroSlider";

export default async function HomePage() {
    const [movies, tvShows, featured] = await Promise.all([
        getMovies(15),
        getTVShows(15),
        getFeaturedMovies(),
    ]);

    console.log('Movies fetched:', movies?.length || 0);
    console.log('TV Shows fetched:', tvShows?.length || 0);
    console.log('Featured fetched:', featured?.length || 0);
    console.log('First movie:', movies?.[0]?.title);

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Slider */}
            <HeroSlider items={featured} />

            {/* Movies Grid */}
            <div id="movies">
                <ContentGrid title="Popular Movies">
                    {movies.map((movie: any) => (
                        <MediaCard
                            key={movie._id}
                            id={movie._id}
                            title={movie.title}
                            slug={movie.slug.current}
                            posterImage={movie.posterImage}
                            rating={movie.rating}
                            releaseYear={movie.releaseYear}
                            type="movie"
                        />
                    ))}
                </ContentGrid>
            </div>

            {/* TV Shows Grid */}
            <div id="tv-shows">
                <ContentGrid title="Popular TV Shows">
                    {tvShows.map((show: any) => (
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
                </ContentGrid>
            </div>

            {/* Additional Sections can be added here */}
            <div className="py-12" />
        </main>
    );
}
