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

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function fetchTMDBMetadata(tmdbId: number, contentType: 'movie' | 'tvshow' = 'movie') {
    if (!TMDB_API_KEY) {
        console.warn('TMDB_API_KEY is not set');
        return null;
    }

    // Determine the correct endpoint based on content type
    const mediaType = contentType === 'tvshow' ? 'tv' : 'movie';

    try {
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
            fetch(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}`),
            fetch(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}/credits?api_key=${TMDB_API_KEY}`),
            fetch(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}/videos?api_key=${TMDB_API_KEY}`),
        ]);

        if (!detailsRes.ok || !creditsRes.ok || !videosRes.ok) {
            console.error(`Failed to fetch ${mediaType} data from TMDB`, {
                details: detailsRes.status,
                credits: creditsRes.status,
                videos: videosRes.status
            });
            return null;
        }

        const details = await detailsRes.json();
        const credits = await creditsRes.json();
        const videos = await videosRes.json();

        console.log(`[TMDB] Fetched ${mediaType} metadata for ID ${tmdbId}:`, {
            title: details.title || details.name,
            videosCount: videos.results?.length || 0
        });

        // Extract Release Year (different field for TV shows)
        const releaseYear = contentType === 'tvshow'
            ? (details.first_air_date ? new Date(details.first_air_date).getFullYear() : undefined)
            : (details.release_date ? new Date(details.release_date).getFullYear() : undefined);

        // Extract Rating
        const rating = details.vote_average;

        // Extract Director (movies) or Creator (TV shows)
        let director: string | undefined;
        if (contentType === 'tvshow') {
            director = details.created_by?.[0]?.name;
        } else {
            director = credits.crew?.find((member: any) => member.job === 'Director')?.name;
        }

        // Extract Cast
        const cast = (credits.cast || []).slice(0, 10).map((member: any) => ({
            name: member.name,
            character: member.character,
            profilePath: member.profile_path ? `${TMDB_IMAGE_BASE_URL}${member.profile_path}` : null,
        }));

        // Extract Trailer
        let trailer = videos.results?.find(
            (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        );

        // Fallback to Teaser if no Trailer found
        if (!trailer) {
            trailer = videos.results?.find(
                (video: any) => video.type === 'Teaser' && video.site === 'YouTube'
            );
        }

        if (!trailer) {
            console.warn(`[TMDB] No trailer or teaser found for ${mediaType} ID ${tmdbId}.`);
        }

        const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;

        console.log(`[TMDB] Final Trailer URL: ${trailerUrl}`);

        return {
            releaseYear,
            rating,
            director,
            cast,
            trailerUrl,
        };
    } catch (error) {
        console.error('Error fetching TMDB metadata:', error);
        return null;
    }
}

export default async function WatchPage(props: WatchPageProps) {
    try {
        // Await params in Next.js 15+
        const params = await props.params;
        const { slug } = params;

        // Fetch movie/TV show data from Sanity
        let movie = await getMovieBySlug(slug);

        // If no movie found, show 404
        if (!movie) {
            notFound();
        }

        // Determine content type (movie or tvshow)
        const contentType: 'movie' | 'tvshow' =
            (movie._type === 'tvshow' || movie.contentType === 'tvshow') ? 'tvshow' : 'movie';

        console.log(`[DEBUG] Content: "${movie.title}", _type: "${movie._type}", contentType field: "${movie.contentType}", detected as: "${contentType}"`);

        // Fetch TMDB Metadata if tmdbId exists
        if (movie.tmdbId) {
            const tmdbData = await fetchTMDBMetadata(movie.tmdbId, contentType);
            if (tmdbData) {
                movie = {
                    ...movie,
                    ...tmdbData,
                    // Prefer TMDB data, but fallback to Sanity if needed
                };
            }
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

