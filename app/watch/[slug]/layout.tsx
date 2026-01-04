import { Metadata } from 'next';
import { getMovieBySlug } from '@/lib/sanity';
import { urlFor } from '@/lib/sanity';

type Props = {
    params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const movie = await getMovieBySlug(params.slug);

    if (!movie) {
        return {
            title: 'Movie Not Found',
            description: 'This movie or show is not available on CinemaNest.'
        }
    }

    const posterUrl = movie.posterImage?.asset
        ? urlFor(movie.posterImage).width(1200).height(630).url()
        : '';

    const releaseYear = movie.releaseYear || '';
    const contentTypeLabel = movie.contentType === 'tvshow' ? 'TV Series' : 'Movie';

    // SEO-optimized title format
    const title = `Watch ${movie.title}${releaseYear ? ` (${releaseYear})` : ''} - ${contentTypeLabel} | CinemaNest`;

    // Semantic description with keywords
    const description = movie.description
        ? `${movie.description.substring(0, 155)}... Watch ${movie.title} streaming online in HD${movie.genre?.length ? ` | Genres: ${movie.genre.join(', ')}` : ''}`
        : `Watch ${movie.title} streaming online in high quality. Stream full ${contentTypeLabel.toLowerCase()} on CinemaNest.`;

    // Keywords combining movie info
    const keywords = [
        movie.title,
        `${movie.title} streaming`,
        `watch ${movie.title} online`,
        ...(movie.genre || []),
        `${movie.title} ${releaseYear}`,
        `${movie.title} full ${contentTypeLabel.toLowerCase()}`,
        contentTypeLabel,
    ];

    return {
        title,
        description,
        keywords,
        authors: [{ name: 'CinemaNest' }],
        creator: 'CinemaNest',
        publisher: 'CinemaNest',
        openGraph: {
            title,
            description,
            url: `https://cinemanest.com/watch/${params.slug}`,
            siteName: 'CinemaNest',
            images: [
                {
                    url: posterUrl,
                    width: 1200,
                    height: 630,
                    alt: `${movie.title} Poster`,
                }
            ],
            locale: 'en_US',
            type: 'video.movie',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [posterUrl],
            creator: '@cinemanest',
        },
        alternates: {
            canonical: `https://cinemanest.com/watch/${params.slug}`,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}

export default function WatchLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children;
}
