import { defineField, defineType } from 'sanity'

export const tvShowType = defineType({
    name: 'tvshow',
    title: 'TV Show',
    type: 'document',
    icon: () => '📺',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'posterImage',
            title: 'Poster Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                },
            ],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'bannerImage',
            title: 'Banner Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                },
            ],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'rating',
            title: 'Rating',
            type: 'number',
            validation: (Rule) => Rule.required().min(0).max(10),
            description: 'Rating from 0 to 10',
        }),
        defineField({
            name: 'isFeatured',
            title: 'Is Featured',
            type: 'boolean',
            description: 'Show this TV Show in the hero section',
            initialValue: false,
        }),
        defineField({
            name: 'isTrending',
            title: 'Trending Now ✓',
            type: 'boolean',
            description: 'Check this to add TV Show to Trending Now section',
            initialValue: false,
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'releaseYear',
            title: 'Release Year',
            type: 'number',
            validation: (Rule) => Rule.required().integer().positive(),
        }),
        defineField({
            name: 'genre',
            title: 'Genre',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                layout: 'tags',
                list: [
                    { title: 'Action', value: 'action' },
                    { title: 'Adventure', value: 'adventure' },
                    { title: 'Comedy', value: 'comedy' },
                    { title: 'Drama', value: 'drama' },
                    { title: 'Fantasy', value: 'fantasy' },
                    { title: 'Horror', value: 'horror' },
                    { title: 'Mystery', value: 'mystery' },
                    { title: 'Romance', value: 'romance' },
                    { title: 'Sci-Fi', value: 'sci-fi' },
                    { title: 'Thriller', value: 'thriller' },
                    { title: 'Documentary', value: 'documentary' },
                    { title: 'Animation', value: 'animation' },
                ],
            },
        }),
        defineField({
            name: 'language',
            title: 'Language',
            type: 'reference',
            to: [{ type: 'language' }],
            description: 'Select the language of this TV Show',
        }),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
            description: 'Select categories/playlists for this TV Show',
        }),
        defineField({
            name: 'trailerUrl',
            title: 'Trailer URL',
            type: 'url',
            description: 'Optional trailer video URL (YouTube, Vimeo, etc.)',
            validation: Rule => Rule.uri({
                allowRelative: false,
                scheme: ['http', 'https']
            })
        }),
        defineField({
            name: 'credit',
            title: 'Video Credit',
            type: 'text',
            rows: 3,
            description: 'Credit text for the video (e.g., "Video courtesy of...", "Special thanks to...")',
        }),
        defineField({
            name: 'seasons',
            title: 'Seasons',
            type: 'array',
            description: 'Add seasons and episodes',
            of: [
                {
                    type: 'object',
                    name: 'season',
                    title: 'Season',
                    fields: [
                        {
                            name: 'seasonNumber',
                            title: 'Season Number',
                            type: 'number',
                            validation: (Rule) => Rule.required().positive().integer(),
                        },
                        {
                            name: 'title',
                            title: 'Season Title',
                            type: 'string',
                            description: 'Optional title (e.g., "The Beginning")',
                        },
                        {
                            name: 'episodes',
                            title: 'Episodes',
                            type: 'array',
                            of: [
                                {
                                    type: 'object',
                                    name: 'episode',
                                    title: 'Episode',
                                    fields: [
                                        {
                                            name: 'episodeNumber',
                                            title: 'Episode Number',
                                            type: 'number',
                                            validation: (Rule) => Rule.required().positive().integer(),
                                        },
                                        {
                                            name: 'title',
                                            title: 'Episode Title',
                                            type: 'string',
                                            validation: (Rule) => Rule.required(),
                                        },
                                        {
                                            name: 'thumbnail',
                                            title: 'Episode Thumbnail',
                                            type: 'image',
                                            options: { hotspot: true },
                                        },
                                        {
                                            name: 'videoUrl',
                                            title: 'Video URL',
                                            type: 'url',
                                            description: 'Link to the episode video',
                                            validation: (Rule) => Rule.required(),
                                        },
                                        {
                                            name: 'duration',
                                            title: 'Duration (minutes)',
                                            type: 'number',
                                            validation: (Rule) => Rule.positive().integer(),
                                        },
                                        {
                                            name: 'credit',
                                            title: 'Episode Credit',
                                            type: 'text',
                                            rows: 3,
                                            description: 'Credit text for this episode (e.g., "Subtitle created by...", "Special thanks to...")',
                                        },
                                    ],
                                    preview: {
                                        select: {
                                            title: 'title',
                                            episodeNumber: 'episodeNumber',
                                            media: 'thumbnail',
                                        },
                                        prepare({ title, episodeNumber, media }) {
                                            return {
                                                title: `E${episodeNumber}: ${title}`,
                                                media,
                                            }
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                    preview: {
                        select: {
                            seasonNumber: 'seasonNumber',
                            title: 'title',
                            episodes: 'episodes',
                        },
                        prepare({ seasonNumber, title, episodes }) {
                            const episodeCount = episodes?.length || 0
                            return {
                                title: `Season ${seasonNumber}${title ? `: ${title}` : ''}`,
                                subtitle: `${episodeCount} episode${episodeCount !== 1 ? 's' : ''}`,
                            }
                        },
                    },
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            releaseYear: 'releaseYear',
            media: 'posterImage',
            seasons: 'seasons',
        },
        prepare({ title, releaseYear, media, seasons }) {
            const seasonCount = seasons?.length || 0
            return {
                title,
                subtitle: `${releaseYear} • ${seasonCount} season${seasonCount !== 1 ? 's' : ''}`,
                media,
            }
        },
    },
})
