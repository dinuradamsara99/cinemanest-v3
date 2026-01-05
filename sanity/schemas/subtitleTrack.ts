// sanity/schemas/subtitleTrack.ts
// Fresh subtitle schema with new name to avoid caching issues

import { defineType } from 'sanity'

export const subtitleTrack = defineType({
    name: 'subtitleTrack',
    title: 'Subtitle',
    type: 'object',
    fields: [
        {
            name: 'label',
            title: 'Subtitle Label',
            type: 'string',
            description: 'Display name (e.g., "English", "සිංහල", "தමிழ்")',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'language',
            title: 'Language Code',
            type: 'string',
            description: 'ISO 639-1 code (e.g., "en", "si", "ta")',
            validation: (Rule) => Rule.required().length(2),
            options: {
                list: [
                    { title: 'English', value: 'en' },
                    { title: 'Sinhala', value: 'si' },
                    { title: 'Tamil', value: 'ta' },
                    { title: 'Hindi', value: 'hi' },
                    { title: 'Spanish', value: 'es' },
                    { title: 'French', value: 'fr' },
                ],
            },
        },
        {
            name: 'file',
            title: 'Subtitle File',
            type: 'file',
            description: 'Upload .vtt or .srt file',
            options: {
                accept: '.vtt,.srt',
            },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'isDefault',
            title: 'Default Track',
            type: 'boolean',
            description: 'Enable this subtitle by default',
            initialValue: false,
        },
        {
            name: 'downloadEnabled',
            title: 'Enable Download',
            type: 'boolean',
            description: 'Allow users to download this subtitle file',
            initialValue: false,
        },
    ],
    preview: {
        select: {
            title: 'label',
            subtitle: 'language',
            isDefault: 'isDefault',
        },
        prepare(selection) {
            const { title, subtitle, isDefault } = selection
            return {
                title: `${title} (${subtitle})`,
                subtitle: isDefault ? '⭐ Default' : 'Optional',
            }
        },
    },
})
