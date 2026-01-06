import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { SITE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL

    try {
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
                url: `${baseUrl}/trending`,
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
            {
                url: `${baseUrl}/account`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
            {
                url: `${baseUrl}/privacy`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.3,
            },
            {
                url: `${baseUrl}/terms`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.3,
            },
            {
                url: `${baseUrl}/contact`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.4,
            },
            ...movieUrls,
        ]
    } catch (error) {
        console.error('Error generating sitemap:', error)
        // Return minimal sitemap on error
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
        ]
    }
}
