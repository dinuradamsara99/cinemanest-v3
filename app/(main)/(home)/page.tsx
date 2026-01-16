
import { Suspense } from "react";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { AllContentSection } from "@/components/home/AllContentSection";
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

            {/* All Content (Movies + TV Shows Mixed) */}
            <div id="content">
                <Suspense fallback={<SectionSkeleton title="Recently Added" />}>
                    <AllContentSection />
                </Suspense>
            </div>

            {/* Additional Sections can be added here */}
            <div className="py-12" />
        </main>
    );
}
