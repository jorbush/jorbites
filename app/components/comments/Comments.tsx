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
        <div className="flex flex-col pl-2 pr-2">
            <hr />
            <div className="mb-4 mt-8 flex flex-row items-center justify-between">
                <div className="text-xl font-semibold dark:text-neutral-100">
                    {t('comments')}
                </div>
                <ButtonSelector
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                />
            </div>
            <div className="ml-4 mr-4">
                <CommentBox
                    userImage={currentUser?.image}
                    onCreateComment={onCreateComment}
                />
                {sortedComments.map((comment: SafeComment) => (
                    <div
                        key={comment.id}
                        className="ml-2 mr-2"
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
