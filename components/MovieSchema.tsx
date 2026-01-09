import { Movie } from '@/types/movie';
import { SITE_URL } from '@/lib/constants';
import { sanitizeForJsonLd } from '@/lib/security';

interface MovieSchemaProps {
    movie: Movie;
}

/**
 * Safe JSON-LD Schema component
 * Uses sanitization to prevent XSS in structured data
 */
export function MovieSchema({ movie }: MovieSchemaProps) {
    const posterUrl = movie.posterImage?.asset ?
        (typeof movie.posterImage.asset === 'object' && '_ref' in movie.posterImage.asset
            ? `https://cinemanestlk.vercel.app/api/poster/${movie.posterImage.asset._ref}`
            : movie.posterImage.asset.url)
        : undefined;

    // Sanitize all user-controlled content
    const safeTitle = sanitizeForJsonLd(movie.title || '');
    const safeDescription = sanitizeForJsonLd(movie.description || '');
    const safeGenre = movie.genre
        ? (Array.isArray(movie.genre)
            ? movie.genre.map(g => sanitizeForJsonLd(g))
            : sanitizeForJsonLd(movie.genre as string))
        : undefined;
    const safeSlug = movie.slug?.current ? sanitizeForJsonLd(movie.slug.current) : '';

    const schema = {
        '@context': 'https://schema.org',
        '@type': movie.contentType === 'tvshow' ? 'TVSeries' : 'Movie',
        name: safeTitle,
        description: safeDescription,
        image: posterUrl,
        datePublished: movie.releaseYear?.toString(),
        genre: safeGenre,
        aggregateRating: movie.rating ? {
            '@type': 'AggregateRating',
            ratingValue: movie.rating,
            bestRating: 10,
            worstRating: 0
        } : undefined,
        duration: movie.duration ? `PT${movie.duration}M` : undefined,
    };

    // Add breadcrumb schema
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: SITE_URL
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: movie.contentType === 'tvshow' ? 'TV Shows' : 'Movies',
                item: `${SITE_URL}/${movie.contentType === 'tvshow' ? 'tv-shows' : 'movies'}`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: safeTitle,
                item: `${SITE_URL}/watch/${safeSlug}`
            }
        ]
    };

    // Render using a safe method - the schema objects are now sanitized
    // JSON.stringify handles escaping, combined with our sanitizeForJsonLd
    return (
        <>
            <script
                id="movie-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <script
                id="breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}
