'use client';

import WriteToDeleteModal from '@/app/components/modals/WriteToDeleteModal';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface DeleteRecipeModalProps {
    id: string;
    open: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const DeleteRecipeModal: React.FC<DeleteRecipeModalProps> = ({
    open,
    setIsOpen,
    id,
}) => {
    const { t } = useTranslation();
    const router = useRouter();

    const handleDeleteRecipe = () => {
        fetch(`/api/recipe/${id}`, { method: 'DELETE' })
            .then(async (res) => {
                if (!res.ok) {
                    return Promise.reject(null);
                }
                return res.json().catch(() => null);
            })
            .then(() => {
                toast.success(t('recipe_deleted'));
                setIsOpen(false);
            })
            .catch(() => {
                toast.error(t('something_went_wrong'));
            })
            .finally(() => {
                router.push('/');
                router.refresh();
            });
    };

    return (
        <WriteToDeleteModal
            open={open}
            setIsOpen={setIsOpen}
            onConfirm={handleDeleteRecipe}
            title={t('delete_recipe') || 'Delete Recipe'}
        />
    );
};

export default DeleteRecipeModal;
