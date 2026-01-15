
import { Suspense } from "react";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { MoviesSection } from "@/components/home/MoviesSection";
import { TVShowsSection } from "@/components/home/TVShowsSection";
import { HeroSliderSkeleton } from "@/components/HeroSliderSkeleton";
import { SectionSkeleton } from "@/components/home/SectionSkeleton";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-background">
            <h1 className="sr-only">CinemaNest - Watch Movies & TV Shows Online</h1>

            {/* Hero Slider with Suspense */}
            <Suspense fallback={<HeroSliderSkeleton />}>
                <FeaturedSection />
            </Suspense>

            {/* Movies Grid with Suspense */}
            <div id="movies">
                <Suspense fallback={<SectionSkeleton title="Popular Movies" />}>
                    <MoviesSection />
                </Suspense>
            </div>

            {/* TV Shows Grid with Suspense */}
            <div id="tv-shows">
                <Suspense fallback={<SectionSkeleton title="Popular TV Shows" />}>
                    <TVShowsSection />
                </Suspense>
            </div>

            {/* Additional Sections can be added here */}
            <div className="py-12" />
        </main>
    );
}
