'use client';

import React, { useState } from 'react';
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

interface CommentProps {
    userId: string;
    userImage: string | undefined | null;
    comment: string;
    createdAt: string;
    userName: string;
    canDelete?: boolean;
    verified?: boolean;
    commentId: string;
    userLevel: number;
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
}) => {
    const formattedDate = format(new Date(createdAt), 'dd/MM/yyyy HH:mm');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    const deleteComment = () => {
        axios
            .delete(`/api/comments/${commentId}`)
            .then(() => {
                toast.success(t('comment_deleted'));
                router.refresh();
            })
            .catch(() => {
                toast.error(t('something_went_wrong'));
            })
            .finally(() => {});
    };

    return (
        <div className="relative mt-2 mr-1 mb-2 ml-1 flex items-start">
            <div className="mt-2 shrink-0">
                <Avatar
                    src={userImage}
                    onClick={() => router.push('/profile/' + userId)}
                    quality="auto:eco"
                />
            </div>
            <div className="mt-2 ml-4 grow">
                <div className="flex flex-row">
                    <p
                        className="cursor-pointer truncate text-justify font-bold whitespace-normal text-gray-800 dark:text-neutral-100 break-words"
                        onClick={() => router.push('/profile/' + userId)}
                    >
                        {userName}
                    </p>
                    {verified && <VerificationBadge className="mt-1 ml-1" />}
                    <div className="mt-0.5 ml-1.5 text-sm text-gray-400">{`${t('level')} ${userLevel}`}</div>
                </div>
                <p
                    className="truncate text-justify whitespace-normal text-gray-800 dark:text-neutral-100 break-words"
                    data-cy="comment-text"
                >
                    {formatText(comment)}
                </p>
                <div className="flex flex-col items-end text-sm text-gray-400">
                    {formattedDate}
                </div>
                {canDelete && (
                    <MdDelete
                        size={20}
                        className="absolute top-2 right-1 text-rose-500"
                        onClick={() => setConfirmModalOpen(true)}
                        data-testid="MdDelete"
                    />
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
