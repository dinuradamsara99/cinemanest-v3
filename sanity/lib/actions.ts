import { DocumentActionComponent, DocumentActionsContext } from 'sanity'
import { CopyIcon } from '@sanity/icons'

// Duplicate Document Action
export function createDuplicateAction(originalAction: DocumentActionComponent): DocumentActionComponent {
    const DuplicateAction: DocumentActionComponent = (props) => {
        const originalResult = originalAction(props)

        return {
            ...originalResult,
            label: 'Duplicate',
            icon: CopyIcon,
            onHandle: async () => {
                const { draft, published } = props
                const doc = draft || published

                if (!doc) return

                // Create a duplicate with a new ID and modified title
                const docWithSlug = doc as { title?: string; slug?: { current?: string }; _rev?: string; _createdAt?: string; _updatedAt?: string }
                const duplicateDoc: Record<string, unknown> = {
                    ...doc,
                    _id: `drafts.${crypto.randomUUID()}`,
                    title: `${docWithSlug.title || 'Untitled'} (Copy)`,
                    slug: {
                        _type: 'slug',
                        current: `${docWithSlug.slug?.current || 'untitled'}-copy-${Date.now()}`,
                    },
                }

                // Remove fields that shouldn't be copied
                delete duplicateDoc._rev
                delete duplicateDoc._createdAt
                delete duplicateDoc._updatedAt

                try {
                    // Import the client
                    const { client } = await import('./client')
                    await client.create(duplicateDoc as Parameters<typeof client.create>[0])

                    // Show success notification
                    props.onComplete?.()
                } catch (error) {
                    console.error('Error duplicating document:', error)
                }
            },
        }
    }

    return DuplicateAction
}

// Document Actions Resolver
export function resolveDocumentActions(
    prev: DocumentActionComponent[],
    context: DocumentActionsContext
): DocumentActionComponent[] {
    // Only add duplicate action to movies and tvshows
    if (context.schemaType === 'movie' || context.schemaType === 'tvshow') {
        return prev.map((action) => {
            // Wrap the publish action with duplicate functionality
            if (action.action === 'duplicate') {
                return createDuplicateAction(action)
            }
            return action
        })
    }

    return prev
}
