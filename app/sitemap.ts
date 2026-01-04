import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://cinemanest.com'

    // Fetch all movies and shows from Sanity
    const movies = await client.fetch(`
    *[_type in ["movie", "tvshow"]] {
      "slug": slug.current,
      _updatedAt,
      contentType
    }
  `)

    const movieUrls = movies.map((movie: any) => ({
        url: `${baseUrl}/watch/${movie.slug}`,
        lastModified: new Date(movie._updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/movies`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/tv-shows`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...movieUrls,
    ]
}
