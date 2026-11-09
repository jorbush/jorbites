'use client';

import React from 'react';
import { format } from 'date-fns';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import useIsMounted from '@/app/hooks/useIsMounted';
import useCommentLike from '@/app/hooks/useCommentLike';
import { SafeUser } from '@/app/types';

export interface CommentFooterProps {
    commentId: string;
    likedIds: string[];
    currentUser?: SafeUser | null;
    translateButtonElement: React.ReactNode;
    createdAt: string;
}

const CommentFooter: React.FC<CommentFooterProps> = ({
    commentId,
    likedIds,
    currentUser,
    translateButtonElement,
    createdAt,
}) => {
    const mounted = useIsMounted();
    const { hasLiked, toggleLike } = useCommentLike({
        commentId,
        likedIds,
        currentUser,
    });
    const formattedDate = mounted
        ? format(new Date(createdAt), 'dd/MM/yyyy HH:mm')
        : '';

    return (
        <div className="mt-2.5 flex min-h-[24px] items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-4">
                <div className="shrink-0">{translateButtonElement}</div>
                <button
                    type="button"
                    onClick={toggleLike}
                    className="flex cursor-pointer items-center gap-1.5 transition-colors duration-200 hover:opacity-85 focus:outline-hidden"
                    aria-label={hasLiked ? 'Unlike comment' : 'Like comment'}
                    data-testid="comment-like-button"
                >
                    {hasLiked ? (
                        <AiFillHeart
                            className="fill-green-450 text-green-450"
                            size={16}
                        />
                    ) : (
                        <AiOutlineHeart
                            className="text-neutral-500 dark:text-neutral-400"
                            size={16}
                        />
                    )}
                    <span className="text-xs font-semibold">
                        {likedIds.length}
                    </span>
                </button>
            </div>
            <div className="ml-auto">{formattedDate}</div>
        </div>
    );
};

export default CommentFooter;
