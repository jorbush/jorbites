'use client';

import { useEffect, useState, useCallback } from 'react';
import { SafeComment, SafeUser } from '@/app/types';
import CommentBox from '@/app/components/comments/CommentBox';
import Comment from '@/app/components/comments/Comment';
import { useTranslation } from 'react-i18next';
import ButtonSelector from '@/app/components/comments/ButtonSelector';

/* eslint-disable unused-imports/no-unused-vars */
interface CommentsProps {
    currentUser?: SafeUser | null;
    onCreateComment: (comment: string) => void;
    comments?: SafeComment[];
}

const Comments: React.FC<CommentsProps> = ({
    currentUser,
    onCreateComment,
    comments = [],
}) => {
    const { t } = useTranslation();
    const [sortedComments, setSortedComments] =
        useState<SafeComment[]>(comments);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const sortComments = useCallback(
        (order: 'asc' | 'desc') => {
            const sorted = [...comments].sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            });
            setSortedComments(sorted);
        },
        [comments]
    );

    useEffect(() => {
        const storedOrder = localStorage.getItem('commentSortOrder') as
            | 'asc'
            | 'desc';
        if (storedOrder) {
            setSortOrder(storedOrder);
            sortComments(storedOrder);
        } else {
            setSortedComments(comments);
        }
    }, [comments, sortComments]);

    const handleSortChange = (order: 'asc' | 'desc') => {
        setSortOrder(order);
        console.log('order', order);
        localStorage.setItem('commentSortOrder', order);
        sortComments(order);
    };

    return (
        <div className="flex flex-col pr-2 pl-2">
            <hr />
            <div className="mt-8 mb-4 flex flex-row items-center justify-between">
                <div className="flex flex-row items-center">
                    <div className="text-xl font-semibold dark:text-neutral-100">
                        {t('comments')}
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
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;
