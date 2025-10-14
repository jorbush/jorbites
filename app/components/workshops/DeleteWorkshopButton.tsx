'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/modals/Modal';
import { MdDelete } from 'react-icons/md';

interface DeleteWorkshopButtonProps {
    workshopId: string;
}

const DeleteWorkshopButton: React.FC<DeleteWorkshopButtonProps> = ({
    workshopId,
}) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);

    const requiredText = 'Jorbites delete this workshop';

    const handleDelete = useCallback(async () => {
        if (confirmText !== requiredText) {
            toast.error(t('text_does_not_match'));
            return;
        }

        setLoading(true);

        try {
            await axios.delete(`/api/workshop/${workshopId}`);
            toast.success(t('workshop_deleted'));
            router.push('/workshops');
            router.refresh();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.error || t('something_went_wrong')
            );
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    }, [workshopId, confirmText, router, t]);

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold">{t('confirm_title')}</div>
            <div className="text-neutral-500">
                {t('action_cannot_be_undone')}
            </div>
            <div className="text-sm text-neutral-600">
                {t('write_this_to_delete')}: <br />
                <span className="font-semibold">{requiredText}</span>
            </div>
            <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-lg border-2 p-4 transition outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-800 dark:text-white"
                placeholder={requiredText}
            />
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
            >
                <MdDelete size={20} />
                {t('delete_workshop')}
            </button>
            <Modal
                isOpen={isOpen}
                title={t('delete_workshop') || 'Delete Workshop'}
                actionLabel={t('delete')}
                onClose={() => {
                    setIsOpen(false);
                    setConfirmText('');
                }}
                onSubmit={handleDelete}
                body={bodyContent}
                disabled={loading || confirmText !== requiredText}
            />
        </>
    );
};

export default DeleteWorkshopButton;
