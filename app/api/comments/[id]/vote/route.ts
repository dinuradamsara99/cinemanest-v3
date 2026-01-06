import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Vote on comment (like/dislike)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { voteType } = await request.json(); // 'like' or 'dislike'
        const { id: commentId } = await params;

        if (!voteType || !['like', 'dislike'].includes(voteType)) {
            return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
        }

        // Check if user already voted
        const existingVote = await query(`
      SELECT vote_type FROM comment_votes
      WHERE comment_id = $1 AND user_id = $2
    `, [commentId, session.user.id]);

        if (existingVote.rows.length > 0) {
            const currentVote = existingVote.rows[0].vote_type;

            if (currentVote === voteType) {
                // Remove vote (toggle off)
                await query(`
          DELETE FROM comment_votes
          WHERE comment_id = $1 AND user_id = $2
        `, [commentId, session.user.id]);
            } else {
                // Update vote type
                await query(`
          UPDATE comment_votes
          SET vote_type = $1
          WHERE comment_id = $2 AND user_id = $3
        `, [voteType, commentId, session.user.id]);
            }
        } else {
            // Insert new vote
            await query(`
        INSERT INTO comment_votes (comment_id, user_id, vote_type)
        VALUES ($1, $2, $3)
      `, [commentId, session.user.id, voteType]);
        }

        // Return updated vote counts
        const voteCounts = await query(`
      SELECT 
        COUNT(CASE WHEN vote_type = 'like' THEN 1 END)::int AS likes,
        COUNT(CASE WHEN vote_type = 'dislike' THEN 1 END)::int AS dislikes,
        BOOL_OR(user_id = $2 AND vote_type = 'like') AS user_liked,
        BOOL_OR(user_id = $2 AND vote_type = 'dislike') AS user_disliked
      FROM comment_votes
      WHERE comment_id = $1
    `, [commentId, session.user.id]);

        return NextResponse.json(voteCounts.rows[0]);
    } catch (error: any) {
        console.error('Vote comment error:', error);
        return NextResponse.json(
            { error: 'Failed to vote on comment' },
            { status: 500 }
        );
    }
}
