import { defineField, defineType } from 'sanity'

export const languageType = defineType({
    name: 'language',
    title: 'Language',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'Language name (e.g., English, Sinhala, Tamil)',
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
    ],
    preview: {
        select: {
            title: 'title',
        },
    },
})
