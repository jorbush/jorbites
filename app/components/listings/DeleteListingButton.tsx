'use client';

import { AiFillDelete } from "react-icons/ai";
import Button from "../Button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import DeleteListingsModal from "../modals/DeleteListingModal";

interface DeleteListingButtonProps {
    id: string;
  }

const DeleteListingButton: React.FC<DeleteListingButtonProps> = ({
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

export default DeleteListingButton