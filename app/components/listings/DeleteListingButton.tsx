'use client';

import { AiFillDelete } from "react-icons/ai";
import Button from "../Button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DeleteListingButtonProps {
    id: string;
  }

const DeleteListingButton: React.FC<DeleteListingButtonProps> = ({
    id
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation();

    const router = useRouter();

    const onClick = () => {

        setIsLoading(true);
    
        axios.delete(`/api/listing/${id}`)
        .then(() => {
          toast.success('Recipe deleted!');
        })
        .catch(() => {
          toast.error('Something went wrong.');
        })
        .finally(() => {
          setIsLoading(false);
          router.push('/')
        })

    }

    return (
        <div className="flex flex-row w-full justify-center items-center">
            <div className="w-[240px]">
                <Button 
                    deleteButton
                    disabled={isLoading}
                    label={t('delete_recipe')}
                    icon={AiFillDelete}
                    onClick={onClick}
                />  
            </div>
        </div>
    );
}

export default DeleteListingButton