'use client';

import { AiFillDelete } from "react-icons/ai";
import Button from "../Button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import DeleteListingsModal from "../modals/DeleteListingModal";

interface DeleteRecipeButtonProps {
    id: string;
  }

const DeleteRecipeButton: React.FC<DeleteRecipeButtonProps> = ({
    id
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const { t } = useTranslation();

    const onClick = () => {
        setIsOpen(true)
    }

    return (
        <>
            <DeleteListingsModal open={isOpen} setIsOpen={setIsOpen} id={id}/>
            <div className="flex flex-row w-full justify-center items-center">
                <div className="w-[240px]">
                    <Button
                        deleteButton
                        label={t('delete_recipe')}
                        icon={AiFillDelete}
                        onClick={onClick}
                    />
                </div>
            </div>
        </>
    );
}

export default DeleteRecipeButton;
