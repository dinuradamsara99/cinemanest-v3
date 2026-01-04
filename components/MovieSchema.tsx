import { Movie } from '@/types/movie';

interface MovieSchemaProps {
    movie: Movie;
}

export function MovieSchema({ movie }: MovieSchemaProps) {
    const posterUrl = movie.posterImage?.asset ?
        (typeof movie.posterImage.asset === 'object' && '_ref' in movie.posterImage.asset
            ? `https://cinemanest.com/api/poster/${movie.posterImage.asset._ref}`
            : movie.posterImage.asset.url)
        : undefined;

    const schema = {
        '@context': 'https://schema.org',
        '@type': movie.contentType === 'tvshow' ? 'TVSeries' : 'Movie',
        name: movie.title,
        description: movie.description,
        image: posterUrl,
        datePublished: movie.releaseYear?.toString(),
        genre: movie.genre,
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
                item: 'https://cinemanest.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: movie.contentType === 'tvshow' ? 'TV Shows' : 'Movies',
                item: `https://cinemanest.com/${movie.contentType === 'tvshow' ? 'tv-shows' : 'movies'}`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: movie.title,
                item: `https://cinemanest.com/watch/${movie.slug?.current}`
            }
        ]
    };

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
