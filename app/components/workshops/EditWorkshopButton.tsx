'use client';

import { SafeWorkshop } from '@/app/types';
import { useTranslation } from 'react-i18next';
import useWorkshopModal from '@/app/hooks/useWorkshopModal';
import { EditWorkshopData } from '@/app/hooks/useWorkshopModal';

interface EditWorkshopButtonProps {
    workshop: SafeWorkshop;
}

const EditWorkshopButton: React.FC<EditWorkshopButtonProps> = ({
    workshop,
}) => {
    const { t } = useTranslation();
    const workshopModal = useWorkshopModal();

    const handleEdit = () => {
        const editData: EditWorkshopData = {
            id: workshop.id,
            title: workshop.title,
            description: workshop.description,
            date: workshop.date,
            location: workshop.location,
            isRecurrent: workshop.isRecurrent,
            recurrencePattern: workshop.recurrencePattern,
            isPrivate: workshop.isPrivate,
            whitelistedUserIds: workshop.whitelistedUserIds,
            imageSrc: workshop.imageSrc,
            price: workshop.price,
            ingredients: workshop.ingredients,
            previousSteps: workshop.previousSteps,
        };
        workshopModal.onOpenEdit(editData);
    };

    return (
        <button
            onClick={handleEdit}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
            {t('edit_workshop')}
        </button>
    );
};

export default EditWorkshopButton;
