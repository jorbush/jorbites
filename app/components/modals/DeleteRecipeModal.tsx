'use client';

import Modal from '@/app/components/modals/Modal';
import Heading from '@/app/components/Heading';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Input from '@/app/components/inputs/Input';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';

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

    const onSubmit: SubmitHandler<FieldValues> = () => {
        if (watch('text') !== t('text_delete')) {
            toast.error('The text does not match.');
            return;
        }
        axios
            .delete(`/api/recipe/${id}`)
            .then(() => {
                toast.success('Recipe deleted!');
                reset();
                setIsOpen(false);
            })
            .catch(() => {
                toast.error('Something went wrong.');
            })
            .finally(() => {
                router.push('/');
                router.refresh();
            });
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading
                title={t('write_this_to_delete')}
                subtitle={`"${t('text_delete') ?? 'Delete'}"`}
            />
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
            title={t('delete_recipe') ?? 'Delete'}
            actionLabel={t('delete')}
            onClose={() => setIsOpen(false)}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={<div></div>}
        />
    );
};

export default DeleteRecipeModal;
