'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import Avatar from '../Avatar';
import { MdDelete, MdVerified } from 'react-icons/md';
import ConfirmModal from '../modals/ConfirmModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

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
    const formattedDate = format(
        new Date(createdAt),
        'dd/MM/yyyy HH:mm'
    );
    const words = comment.split(' ');
    const [confirmModalOpen, setConfirmModalOpen] =
        useState(false);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    // Verificar si alguna palabra es demasiado larga
    const isLongWord = words.some(
        (word) => word.length > 20
    );

    const deleteComment = () => {
        setIsLoading(true);

        axios
            .delete(`/api/comments/${commentId}`)
            .then(() => {
                toast.success('Comment deleted!');
                router.refresh();
            })
            .catch(() => {
                toast.error('Something went wrong.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="relative mb-2 ml-1 mr-1 mt-2 flex items-start">
            <div className="mt-2 flex-shrink-0">
                <Avatar
                    src={userImage}
                    onClick={() =>
                        router.push('/profile/' + userId)
                    }
                />
            </div>
            <div className="ml-4 mt-2 flex-grow">
                <div className="flex flex-row">
                    <p
                        className={`cursor-pointer truncate whitespace-normal text-justify font-bold text-gray-800 dark:text-neutral-100 ${
                            isLongWord ? 'break-all' : ''
                        }`}
                        onClick={() =>
                            router.push(
                                '/profile/' + userId
                            )
                        }
                    >
                        {userName}
                    </p>
                    {verified && (
                        <MdVerified className="ml-1 mt-1 text-green-450" />
                    )}
                    <div className="ml-1.5 mt-0.5 text-sm text-gray-400">{`${t('level')} ${userLevel}`}</div>
                </div>
                <p
                    className={`truncate whitespace-normal text-justify text-gray-800 dark:text-neutral-100 ${
                        isLongWord ? 'break-all' : ''
                    }`}
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
                        onClick={() =>
                            setConfirmModalOpen(true)
                        }
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
