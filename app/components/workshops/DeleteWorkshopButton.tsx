'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDelete } from 'react-icons/md';
import Button from '@/app/components/buttons/Button';
import DeleteWorkshopModal from '@/app/components/modals/DeleteWorkshopModal';

interface DeleteWorkshopButtonProps {
    workshopId: string;
}

const DeleteWorkshopButton: React.FC<DeleteWorkshopButtonProps> = ({
    workshopId,
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const onClick = () => {
        setIsOpen(true);
    };

    return (
        <>
            <DeleteWorkshopModal
                open={isOpen}
                setIsOpen={setIsOpen}
                id={workshopId}
            />
            <Button
                label={t('delete_workshop')}
                onClick={onClick}
                icon={MdDelete}
                deleteButton
            />
        </>
    );
};

export default DeleteWorkshopButton;
