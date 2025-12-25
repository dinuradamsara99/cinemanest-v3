// sanity/schemas/subtitle.ts
// Sanity schema for subtitle objects

export default {
    name: 'subtitle',
    title: 'Subtitle Track',
    type: 'object',
    fields: [
        {
            name: 'label',
            title: 'Subtitle Label',
            type: 'string',
            description: 'Display name shown to users (e.g., "English", "සිංහල", "தமிழ்")',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'language',
            title: 'Language Code',
            type: 'string',
            description: 'ISO 639-1 language code (e.g., "en", "si", "ta")',
            validation: (Rule: any) => Rule.required().length(2),
            options: {
                list: [
                    { title: 'English', value: 'en' },
                    { title: 'Sinhala', value: 'si' },
                    { title: 'Tamil', value: 'ta' },
                    { title: 'Hindi', value: 'hi' },
                    { title: 'Spanish', value: 'es' },
                    { title: 'French', value: 'fr' },
                    { title: 'German', value: 'de' },
                    { title: 'Japanese', value: 'ja' },
                    { title: 'Korean', value: 'ko' },
                    { title: 'Chinese (Simplified)', value: 'zh' },
                ],
            },
        },
        {
            name: 'subtitleFile',
            title: 'Subtitle File',
            type: 'file',
            description: 'Upload .vtt or .srt file',
            options: {
                accept: '.vtt,.srt',
            },
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'isDefault',
            title: 'Set as Default',
            type: 'boolean',
            description: 'Make this subtitle track enabled by default',
            initialValue: false,
        },
    ],
    preview: {
        select: {
            title: 'label',
            subtitle: 'language',
            isDefault: 'isDefault',
        },
        prepare(selection: any) {
            const { title, subtitle, isDefault } = selection
            return {
                title: `${title} (${subtitle})`,
                subtitle: isDefault ? '⭐ Default Track' : 'Optional Track',
            }
        },
    },
}
