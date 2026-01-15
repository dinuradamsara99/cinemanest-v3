
import { getFeaturedMovies } from "@/lib/sanity";
import { HeroSlider } from "@/components/HeroSlider";

export async function FeaturedSection() {
    try {
        const featured = await getFeaturedMovies();
        if (!featured) return null; // or return some fallback UI
        return <HeroSlider items={featured} />;
    } catch (error) {
        console.error("Failed to fetch featured content:", error);
        return <div className="hidden">Failed to load particular section</div>; // Graceful degradation
    }
}
