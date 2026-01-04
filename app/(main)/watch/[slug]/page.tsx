import { notFound } from "next/navigation";
import { getMovieBySlug } from "@/lib/sanity";
import { WatchPageClient } from "@/components/WatchPageClient";

interface WatchPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function WatchPage(props: WatchPageProps) {
    // Await params in Next.js 15+
    const params = await props.params;
    const { slug } = params;

    // Fetch movie/TV show data from Sanity
    const movie = await getMovieBySlug(slug);

    // If no movie found, show 404
    if (!movie) {
        notFound();
    }

    // Render the client component with the movie data
    return <WatchPageClient movie={movie} />;
}

// Optional: Generate metadata for SEO
export async function generateMetadata(props: WatchPageProps) {
    const params = await props.params;
    const { slug } = params;
    const movie = await getMovieBySlug(slug);

    if (!movie) {
        return {
            title: "Not Found",
        };
    }

    return {
        title: `${movie.title} - CinemaNest`,
        description: movie.description || `Watch ${movie.title} on CinemaNest`,
    };
}

