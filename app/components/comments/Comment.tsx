'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { format } from 'date-fns';
import Avatar from '@/app/components/utils/Avatar';
import { MdDelete } from 'react-icons/md';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import VerificationBadge from '@/app/components/VerificationBadge';
import { formatText } from '@/app/utils/textFormatting';
import StarRating from '@/app/components/utils/StarRating';
import { useTranslateableContent } from '@/app/hooks/useTranslateableContent';

interface CommentProps {
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
}

const subscribe = () => () => {};

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
}) => {
    const formattedDate = format(new Date(createdAt), 'dd/MM/yyyy HH:mm');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
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
                <div className="mb-1 flex flex-row">
                    <button
                        type="button"
                        className="cursor-pointer truncate border-0 bg-transparent p-0 text-justify text-left font-bold whitespace-normal text-neutral-800 dark:text-neutral-100"
                        onClick={navigateToProfile}
                    >
                        {userName}
                    </button>
                    {verified && <VerificationBadge className="mt-1 ml-1" />}
                    <div className="mt-0.5 ml-1.5 text-sm text-neutral-400">
                        {mounted
                            ? `${t('level')} ${userLevel}`
                            : `level ${userLevel}`}
                    </div>
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
                <div className="mt-2 flex min-h-[24px] items-center justify-between text-sm text-neutral-400">
                    <div className="shrink-0">{translateButtonElement}</div>
                    <div className="ml-auto">{formattedDate}</div>
                </div>
                {canDelete && (
                    <button
                        type="button"
                        className="absolute top-2 right-1 border-0 bg-transparent p-0 text-rose-500"
                        onClick={openDeleteModal}
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
            </div>
        </div>
    );
};

export default Comment;
