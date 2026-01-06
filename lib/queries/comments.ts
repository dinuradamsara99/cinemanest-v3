import { Comment } from '@/components/CommentSection';

export interface PaginatedComments {
    comments: Comment[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
}

/**
 * Fetch comments for a specific movie with pagination support
 */
export async function fetchComments(
    movieId: string,
    cursor?: string,
    limit: number = 20
): Promise<PaginatedComments> {
    const params = new URLSearchParams({
        movieId,
        limit: limit.toString(),
    });

    if (cursor) {
        params.append('cursor', cursor);
    }

    const res = await fetch(`/api/comments?${params}`);
    if (!res.ok) {
        throw new Error('Failed to fetch comments');
    }
    return res.json();
}

/**
 * Post a new comment
 */
export async function postComment(data: {
    movieId: string;
    content: string;
    parentId?: string;
}): Promise<Comment> {
    const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to post comment');
    }
    return res.json();
}

/**
 * Edit an existing comment
 */
export async function editComment(data: {
    commentId: string;
    content: string;
}): Promise<Comment> {
    const res = await fetch(`/api/comments/${data.commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content }),
    });
    if (!res.ok) {
        throw new Error('Failed to edit comment');
    }
    return res.json();
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
    const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error('Failed to delete comment');
    }
}

/**
 * Vote on a comment (like/dislike)
 */
export async function voteComment(data: {
    commentId: string;
    voteType: 'like' | 'dislike';
}): Promise<{
    likes: number;
    dislikes: number;
    userLiked: boolean;
    userDisliked: boolean;
}> {
    const res = await fetch(`/api/comments/${data.commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: data.voteType }),
    });
    if (!res.ok) {
        throw new Error('Failed to vote on comment');
    }
    return res.json();
}

/**
 * Reply to a comment (same as postComment with parentId)
 */
export async function replyToComment(data: {
    movieId: string;
    parentId: string;
    content: string;
}): Promise<Comment> {
    return postComment(data);
}
