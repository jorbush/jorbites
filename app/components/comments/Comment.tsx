'use client';

import React, { useState, useEffect } from 'react';
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
import { TranslateableContent } from '@/app/components/utils/TranslateableContent';

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
    const [mounted, setMounted] = useState(false);
    const [translateButton, setTranslateButton] =
        useState<React.ReactNode | null>(null);
    const router = useRouter();
    const { t } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);

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
                <div className="mb-1 flex flex-row">
                    <p
                        className="cursor-pointer truncate text-justify font-bold whitespace-normal text-gray-800 dark:text-neutral-100"
                        onClick={() => router.push('/profile/' + userId)}
                    >
                        {userName}
                    </p>
                    {verified && <VerificationBadge className="mt-1 ml-1" />}
                    <div className="mt-0.5 ml-1.5 text-sm text-gray-400">
                        {mounted
                            ? `${t('level')} ${userLevel}`
                            : `level ${userLevel}`}
                    </div>
                </div>
                <TranslateableContent
                    content={comment}
                    renderButton={false}
                    onButtonStateChange={setTranslateButton}
                    className="text-justify break-words whitespace-normal text-gray-800 dark:text-neutral-100"
                    renderContent={(content) => (
                        <p
                            className="text-justify break-words whitespace-normal text-gray-800 dark:text-neutral-100"
                            data-cy="comment-text"
                        >
                            {typeof content === 'string'
                                ? formatText(content)
                                : content}
                        </p>
                    )}
                />
                <div className="mt-2 flex min-h-[24px] items-center justify-between text-sm text-gray-400">
                    <div className="shrink-0">{translateButton}</div>
                    <div className="ml-auto">{formattedDate}</div>
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
