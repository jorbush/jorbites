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

interface ConfirmModalProps {
    open: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    setIsOpen,
    onConfirm
}) => {
    const { t } = useTranslation();
    
    const onAccept = () => {
      onConfirm()
      setIsOpen(false)
    }

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading
                title={t('confirm_title')}
            />
        </div>
    )


    return (
        <Modal
          isOpen={open}
          title={t('delete') ?? "Delete"}
          actionLabel={t('delete')}
          onClose={() => setIsOpen(false)}
          secondaryActionLabel={t('cancel') ?? "Cancel"}
          secondaryAction={() => setIsOpen(false)}
          onSubmit={ onAccept }
          body={bodyContent}
          footer={<div></div>}
        />
      );
}

export default ConfirmModal