'use client';

import Modal from '@/app/components/modals/Modal';
import Heading from '@/app/components/navigation/Heading';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Input from '@/app/components/inputs/Input';
import { toast } from 'react-hot-toast';

interface WriteToDeleteModalProps {
    open: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    onConfirm: () => void;
    title?: string;
    description?: string;
    requiredText?: string;
    actionLabel?: string;
    insideModal?: boolean;
}

const WriteToDeleteModal: React.FC<WriteToDeleteModalProps> = ({
    open,
    setIsOpen,
    onConfirm,
    title,
    description,
    requiredText,
    actionLabel,
    insideModal,
}) => {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
            text: '',
        },
    });

    const deleteText = requiredText || t('text_delete') || 'Delete';

    const onSubmit: SubmitHandler<FieldValues> = () => {
        if (watch('text') !== deleteText) {
            toast.error(t('text_does_not_match') || 'The text does not match.');
            return;
        }

        reset();
        setIsOpen(false);
        onConfirm();
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading
                title={t('write_this_to_delete')}
                subtitle={`"${deleteText}"`}
            />
            {description && (
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                    {description}
                </p>
            )}
            <Input
                id="text"
                label={''}
                register={register}
                errors={errors}
                required
                dataCy="delete-confirmation-text"
            />
        </div>
    );

    return (
        <Modal
            isOpen={open}
            title={title || t('delete') || 'Delete'}
            actionLabel={actionLabel || t('delete') || 'Delete'}
            onClose={() => {
                reset();
                setIsOpen(false);
            }}
            onSubmit={handleSubmit(onSubmit)}
            secondaryActionLabel={t('cancel') || 'Cancel'}
            secondaryAction={() => {
                reset();
                setIsOpen(false);
            }}
            body={bodyContent}
            footer={<div></div>}
            insideModal={insideModal}
        />
    );
};

export default WriteToDeleteModal;
