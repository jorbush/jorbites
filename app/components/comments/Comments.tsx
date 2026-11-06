'use client';

import { useSyncExternalStore } from 'react';
import { SafeComment, SafeUser } from '@/app/types';
import CommentBox from '@/app/components/comments/CommentBox';
import Comment from '@/app/components/comments/Comment';
import { useTranslation } from 'react-i18next';
import ButtonSelector from '@/app/components/comments/ButtonSelector';
import useIsMounted from '@/app/hooks/useIsMounted';

const sortOrderStore = {
    subscribe(listener: () => void) {
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', listener);
            return () => window.removeEventListener('storage', listener);
        }
        return () => {};
    },
    getSnapshot() {
        if (typeof window === 'undefined') return 'asc';
        return (
            (localStorage.getItem('commentSortOrder') as
                | 'asc'
                | 'desc'
                | 'most_liked') || 'asc'
        );
    },
    getServerSnapshot() {
        return 'asc' as const;
    },
};

const handleSortChange = (order: 'asc' | 'desc' | 'most_liked') => {
    localStorage.setItem('commentSortOrder', order);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
    }
};

interface CommentsProps {
    currentUser?: SafeUser | null;
    onCreateComment: (
        comment: string,
        rating: number | null,
        imageSrc?: string | null
    ) => void;
    comments?: SafeComment[];
    isLoading?: boolean;
}

const EMPTY_COMMENTS: SafeComment[] = [];

const Comments: React.FC<CommentsProps> = ({
    currentUser,
    onCreateComment,
    comments = EMPTY_COMMENTS,
    isLoading = false,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();
    const sortOrder = useSyncExternalStore(
        sortOrderStore.subscribe,
        sortOrderStore.getSnapshot,
        sortOrderStore.getServerSnapshot
    );

    const sortedComments = comments.toSorted((a, b) => {
        if (sortOrder === 'most_liked') {
            const likesA = a.likedIds?.length || 0;
            const likesB = b.likedIds?.length || 0;
            if (likesA !== likesB) {
                return likesB - likesA;
            }
            // Fall back to newest first if likes are equal
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        }
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return (
        <div className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
            <div className="mb-6 flex flex-row items-center justify-between">
                <div className="flex flex-row items-center">
                    <div className="text-xl font-bold text-neutral-900 dark:text-white">
                        {isMounted ? t('comments') : 'comments'}
                    </div>
                    <div className="ml-2.5 inline-flex items-center rounded-full border border-neutral-200/80 bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300">
                        {comments.length}
                    </div>
                </div>
                <ButtonSelector
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                />
            </div>
            <div>
                <CommentBox
                    userImage={currentUser?.image}
                    onCreateComment={onCreateComment}
                    isLoading={isLoading}
                />
                {sortedComments.length > 0 && (
                    <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
                        {sortedComments.map((comment: SafeComment) => (
                            <div
                                key={comment.id}
                                className="py-3 first:pt-0 last:pb-0"
                            >
                                <Comment
                                    userId={comment.user.id}
                                    userImage={comment.user.image}
                                    comment={comment.comment}
                                    createdAt={comment.createdAt}
                                    userName={comment.user.name ?? ''}
                                    verified={comment.user.verified}
                                    canDelete={
                                        currentUser?.id === comment.userId
                                    }
                                    commentId={comment.id}
                                    userLevel={comment.user.level}
                                    rating={comment.rating}
                                    likedIds={comment.likedIds || []}
                                    currentUser={currentUser}
                                    isCooked={comment.isCooked}
                                    imageSrc={comment.imageSrc}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comments;
