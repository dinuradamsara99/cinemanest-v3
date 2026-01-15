"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThumbsUp, ThumbsDown, MessageCircle, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import * as commentQueries from '@/lib/queries/comments';

// Comment Interface definition
export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string | Date;
    likes: number;
    dislikes: number;
    replies: Comment[];
    // These fields must come from the backend based on the current logged-in user
    userLiked?: boolean;
    userDisliked?: boolean;
}

interface CommentItemProps {
    comment: Comment;
    currentUserId?: string;
    onReply: (commentId: string, content: string) => Promise<void>;
    onEdit: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onVote: (commentId: string, voteType: 'like' | 'dislike') => Promise<void>;
    onLoginClick?: () => void;
    depth?: number;
}

function CommentItem({
    comment,
    currentUserId,
    onReply,
    onEdit,
    onDelete,
    onVote,
    onLoginClick,
    depth = 0,
}: CommentItemProps) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReplies, setShowReplies] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Permission Check: Only the owner can edit/delete
    const isOwner = currentUserId === comment.userId;
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleReplySubmit = async () => {
        if (!currentUserId) {
            if (onLoginClick) onLoginClick();
            return;
        }

        if (replyContent.trim() && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await onReply(comment.id, replyContent);
                setReplyContent("");
                setShowReplyBox(false);
                // Auto-show replies if a new one is added
                if (!showReplies) setShowReplies(true);
            } catch (error) {
                console.error("Failed to reply:", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleEditSubmit = async () => {
        if (!isOwner) return; // Security check

        if (editContent.trim() && editContent !== comment.content && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await onEdit(comment.id, editContent);
                setIsEditing(false);
            } catch (error) {
                console.error("Failed to edit:", error);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setIsEditing(false);
        }
    };

    // Helper for formatting date safely
    const formatDate = (date: string | Date) => {
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'Just now';
            return formatDistanceToNow(d, { addSuffix: true });
        } catch {
            return 'Just now';
        }
    };

    return (
        <div className={`${depth > 0 ? 'ml-12 border-l-2 border-zinc-800 pl-4' : ''}`}>
            <div className="flex gap-3 py-4">
                {/* Avatar */}
                <Avatar className="h-10 w-10 ring-2 ring-zinc-800 shrink-0">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback className="bg-zinc-800 text-white">
                        {comment.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Comment Content */}
                <div className="flex-1 space-y-2 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate">{comment.userName}</span>
                            <span className="text-sm text-zinc-500 shrink-0" suppressHydrationWarning>
                                {formatDate(comment.createdAt)}
                            </span>
                        </div>

                        {/* Menu - Only visible to Owner */}
                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 rounded-[10px] border-zinc-800">
                                    <DropdownMenuItem
                                        onClick={() => setIsEditing(true)}
                                        className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onDelete(comment.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Comment Body */}
                    {isEditing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                disabled={isSubmitting}
                                className="bg-zinc-800 border-zinc-700 rounded-[10px] text-white placeholder:text-zinc-500 min-h-[80px]"
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleEditSubmit}
                                    disabled={isSubmitting}
                                    className="bg-white hover:bg-zinc-100 text-black"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(comment.content);
                                    }}
                                    disabled={isSubmitting}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-zinc-300 leading-relaxed break-words">{comment.content}</p>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                        <div className="flex items-center gap-4 pt-1">
                            {/* Like Button */}
                            <button
                                onClick={() => onVote(comment.id, 'like')}
                                className={`flex items-center gap-1.5 text-sm transition-all rounded-full px-2 py-1 ${comment.userLiked
                                    ? 'bg-white text-blue-600 font-semibold'
                                    : 'text-zinc-500 hover:text-blue-400 hover:bg-zinc-800'
                                    }`}
                            >
                                <ThumbsUp className={`h-4 w-4 ${comment.userLiked ? 'fill-current' : ''}`} />
                                <span>{comment.likes}</span>
                            </button>

                            {/* Dislike Button */}
                            <button
                                onClick={() => onVote(comment.id, 'dislike')}
                                className={`flex items-center gap-1.5 text-sm transition-all rounded-full px-2 py-1 ${comment.userDisliked
                                    ? 'bg-white text-red-600 font-semibold'
                                    : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800'
                                    }`}
                            >
                                <ThumbsDown className={`h-4 w-4 ${comment.userDisliked ? 'fill-current' : ''}`} />
                                <span>{comment.dislikes}</span>
                            </button>

                            {/* Reply Button */}
                            {/* Limit depth to prevent infinite nesting UI issues */}
                            {depth < 3 && (
                                <button
                                    onClick={() => {
                                        if (!currentUserId && onLoginClick) {
                                            onLoginClick();
                                        } else {
                                            setShowReplyBox(!showReplyBox);
                                        }
                                    }}
                                    className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Reply
                                </button>
                            )}

                            {/* Toggle Replies Visibility */}
                            {hasReplies && (
                                <button
                                    onClick={() => setShowReplies(!showReplies)}
                                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Reply Input Box */}
                    {showReplyBox && (
                        <div className="pt-3 space-y-2">
                            <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                disabled={isSubmitting}
                                className="bg-zinc-800 border-zinc-700 rounded-[10px] text-white placeholder:text-zinc-500 min-h-[80px]"
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleReplySubmit}
                                    disabled={!replyContent.trim() || isSubmitting}
                                    className="bg-white hover:bg-zinc-100 text-black"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reply'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setShowReplyBox(false);
                                        setReplyContent("");
                                    }}
                                    disabled={isSubmitting}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {hasReplies && showReplies && (
                <div className="space-y-1">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onVote={onVote}
                            onLoginClick={onLoginClick}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface CommentSectionProps {
    movieId: string;
    onLoginClick?: () => void;
}

export function CommentSection({
    movieId,
    onLoginClick,
}: CommentSectionProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState("");
    const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');

    const currentUserId = session?.user?.id;

    // Fetch comments with React Query using Infinite Scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        queryKey: ['comments', movieId],
        queryFn: ({ pageParam }) => commentQueries.fetchComments(movieId, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined as string | undefined,
    });

    // Flatten comments from all pages
    const comments = data?.pages.flatMap(page => page.comments) ?? [];

    // Helper function for optimistic vote updates
    const updateCommentVotes = (list: Comment[], commentId: string, voteType: 'like' | 'dislike'): Comment[] => {
        return list.map(comment => {
            if (comment.id === commentId) {
                const wasLiked = comment.userLiked;
                const wasDisliked = comment.userDisliked;

                if (voteType === 'like') {
                    return {
                        ...comment,
                        userLiked: !wasLiked,
                        userDisliked: false,
                        likes: wasLiked ? comment.likes - 1 : comment.likes + 1,
                        dislikes: wasDisliked ? comment.dislikes - 1 : comment.dislikes,
                    };
                } else {
                    return {
                        ...comment,
                        userDisliked: !wasDisliked,
                        userLiked: false,
                        dislikes: wasDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
                        likes: wasLiked ? comment.likes - 1 : comment.likes,
                    };
                }
            }
            if (comment.replies?.length > 0) {
                return { ...comment, replies: updateCommentVotes(comment.replies, commentId, voteType) };
            }
            return comment;
        });
    };

    // Vote mutation with optimistic update for infinite query
    const voteMutation = useMutation({
        mutationFn: commentQueries.voteComment,
        onMutate: async ({ commentId, voteType }) => {
            await queryClient.cancelQueries({ queryKey: ['comments', movieId] });
            const previous = queryClient.getQueryData(['comments', movieId]);

            queryClient.setQueryData(['comments', movieId], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        comments: updateCommentVotes(page.comments, commentId, voteType)
                    }))
                };
            });

            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['comments', movieId], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', movieId] });
        },
    });

    // Post comment mutation
    const postMutation = useMutation({
        mutationFn: commentQueries.postComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', movieId] });
            setNewComment('');
        },
    });

    // Reply mutation
    const replyMutation = useMutation({
        mutationFn: commentQueries.postComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', movieId] });
        },
    });

    // Edit mutation with optimistic update
    const editMutation = useMutation({
        mutationFn: commentQueries.editComment,
        onMutate: async ({ commentId, content }) => {
            await queryClient.cancelQueries({ queryKey: ['comments', movieId] });
            const previous = queryClient.getQueryData(['comments', movieId]);

            queryClient.setQueryData(['comments', movieId], (old: any) => {
                if (!old) return old;

                const updateContent = (list: Comment[]): Comment[] => {
                    return list.map(c => {
                        if (c.id === commentId) return { ...c, content };
                        if (c.replies?.length) return { ...c, replies: updateContent(c.replies) };
                        return c;
                    });
                };

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        comments: updateContent(page.comments)
                    }))
                };
            });

            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['comments', movieId], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', movieId] });
        },
    });

    // Delete mutation with optimistic update
    const deleteMutation = useMutation({
        mutationFn: commentQueries.deleteComment,
        onMutate: async (commentId) => {
            await queryClient.cancelQueries({ queryKey: ['comments', movieId] });
            const previous = queryClient.getQueryData(['comments', movieId]);

            queryClient.setQueryData(['comments', movieId], (old: any) => {
                if (!old) return old;

                const removeComment = (list: Comment[]): Comment[] => {
                    return list.filter(c => c.id !== commentId)
                        .map(c => ({
                            ...c,
                            replies: c.replies ? removeComment(c.replies) : []
                        }));
                };

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        comments: removeComment(page.comments)
                    }))
                };
            });

            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['comments', movieId], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', movieId] });
        },
    });

    // Handler functions
    const handleAddComment = async () => {
        if (!session?.user) {
            if (onLoginClick) onLoginClick();
            return;
        }

        if (newComment.trim()) {
            postMutation.mutate({ movieId, content: newComment });
        }
    };

    const handleReply = async (parentId: string, content: string) => {
        if (!session?.user) return;
        replyMutation.mutate({ movieId, content, parentId });
    };

    const handleEdit = async (commentId: string, content: string) => {
        if (!session?.user) return;
        editMutation.mutate({ commentId, content });
    };

    const handleDelete = async (commentId: string) => {
        if (!session?.user) return;
        if (confirm('Are you sure you want to delete this comment?')) {
            deleteMutation.mutate(commentId);
        }
    };

    const handleVote = async (commentId: string, voteType: 'like' | 'dislike') => {
        if (!session?.user) {
            if (onLoginClick) onLoginClick();
            return;
        }
        voteMutation.mutate({ commentId, voteType });
    };

    const sortedComments = [...comments].sort((a, b) => {
        if (sortBy === 'popular') {
            return (b.likes - b.dislikes) - (a.likes - a.dislikes);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Get total count from the first page of data
    const totalComments = data?.pages[0]?.totalCount ?? 0;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Comments
                    <span className="text-zinc-500 text-lg font-normal">
                        ({totalComments})
                    </span>
                </h2>
                <div className="flex bg-zinc-900 rounded-lg p-1">
                    <button
                        onClick={() => setSortBy('popular')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sortBy === 'popular'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Popular
                    </button>
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sortBy === 'recent'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Recent
                    </button>
                </div>
            </div>

            {/* Add Comment Section */}
            <div className="space-y-3">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    disabled={postMutation.isPending}
                    className="bg-zinc-900 border-zinc-800 rounded-[15px] text-white placeholder:text-zinc-500 min-h-[100px] focus:border-zinc-700"
                />
                <div className="flex justify-end">
                    <Button
                        onClick={handleAddComment}
                        disabled={postMutation.isPending}
                        className="bg-white hover:bg-zinc-100 text-black"
                    >
                        {postMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            session?.user ? 'Post Comment' : 'Login to Post'
                        )}
                    </Button>
                </div>
            </div>

            {/* Comments List */}
            <div className="divide-y divide-zinc-800">
                {isLoading ? (
                    <div className="space-y-6 py-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-24 bg-zinc-800" />
                                        <Skeleton className="h-3 w-16 bg-zinc-800" />
                                    </div>
                                    <Skeleton className="h-16 w-full bg-zinc-800" />
                                    <div className="flex gap-4 pt-2">
                                        <Skeleton className="h-8 w-16 bg-zinc-800" />
                                        <Skeleton className="h-8 w-16 bg-zinc-800" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedComments.length > 0 ? (
                    <>
                        {sortedComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUserId={currentUserId}
                                onReply={handleReply}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onVote={handleVote}
                                onLoginClick={onLoginClick}
                            />
                        ))}

                        {/* Pagination Controls */}
                        <div className="py-8 flex justify-center gap-4 border-t border-zinc-800/50">
                            {hasNextPage && (
                                <Button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    variant="ghost"
                                    className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                >
                                    {isFetchingNextPage ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        'See More Comments'
                                    )}
                                </Button>
                            )}

                            {(data?.pages.length ?? 0) > 1 && (
                                <Button
                                    onClick={() => {
                                        // Scroll to comments section top if needed, or just partial scroll
                                        // window.scrollTo({ top: 0, behavior: 'smooth' }); 
                                        // Reset to first page
                                        queryClient.resetQueries({ queryKey: ['comments', movieId] });
                                    }}
                                    variant="ghost"
                                    className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                >
                                    See Less
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="py-12 text-center text-zinc-500">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                )}
            </div>
        </div>
    );
}