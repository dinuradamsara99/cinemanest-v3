import { HeroSliderSkeleton } from "@/components/HeroSliderSkeleton";
import { CarouselSkeleton } from "@/components/CarouselSkeleton";

export default function Loading() {
    return (
        <main className="min-h-screen bg-background">
            {/* Hero Slider Skeleton */}
            <HeroSliderSkeleton />

            {/* Featured Carousel Skeleton */}
            <CarouselSkeleton title="Featured & Trending" count={5} />

            {/* Movies Carousel Skeleton */}
            <CarouselSkeleton title="Popular Movies" count={5} />

            {/* TV Shows Carousel Skeleton */}
            <CarouselSkeleton title="Popular TV Shows" count={5} />

            <div className="py-12" />
        </main>
    );
}
