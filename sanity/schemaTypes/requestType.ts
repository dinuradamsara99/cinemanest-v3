import { defineField, defineType } from 'sanity'

export const requestType = defineType({
    name: 'request',
    title: 'Request',
    type: 'document',
    icon: () => '📝',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'The name of the movie or TV show',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'mediaType',
            title: 'Media Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Movie', value: 'movie' },
                    { title: 'TV Show', value: 'tvshow' },
                ],
                layout: 'radio',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'notes',
            title: 'Additional Notes',
            type: 'text',
            description: 'Any additional details from the user',
            rows: 4,
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'New', value: 'new' },
                    { title: 'In Review', value: 'in-review' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Rejected', value: 'rejected' },
                ],
                layout: 'radio',
            },
            initialValue: 'new',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'submittedAt',
            title: 'Submitted At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            readOnly: true,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            mediaType: 'mediaType',
            status: 'status',
        },
        prepare({ title, mediaType, status }: { title?: string; mediaType?: string; status?: 'new' | 'in-review' | 'completed' | 'rejected' }) {
            const mediaTypeLabel = mediaType === 'movie' ? 'Movie' : 'TV Show';
            const statusEmojiMap: Record<'new' | 'in-review' | 'completed' | 'rejected', string> = {
                new: '🆕',
                'in-review': '👀',
                completed: '✅',
                rejected: '❌',
            };
            const statusEmoji = status ? statusEmojiMap[status] : '📝';

            return {
                title: title || 'Untitled Request',
                subtitle: `${mediaTypeLabel} • ${statusEmoji} ${(status ?? 'new').toUpperCase()}`,
            }
        },
    },
    orderings: [
        {
            title: 'Submitted Date, Newest',
            name: 'submittedAtDesc',
            by: [{ field: 'submittedAt', direction: 'desc' }],
        },
        {
            title: 'Submitted Date, Oldest',
            name: 'submittedAtAsc',
            by: [{ field: 'submittedAt', direction: 'asc' }],
        },
        {
            title: 'Status',
            name: 'statusAsc',
            by: [{ field: 'status', direction: 'asc' }],
        },
    ],
})

