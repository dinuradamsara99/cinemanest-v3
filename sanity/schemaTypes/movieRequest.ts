import { defineField, defineType } from 'sanity'

export const movieRequest = defineType({
    name: 'movieRequest',
    title: 'Movie Request',
    type: 'document',
    fields: [
        defineField({
            name: 'movieName',
            title: 'Movie/Show Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'youtubeLink',
            title: 'YouTube Link',
            type: 'url',
        }),
        defineField({
            name: 'notes',
            title: 'Additional Details/Notes',
            type: 'text',
        }),
        defineField({
            name: 'userId',
            title: 'User ID',
            type: 'string',
            validation: (Rule) => Rule.required(),
            readOnly: true,
        }),
        defineField({
            name: 'userEmail',
            title: 'User Email',
            type: 'string',
            readOnly: true,
        }),
        defineField({
            name: 'status',
            title: 'Request Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Processing', value: 'processing' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Rejected', value: 'rejected' },
                ],
                layout: 'dropdown',
            },
            initialValue: 'pending',
        }),
    ],
    preview: {
        select: {
            title: 'movieName',
            subtitle: 'status',
            user: 'userEmail',
        },
        prepare(selection) {
            const { title, subtitle, user } = selection
            return {
                title: title,
                subtitle: `${subtitle.charAt(0).toUpperCase() + subtitle.slice(1)} - Requested by: ${user || 'Unknown'}`,
            }
        },
    },
})
