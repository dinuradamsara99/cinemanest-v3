import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { rateLimit, createRateLimitResponse, addRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';
import { sanitizeInput, validateLength, logSecurityEvent, SecurityEventType, verifyCSRFFromRequest, clampNumber } from '@/lib/security';

// GET - Fetch comments for a movie with pagination
export async function GET(request: NextRequest) {
    try {
        // SECURITY FIX: Add rate limiting for GET requests
        const rateLimitResult = await rateLimit(request, RateLimitPresets.READ);

        if (!rateLimitResult.success) {
            return createRateLimitResponse(rateLimitResult);
        }

        const movieId = request.nextUrl.searchParams.get('movieId');
        const cursor = request.nextUrl.searchParams.get('cursor');
        // SECURITY FIX: Clamp limit to prevent DoS via excessive data requests
        const rawLimit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
        const limit = clampNumber(rawLimit, 1, 100);

        if (!movieId) {
            return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id || null;

        // Build cursor condition for pagination
        const cursorCondition = cursor
            ? `AND c.created_at < (SELECT created_at FROM comments WHERE id = $3)`
            : '';

        // Fetch comments with pagination (limit + 1 to check if more exist)
        const params = cursor ? [movieId, currentUserId, cursor, limit + 1] : [movieId, currentUserId, limit + 1];

        const [countResult, result] = await Promise.all([
            query('SELECT COUNT(*)::int as total FROM comments WHERE movie_id = $1', [movieId]),
            query(`
      SELECT 
        c.id,
        c.movie_id,
        c.user_id,
        c.parent_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.name as user_name,
        u.image as user_avatar,
        COUNT(CASE WHEN cv.vote_type = 'like' THEN 1 END)::int AS likes,
        COUNT(CASE WHEN cv.vote_type = 'dislike' THEN 1 END)::int AS dislikes,
        BOOL_OR(cv.user_id = $2 AND cv.vote_type = 'like') AS user_liked,
        BOOL_OR(cv.user_id = $2 AND cv.vote_type = 'dislike') AS user_disliked
      FROM comments c
      JOIN "User" u ON c.user_id = u.id
      LEFT JOIN comment_votes cv ON c.id = cv.comment_id
      WHERE c.movie_id = $1 ${cursorCondition}
      GROUP BY c.id, u.name, u.image
      ORDER BY c.created_at DESC
      LIMIT $${cursor ? '4' : '3'}
    `, params)
        ]);

        const totalCount = countResult.rows[0]?.total || 0;

        // Check if there are more comments
        const hasMore = result.rows.length > limit;
        const comments = result.rows.slice(0, limit);

        // Build nested comment structure
        const commentsMap = new Map();
        const rootComments: any[] = [];

        // First pass: create all comment objects
        comments.forEach((row: any) => {
            commentsMap.set(row.id, {
                id: row.id,
                movieId: row.movie_id,
                userId: row.user_id,
                parentId: row.parent_id,
                content: row.content,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                userName: row.user_name,
                userAvatar: row.user_avatar,
                likes: row.likes,
                dislikes: row.dislikes,
                userLiked: row.user_liked,
                userDisliked: row.user_disliked,
                replies: []
            });
        });

        // Second pass: build tree structure
        comments.forEach((row: any) => {
            const comment = commentsMap.get(row.id);
            if (row.parent_id) {
                const parent = commentsMap.get(row.parent_id);
                if (parent) {
                    parent.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        // Get next cursor (last comment's id)
        const nextCursor = hasMore && rootComments.length > 0
            ? rootComments[rootComments.length - 1].id
            : null;

        return NextResponse.json({
            comments: rootComments,
            nextCursor,
            hasMore,
            totalCount,
        });
    } catch (error: any) {
        console.error('Get comments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST - Add new comment
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { movieId, content, parentId } = await request.json();

        if (!movieId || !content) {
            return NextResponse.json(
                { error: 'Movie ID and content are required' },
                { status: 400 }
            );
        }

        // SECURITY FIX: Verify CSRF token for state-changing operations
        const csrfCheck = verifyCSRFFromRequest(request, session.user.id);
        if (!csrfCheck.valid) {
            return csrfCheck.errorResponse;
        }

        // SECURITY: Rate limit comment posting to prevent spam
        const rateLimitResult = await rateLimit(request, {
            ...RateLimitPresets.MUTATION,
            identifier: session.user.id,
        });

        if (!rateLimitResult.success) {
            logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
                userId: session.user.id,
                endpoint: '/api/comments',
                action: 'POST',
            });
            return createRateLimitResponse(rateLimitResult);
        }

        // SECURITY: Sanitize input to prevent XSS
        const sanitizedContent = sanitizeInput(content);

        // Validate content length
        if (!validateLength(sanitizedContent, 1, 5000)) {
            return NextResponse.json(
                { error: 'Comment must be between 1 and 5000 characters' },
                { status: 400 }
            );
        }

        const result = await query(`
      INSERT INTO comments (movie_id, user_id, content, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [movieId, session.user.id, sanitizedContent, parentId || null]);

        const newComment = result.rows[0];

        // Fetch user details
        const userResult = await query(
            'SELECT name, image FROM "User" WHERE id = $1',
            [session.user.id]
        );

        return NextResponse.json({
            id: newComment.id,
            movieId: newComment.movie_id,
            userId: newComment.user_id,
            parentId: newComment.parent_id,
            content: newComment.content,
            createdAt: newComment.created_at,
            updatedAt: newComment.updated_at,
            userName: userResult.rows[0].name,
            userAvatar: userResult.rows[0].image,
            likes: 0,
            dislikes: 0,
            replies: [],
            userLiked: false,
            userDisliked: false,
        });
    } catch (error: any) {
        console.error('Post comment error:', error);
        return NextResponse.json(
            { error: 'Failed to post comment' },
            { status: 500 }
        );
    }
}
