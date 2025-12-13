import { defineField, defineType } from 'sanity'

export const movieType = defineType({
    name: 'movie',
    title: 'Movie',
    type: 'document',
    icon: () => '🎬',
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
            description: 'Show this movie in the hero section',
            initialValue: false,
        }),
        defineField({
            name: 'isTrending',
            title: 'Trending Now ✓',
            type: 'boolean',
            description: 'Check this to add movie to Trending Now section',
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
            name: 'duration',
            title: 'Duration (minutes)',
            type: 'number',
            validation: (Rule) => Rule.required().integer().positive(),
        }),
        defineField({
            name: 'genre',
            title: 'Genre',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
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
                ],
            },
        }),
        defineField({
            name: 'language',
            title: 'Language',
            type: 'reference',
            to: [{ type: 'language' }],
            description: 'Select the language of this movie',
        }),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
            description: 'Select categories/playlists for this movie',
        }),
        defineField({
            name: 'videoUrl',
            title: 'Video URL',
            type: 'url',
            description: 'Link to the video (YouTube, Vimeo, etc.)',
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
    ],
    preview: {
        select: {
            title: 'title',
            releaseYear: 'releaseYear',
            duration: 'duration',
            media: 'posterImage',
        },
        prepare({ title, releaseYear, duration, media }) {
            return {
                title,
                subtitle: `${releaseYear} • ${duration} min`,
                media,
            }
        },
    },
})
