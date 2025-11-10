'use client';

import useQuestModal from '@/app/hooks/useQuestModal';
import Modal from '@/app/components/modals/Modal';
import { useState, useEffect } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Heading from '@/app/components/navigation/Heading';
import Input from '@/app/components/inputs/Input';

const QUEST_TITLE_MAX_LENGTH = 200;
const QUEST_DESCRIPTION_MAX_LENGTH = 1000;

const QuestModal = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const questModal = useQuestModal();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
            title: '',
            description: '',
            status: 'open',
        },
    });

    useEffect(() => {
        if (!questModal.isOpen) {
            reset({
                title: '',
                description: '',
                status: 'open',
            });
        } else if (
            questModal.isOpen &&
            questModal.isEditMode &&
            questModal.editQuestData
        ) {
            reset({
                title: questModal.editQuestData.title,
                description: questModal.editQuestData.description,
                status: questModal.editQuestData.status,
            });
        }
    }, [
        questModal.isOpen,
        questModal.isEditMode,
        questModal.editQuestData,
        reset,
    ]);

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true);

        try {
            if (questModal.isEditMode && questModal.editQuestData) {
                // Edit existing quest
                const url = `${window.location.origin}/api/quest/${questModal.editQuestData.id}`;
                await axios.patch(url, data);
                toast.success(t('quest_updated') || 'Quest updated!');
            } else {
                // Create new quest
                const url = `${window.location.origin}/api/quests`;
                await axios.post(url, data);
                toast.success(t('quest_created') || 'Quest created!');
            }

            reset({
                title: '',
                description: '',
                status: 'open',
            });
            questModal.onClose();
            router.refresh();
        } catch (error: any) {
            console.error('Failed to save quest', error);
            const errorMessage =
                error.response?.data?.error ||
                t('something_went_wrong') ||
                'Something went wrong';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading
                title={
                    questModal.isEditMode
                        ? t('edit_quest') || 'Edit Quest'
                        : t('request_recipe') || 'Request a Recipe'
                }
                subtitle={
                    questModal.isEditMode
                        ? t('edit_quest_subtitle') ||
                          'Update your recipe request'
                        : t('request_recipe_subtitle') ||
                          'Tell the community what recipe you would like to see'
                }
            />
            <Input
                id="title"
                label={t('title') || 'Title'}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                validation={{
                    required: t('title_required') || 'Title is required',
                    maxLength: {
                        value: QUEST_TITLE_MAX_LENGTH,
                        message:
                            t('title_max_length') ||
                            `Title must be ${QUEST_TITLE_MAX_LENGTH} characters or less`,
                    },
                }}
            />
            <div className="relative">
                <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {t('description') || 'Description'}
                </label>
                <textarea
                    id="description"
                    {...register('description', {
                        required:
                            t('description_required') ||
                            'Description is required',
                        maxLength: {
                            value: QUEST_DESCRIPTION_MAX_LENGTH,
                            message:
                                t('description_max_length') ||
                                `Description must be ${QUEST_DESCRIPTION_MAX_LENGTH} characters or less`,
                        },
                    })}
                    disabled={isLoading}
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition focus:border-rose-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    placeholder={
                        t('quest_description_placeholder') ||
                        'Describe the recipe you would like someone to create...'
                    }
                />
                {errors.description && (
                    <p className="mt-1 text-xs text-rose-500">
                        {errors.description.message as string}
                    </p>
                )}
            </div>

            {questModal.isEditMode && (
                <div className="relative">
                    <label
                        htmlFor="status"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t('status') || 'Status'}
                    </label>
                    <select
                        id="status"
                        {...register('status')}
                        disabled={isLoading}
                        className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition focus:border-rose-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    >
                        <option value="open">{t('open') || 'Open'}</option>
                        <option value="in_progress">
                            {t('in_progress') || 'In Progress'}
                        </option>
                        <option value="completed">
                            {t('completed') || 'Completed'}
                        </option>
                    </select>
                </div>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={questModal.isOpen}
            onClose={questModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={
                questModal.isEditMode
                    ? t('update') || 'Update'
                    : t('create') || 'Create'
            }
            title={
                questModal.isEditMode
                    ? t('edit_quest') || 'Edit Quest'
                    : t('request_recipe') || 'Request a Recipe'
            }
            body={bodyContent}
            isLoading={isLoading}
        />
    );
};

export default QuestModal;
