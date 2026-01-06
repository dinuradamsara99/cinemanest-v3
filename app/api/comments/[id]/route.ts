import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

// PUT - Update comment
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await request.json();
        const { id: commentId } = await params;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Check ownership
        const ownerCheck = await query(
            'SELECT user_id FROM comments WHERE id = $1',
            [commentId]
        );

        if (ownerCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        if (ownerCheck.rows[0].user_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update comment
        const result = await query(`
      UPDATE comments
      SET content = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [content, commentId]);

        const updatedComment = result.rows[0];
        return NextResponse.json({
            id: updatedComment.id,
            movieId: updatedComment.movie_id,
            userId: updatedComment.user_id,
            parentId: updatedComment.parent_id,
            content: updatedComment.content,
            createdAt: updatedComment.created_at,
            updatedAt: updatedComment.updated_at,
        });
    } catch (error: any) {
        console.error('Update comment error:', error);
        return NextResponse.json(
            { error: 'Failed to update comment' },
            { status: 500 }
        );
    }
}

// DELETE - Delete comment
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: commentId } = await params;

        // Check ownership
        const ownerCheck = await query(
            'SELECT user_id FROM comments WHERE id = $1',
            [commentId]
        );

        if (ownerCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        if (ownerCheck.rows[0].user_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete comment (cascade will delete votes and replies)
        await query('DELETE FROM comments WHERE id = $1', [commentId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete comment error:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
