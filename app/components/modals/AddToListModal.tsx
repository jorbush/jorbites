'use client';

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useAddToListModal from '@/app/hooks/useAddToListModal';
import Modal from '@/app/components/modals/Modal';
import { SafeList } from '@/app/types';
import Input from '@/app/components/inputs/Input';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Button from '@/app/components/buttons/Button';
import { FaCheckCircle } from 'react-icons/fa';

const AddToListModal = () => {
    const addToListModal = useAddToListModal();
    const router = useRouter();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [lists, setLists] = useState<SafeList[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            isPrivate: true,
        },
    });

    const fetchLists = useCallback(async () => {
        if (!addToListModal.isOpen) return;
        setIsLoading(true);
        try {
            const response = await axios.get('/api/lists');
            setLists(response.data);
        } catch (error) {
            toast.error(t('something_went_wrong'));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [addToListModal.isOpen, t]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    const handleToggleRecipeInList = useCallback(
        async (list: SafeList) => {
            if (!addToListModal.recipeId) return;
            const hasRecipe = list.recipeIds.includes(addToListModal.recipeId);
            setIsLoading(true);
            try {
                if (hasRecipe) {
                    await axios.delete(
                        `/api/lists/${list.id}/recipes/${addToListModal.recipeId}`
                    );
                } else {
                    await axios.post(
                        `/api/lists/${list.id}/recipes/${addToListModal.recipeId}`
                    );
                }
                fetchLists();
                router.refresh();
            } catch (error) {
                toast.error(t('something_went_wrong'));
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        },
        [addToListModal.recipeId, fetchLists, router, t]
    );

    const onSubmitNewList: SubmitHandler<FieldValues> = useCallback(
        async (data) => {
            setIsLoading(true);
            try {
                const response = await axios.post('/api/lists', data);
                if (addToListModal.recipeId) {
                    await axios.post(
                        `/api/lists/${response.data.id}/recipes/${addToListModal.recipeId}`
                    );
                }
                setIsCreating(false);
                reset();
                fetchLists();
                router.refresh();
            } catch (error) {
                toast.error(t('something_went_wrong'));
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        },
        [addToListModal.recipeId, fetchLists, reset, router, t]
    );

    let bodyContent = (
        <div className="flex flex-col gap-4">
            <div className="text-center">
                <div className="text-2xl font-bold">{t('save_to_list')}</div>
            </div>
            {isLoading && lists.length === 0 ? (
                <div className="text-center text-neutral-500">
                    {t('loading')}
                </div>
            ) : (
                <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
                    {lists.map((list) => {
                        const isSelected = list.recipeIds.includes(
                            addToListModal.recipeId || ''
                        );
                        return (
                            <div
                                key={list.id}
                                onClick={() => handleToggleRecipeInList(list)}
                                className={`group flex cursor-pointer flex-row items-center justify-between rounded-lg border-2 p-4 transition hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                                    isSelected
                                        ? 'border-black dark:border-white'
                                        : 'border-neutral-200 dark:border-neutral-700'
                                }`}
                            >
                                <div className="font-semibold">
                                    {list.name === 'to cook later'
                                        ? t('to_cook_later')
                                        : list.name}
                                </div>
                                {isSelected && (
                                    <div className="relative h-5 w-5">
                                        <FaCheckCircle
                                            size={20}
                                            className="absolute inset-0 text-green-500 transition-opacity duration-200"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {!isCreating ? (
                <div
                    onClick={() => setIsCreating(true)}
                    className="mt-4 cursor-pointer text-center font-bold underline"
                >
                    {t('create_new_list')}
                </div>
            ) : (
                <div className="mt-4 flex flex-col gap-4 border-t pt-4">
                    <Input
                        id="name"
                        label={t('list_name')}
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                        required
                    />
                    <div className="flex flex-row items-center gap-2">
                        <input
                            id="isPrivate"
                            type="checkbox"
                            {...register('isPrivate')}
                            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                        />
                        <label
                            htmlFor="isPrivate"
                            className="text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            {t('private_list')}
                        </label>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="w-full">
                            <Button
                                disabled={isLoading}
                                onClick={() => setIsCreating(false)}
                                label={t('cancel')}
                                outline
                            />
                        </div>
                        <div className="w-full">
                            <Button
                                disabled={isLoading}
                                onClick={handleSubmit(onSubmitNewList)}
                                label={t('create')}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Modal
            disabled={isLoading}
            isOpen={addToListModal.isOpen}
            title=""
            actionLabel={t('done')}
            onClose={addToListModal.onClose}
            onSubmit={addToListModal.onClose}
            body={bodyContent}
        />
    );
};

export default AddToListModal;
