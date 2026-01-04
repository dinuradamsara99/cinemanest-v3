import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarSkeleton } from "@/components/AppSidebarSkeleton";
import { SiteHeaderSkeleton } from "@/components/SiteHeaderSkeleton";
import { HeroSliderSkeleton } from "@/components/HeroSliderSkeleton";
import { CarouselSkeleton } from "@/components/CarouselSkeleton";

/**
 * LayoutSkeleton - Complete skeleton for the entire page
 * Shows sidebar, header, and page content skeletons during initial load
 */
export function LayoutSkeleton() {
    return (
        <SidebarProvider>
            {/* Sidebar Skeleton */}
            <AppSidebarSkeleton />

            <SidebarInset>
                {/* Header Skeleton */}
                <SiteHeaderSkeleton />

                {/* Main Content Skeletons */}
                <main className="flex-1 min-h-screen bg-background">
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
            </SidebarInset>
        </SidebarProvider>
    );
}

