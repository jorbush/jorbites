'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import Avatar from '@/app/components/utils/Avatar';
import { MdDelete } from 'react-icons/md';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import PhotoLightbox from '@/app/components/modals/PhotoLightbox';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import VerificationBadge from '@/app/components/VerificationBadge';
import { formatText } from '@/app/utils/textFormatting';
import StarRating from '@/app/components/utils/StarRating';
import { useTranslateableContent } from '@/app/hooks/useTranslateableContent';
import useIsMounted from '@/app/hooks/useIsMounted';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import useCommentLike from '@/app/hooks/useCommentLike';
import { SafeUser } from '@/app/types';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';

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
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const mounted = useIsMounted();
    const { hasLiked, toggleLike } = useCommentLike({
        commentId,
        likedIds,
        currentUser,
    });
    const formattedDate = mounted
        ? format(new Date(createdAt), 'dd/MM/yyyy HH:mm')
        : '';
    const { push, refresh } = useRouter() || {};
    const { t } = useTranslation();

    const { displayContent, translateButtonElement } = useTranslateableContent({
        content: comment,
    });

    const deleteComment = () => {
        axios
            .delete(`/api/comments/${commentId}`)
            .then(() => {
                toast.success(t('comment_deleted'));
                refresh();
            })
            .catch(() => {
                toast.error(t('something_went_wrong'));
            })
            .finally(() => {});
    };

    const navigateToProfile = () => {
        push('/profile/' + userId);
    };

    const openDeleteModal = () => {
        setConfirmModalOpen(true);
    };

    return (
        <div className="relative mt-2 mr-1 mb-2 ml-1 flex items-start">
            <div className="mt-2 shrink-0">
                <Avatar
                    src={userImage}
                    onClick={navigateToProfile}
                    quality="auto:eco"
                />
            </div>
            <div className="mt-2 ml-4 grow">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        className="cursor-pointer truncate border-0 bg-transparent p-0 text-justify text-left font-bold whitespace-normal text-neutral-800 dark:text-neutral-100"
                        onClick={navigateToProfile}
                    >
                        {userName}
                    </button>
                    {verified && <VerificationBadge className="mt-0.5" />}
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {mounted
                            ? `${t('level')} ${userLevel}`
                            : `level ${userLevel}`}
                    </div>
                    {(isCooked || Boolean(imageSrc)) && (
                        <span
                            className="bg-green-450/20 dark:bg-green-450/10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-green-800 dark:text-green-300"
                            data-testid="cooked-badge"
                            data-cy="cooked-badge"
                        >
                            🥑{' '}
                            {mounted
                                ? String(
                                      t('cooked_short') &&
                                          t('cooked_short') !== 'cooked_short'
                                          ? t('cooked_short')
                                          : 'Cooked'
                                  )
                                : 'Cooked'}
                        </span>
                    )}
                </div>
                {rating !== undefined && rating !== null && rating > 0 && (
                    <div
                        className="mt-1 mb-2 flex items-center"
                        data-testid="comment-rating"
                    >
                        <StarRating
                            rating={rating}
                            size={14}
                        />
                    </div>
                )}
                <div className="text-justify break-words whitespace-normal text-neutral-800 dark:text-neutral-100">
                    <p
                        className="text-justify break-words whitespace-normal text-neutral-800 dark:text-neutral-100"
                        data-cy="comment-text"
                    >
                        {typeof displayContent === 'string'
                            ? formatText(displayContent)
                            : displayContent}
                    </p>
                </div>

                {imageSrc && (
                    <div className="mt-2">
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(true)}
                            className="group relative inline-block overflow-hidden rounded-lg border border-neutral-200 focus:outline-hidden dark:border-neutral-700"
                            data-testid="remake-photo-button"
                            data-cy="remake-photo-button"
                        >
                            <CustomProxyImage
                                src={imageSrc}
                                alt="User remake proof"
                                width={180}
                                height={140}
                                className="object-cover transition group-hover:scale-105"
                            />
                        </button>
                    </div>
                )}

                <div className="mt-2 flex min-h-[24px] items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-4">
                        <div className="shrink-0">{translateButtonElement}</div>
                        <button
                            type="button"
                            onClick={toggleLike}
                            className="flex cursor-pointer items-center gap-1 transition hover:opacity-85 focus:outline-hidden"
                            aria-label={
                                hasLiked ? 'Unlike comment' : 'Like comment'
                            }
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

                {canDelete && (
                    <button
                        type="button"
                        className="absolute top-2 right-1 border-0 bg-transparent p-0 text-rose-500"
                        onClick={openDeleteModal}
                        aria-label="Delete comment"
                        data-testid="MdDelete"
                    >
                        <MdDelete size={20} />
                    </button>
                )}

                <ConfirmModal
                    open={confirmModalOpen}
                    setIsOpen={setConfirmModalOpen}
                    onConfirm={deleteComment}
                />

                <PhotoLightbox
                    src={imageSrc}
                    alt="User remake proof full size"
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    testId="lightbox-modal"
                />
            </div>
        </div>
    );
};

export default Comment;
export { Comment as CommentCard };
