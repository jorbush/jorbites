'use client';

import { AiFillDelete } from 'react-icons/ai';
import Button from '@/app/components/Button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import DeleteRecipeModal from '@/app/components/modals/DeleteRecipeModal';

interface DeleteRecipeButtonProps {
    id: string;
}

const DeleteRecipeButton: React.FC<DeleteRecipeButtonProps> = ({ id }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { t } = useTranslation();

    const onClick = () => {
        setIsOpen(true);
    };

    return (
        <>
            <DeleteRecipeModal
                open={isOpen}
                setIsOpen={setIsOpen}
                id={id}
            />
            <div className="flex w-full flex-row items-center justify-center">
                <div className="w-[240px]">
                    <Button
                        deleteButton
                        label={t('delete_recipe')}
                        icon={AiFillDelete}
                        onClick={onClick}
                        dataCy="delete-recipe"
                    />
                </div>
            </div>
        </>
    );
};

export default DeleteRecipeButton;
