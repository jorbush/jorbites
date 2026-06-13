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
            (localStorage.getItem('commentSortOrder') as 'asc' | 'desc') ||
            'asc'
        );
    },
    getServerSnapshot() {
        return 'asc' as const;
    },
};

const handleSortChange = (order: 'asc' | 'desc') => {
    localStorage.setItem('commentSortOrder', order);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
    }
    console.log('order', order);
};

interface CommentsProps {
    currentUser?: SafeUser | null;
    onCreateComment: (comment: string, rating: number | null) => void;
    comments?: SafeComment[];
    isLoading?: boolean;
}

const Comments: React.FC<CommentsProps> = ({
    currentUser,
    onCreateComment,
    comments = [],
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
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return (
        <div className="flex flex-col pr-2 pl-2">
            <hr />
            <div className="mt-8 mb-4 flex flex-row items-center justify-between">
                <div className="flex flex-row items-center">
                    <div className="text-xl font-semibold dark:text-neutral-100">
                        {isMounted ? t('comments') : 'comments'}
                    </div>
                    <div className="text-md ml-2 text-neutral-500">
                        {comments.length}
                    </div>
                </div>
                <ButtonSelector
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                />
            </div>
            <div className="mr-4 ml-4">
                <CommentBox
                    userImage={currentUser?.image}
                    onCreateComment={onCreateComment}
                    isLoading={isLoading}
                />
                {sortedComments.map((comment: SafeComment) => (
                    <div
                        key={comment.id}
                        className="mr-2 ml-2"
                    >
                        <hr />
                        <Comment
                            userId={comment.user.id}
                            userImage={comment.user.image}
                            comment={comment.comment}
                            createdAt={comment.createdAt}
                            userName={comment.user.name ?? ''}
                            verified={comment.user.verified}
                            canDelete={currentUser?.id === comment.userId}
                            commentId={comment.id}
                            userLevel={comment.user.level}
                            rating={comment.rating}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;
