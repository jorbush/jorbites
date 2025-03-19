'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import Avatar from '@/app/components/Avatar';
import { MdDelete } from 'react-icons/md';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import VerificationBadge from '@/app/components/VerificationBadge';

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
    onDeleteComment?: (_commentId: string) => void;
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
    onDeleteComment,
}) => {
    const formattedDate = format(new Date(createdAt), 'dd/MM/yyyy HH:mm');
    const words = comment.split(' ');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    const isLongWord = words.some((word) => word.length > 20);

    const deleteComment = () => {
        axios
            .delete(`/api/comments/${commentId}`)
            .then(() => {
                toast.success(t('comment_deleted'));
                if (onDeleteComment) {
                    onDeleteComment(commentId);
                } else {
                    router.refresh();
                }
            })
            .catch(() => {
                toast.error(t('something_went_wrong'));
            })
            .finally(() => {});
    };

    return (
        <div className="relative mb-2 ml-1 mr-1 mt-2 flex items-start">
            <div className="mt-2 flex-shrink-0">
                <Avatar
                    src={userImage}
                    onClick={() => router.push('/profile/' + userId)}
                />
            </div>
            <div className="ml-4 mt-2 flex-grow">
                <div className="flex flex-row">
                    <p
                        className={`cursor-pointer truncate whitespace-normal text-justify font-bold text-gray-800 dark:text-neutral-100 ${
                            isLongWord ? 'break-all' : ''
                        }`}
                        onClick={() => router.push('/profile/' + userId)}
                    >
                        {userName}
                    </p>
                    {verified && <VerificationBadge className="ml-1 mt-1" />}
                    <div className="ml-1.5 mt-0.5 text-sm text-gray-400">{`${t('level')} ${userLevel}`}</div>
                </div>
                <p
                    className={`truncate whitespace-normal text-justify text-gray-800 dark:text-neutral-100 ${
                        isLongWord ? 'break-all' : ''
                    }`}
                    data-cy="comment-text"
                >
                    {comment}
                </p>
                <div className="flex flex-col items-end text-sm text-gray-400">
                    {formattedDate}
                </div>
                {canDelete && (
                    <MdDelete
                        size={20}
                        className="absolute right-1 top-2 text-rose-500"
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
