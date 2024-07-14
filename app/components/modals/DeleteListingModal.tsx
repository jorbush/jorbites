'use client';

import Modal from "./Modal";
import Heading from "../Heading";
import { useTranslation } from 'react-i18next';
import { SafeUser } from "@/app/types";
import { Dispatch, SetStateAction, useState } from "react";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Input from "../inputs/Input";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

interface DeleteListingModalProps {
    id: string;
    open: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const DeleteListingsModal: React.FC<DeleteListingModalProps> = ({
    open,
    setIsOpen,
    id,
}) => {
    const { t } = useTranslation();
    const registerModal = useRegisterModal();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)


    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: {
        errors,
      },
      reset,
    } = useForm<FieldValues>({
      defaultValues: {
        text: ''
      },
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
      if (watch("text") !== t('text_delete')){
        toast.error('The text does not match.')
        return
      }
      setIsLoading(true);

      axios.delete(`/api/recipe/${id}`)
      .then(() => {
        toast.success('Recipe deleted!');
        router.refresh()
        reset()
        setIsOpen(false)
      })
      .catch(() => {
        toast.error('Something went wrong.');
      })
      .finally(() => {
        setIsLoading(false);
        router.push('/')
      })
    }

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading
                title={t('write_this_to_delete')}
                subtitle={`"${t('text_delete') ?? "Delete"}"`}
            />
            <Input
                id="text"
                label={""}
                register={register}
                errors={errors}
                required
            />
        </div>
    )


    return (
        <Modal
          isOpen={open}
          title={t('delete_recipe') ?? "Delete"}
          actionLabel={t('delete')}
          onClose={() => setIsOpen(false)}
          onSubmit={ handleSubmit(onSubmit) }
          body={bodyContent}
          footer={<div></div>}
        />
      );
}

export default DeleteListingsModal
