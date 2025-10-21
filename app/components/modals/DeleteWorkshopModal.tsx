'use client';

import WriteToDeleteModal from '@/app/components/modals/WriteToDeleteModal';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface DeleteWorkshopModalProps {
    id: string;
    open: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const DeleteWorkshopModal: React.FC<DeleteWorkshopModalProps> = ({
    open,
    setIsOpen,
    id,
}) => {
    const { t } = useTranslation();
    const router = useRouter();

    const handleDeleteWorkshop = () => {
        axios
            .delete(`/api/workshop/${id}`)
            .then(() => {
                toast.success(t('workshop_deleted'));
                setIsOpen(false);
            })
            .catch(() => {
                toast.error(t('something_went_wrong'));
            })
            .finally(() => {
                router.push('/workshops');
                router.refresh();
            });
    };

    return (
        <WriteToDeleteModal
            open={open}
            setIsOpen={setIsOpen}
            onConfirm={handleDeleteWorkshop}
            title={t('delete_workshop') || 'Delete Workshop'}
            requiredText={
                t('text_delete_workshop') || 'Jorbites delete this workshop'
            }
        />
    );
};

export default DeleteWorkshopModal;
