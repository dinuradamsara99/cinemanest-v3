import { notFound } from "next/navigation";
import { getMovieBySlug } from "@/lib/sanity";
import { WatchPageClient } from "@/components/WatchPageClient";
import { Suspense } from "react";
import { WatchPageSkeleton } from "@/components/WatchPageSkeleton";
import { sanitizeForJsonLd } from "@/lib/security";

interface WatchPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function WatchPage(props: WatchPageProps) {
    try {
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
        return (
            <WatchPageClient movie={movie} />
        );
    } catch (error) {
        console.error(`Error loading watch page for slug:`, error);
        throw error; // Re-throw to be caught by error.tsx
    }
}

// Optional: Generate metadata for SEO with Structured Data
export async function generateMetadata(props: WatchPageProps) {
    try {
        const params = await props.params;
        const { slug } = params;
        const movie = await getMovieBySlug(slug);

        if (!movie) {
            return {
                title: "Not Found",
            };
        }

        // Generate image URL for OpenGraph and Schema
        const imageUrl = movie.posterImage?.asset
            ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${movie.posterImage.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`
            : '/og-image.png';

        // Determine content type
        const isMovie = movie.contentType === 'movie' || movie._type === 'movie';

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinemanest.com';

        // Create Schema.org structured data
        const structuredData = {
            "@context": "https://schema.org",
            "@type": isMovie ? "Movie" : "TVSeries",
            // SECURITY FIX: Sanitize input for JSON-LD to prevent XSS
            "name": sanitizeForJsonLd(movie.title),
            "description": sanitizeForJsonLd(movie.description || `Watch ${movie.title} on CinemaNest - Stream in HD quality`),
            "image": imageUrl,
            "datePublished": movie.releaseYear ? `${movie.releaseYear}-01-01` : undefined,
            "aggregateRating": movie.rating ? {
                "@type": "AggregateRating",
                "ratingValue": movie.rating,
                "bestRating": 10,
                "worstRating": 0,
                "ratingCount": Math.floor(movie.rating * 100) // Estimated
            } : undefined,
            "genre": movie.categories?.map((cat: any) => sanitizeForJsonLd(cat.title)) || [],
            "inLanguage": movie.languages?.map((lang: any) => sanitizeForJsonLd(lang.title)) || ["English"],
            "contentRating": sanitizeForJsonLd(movie.contentRating || "Not Rated"),
            "duration": movie.duration ? `PT${movie.duration}M` : undefined,
            "url": `${baseUrl}/watch/${sanitizeForJsonLd(slug)}`,
            "potentialAction": {
                "@type": "WatchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${baseUrl}/watch/${sanitizeForJsonLd(slug)}`,
                    "actionPlatform": [
                        "http://schema.org/DesktopWebPlatform",
                        "http://schema.org/MobileWebPlatform"
                    ]
                }
            }
        };

        // Remove undefined fields
        Object.keys(structuredData).forEach(key =>
            structuredData[key as keyof typeof structuredData] === undefined &&
            delete structuredData[key as keyof typeof structuredData]
        );

        return {
            title: `${movie.title} - Watch on CinemaNest`,
            description: movie.description || `Watch ${movie.title} online in HD quality. Stream ${isMovie ? 'this movie' : 'this TV series'} on CinemaNest - Your premium streaming platform.`,
            keywords: [
                movie.title,
                `watch ${movie.title} online`,
                `${movie.title} streaming`,
                ...(movie.categories?.map((cat: any) => cat.title) || []),
                ...(movie.languages?.map((lang: any) => lang.title) || []),
            ],
            openGraph: {
                title: `${movie.title} - Watch on CinemaNest`,
                description: movie.description || `Watch ${movie.title} online in HD quality`,
                type: 'video.movie',
                url: `${baseUrl}/watch/${slug}`,
                images: [{
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: movie.title,
                }],
                siteName: 'CinemaNest',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${movie.title} - Watch on CinemaNest`,
                description: movie.description || `Watch ${movie.title} online in HD quality`,
                images: [imageUrl],
            },
            other: {
                // Add JSON-LD structured data
                'script:ld+json': JSON.stringify(structuredData),
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Error loading content - CinemaNest'
        };
    }
}

