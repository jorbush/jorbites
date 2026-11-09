'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MdDelete } from 'react-icons/md';
import ConfirmModal from '@/app/components/modals/ConfirmModal';

export interface CommentDeleteProps {
    commentId: string;
    canDelete?: boolean;
}

const CommentDelete: React.FC<CommentDeleteProps> = ({
    commentId,
    canDelete,
}) => {
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    if (!canDelete) {
        return null;
    }

    const deleteComment = () => {
        axios
            .delete(`/api/comments/${commentId}`)
            .then(() => {
                toast.success(t('comment_deleted'));
                router?.refresh?.();
            })
            .catch(() => {
                toast.error(t('something_went_wrong'));
            });
    };

    return (
        <>
            <button
                type="button"
                className="absolute top-2 right-1 cursor-pointer border-0 bg-transparent p-0 text-rose-500 transition-colors duration-200 hover:text-rose-600"
                onClick={() => setConfirmModalOpen(true)}
                aria-label="Delete comment"
                data-testid="MdDelete"
            >
                <MdDelete size={20} />
            </button>

            <ConfirmModal
                open={confirmModalOpen}
                setIsOpen={setConfirmModalOpen}
                onConfirm={deleteComment}
            />
        </>
    );
};

export default CommentDelete;
