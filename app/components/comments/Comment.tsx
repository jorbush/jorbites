'use client';

import React from 'react';
import Avatar from '@/app/components/utils/Avatar';
import { useRouter } from 'next/navigation';
import { useTranslateableContent } from '@/app/hooks/useTranslateableContent';
import { SafeUser } from '@/app/types';
import CommentHeader from './CommentHeader';
import CommentRating from './CommentRating';
import CommentBody from './CommentBody';
import CommentImage from './CommentImage';
import CommentFooter from './CommentFooter';
import CommentDelete from './CommentDelete';

const DEFAULT_LIKED_IDS: string[] = [];

export interface CommentProps {
    userId: string;
    userImage: string | undefined | null;
    comment: string;
    createdAt: string;
    userName: string;
    canDelete?: boolean;
    verified?: boolean;
    commentId: string;
    userLevel?: number;
    rating: number | null;
    likedIds?: string[];
    currentUser?: SafeUser | null;
    isCooked?: boolean;
    imageSrc?: string | null;
}

const Comment: React.FC<CommentProps> = ({
    userId,
    userImage,
    comment,
    createdAt,
    userName,
    canDelete,
    verified,
    commentId,
    userLevel,
    rating,
    likedIds = DEFAULT_LIKED_IDS,
    currentUser,
    isCooked = false,
    imageSrc = null,
}) => {
    const router = useRouter();
    const { displayContent, translateButtonElement } = useTranslateableContent({
        content: comment,
    });

    const navigateToProfile = () => {
        router?.push?.('/profile/' + userId);
    };

    return (
        <div className="relative flex items-start py-1">
            <div className="mt-1 shrink-0">
                <Avatar
                    src={userImage}
                    onClick={navigateToProfile}
                    extraClasses="ring-2 ring-neutral-100 dark:ring-neutral-800"
                    quality="auto:eco"
                />
            </div>
            <div className="ml-3.5 min-w-0 grow">
                <CommentHeader
                    userName={userName}
                    verified={verified}
                    userLevel={userLevel}
                    isCooked={isCooked}
                    onNavigateToProfile={navigateToProfile}
                />
                <CommentRating rating={rating} />
                <CommentBody content={displayContent} />
                <CommentImage imageSrc={imageSrc} />
                <CommentFooter
                    commentId={commentId}
                    likedIds={likedIds}
                    currentUser={currentUser}
                    translateButtonElement={translateButtonElement}
                    createdAt={createdAt}
                />
                <CommentDelete
                    commentId={commentId}
                    canDelete={canDelete}
                />
            </div>
        </div>
    );
};

export default Comment;
export { Comment as CommentCard };
