'use client';

import { useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import useQuestModal, { EditQuestData } from '@/app/hooks/useQuestModal';

const EMPTY_QUEST_VALUES = {
    title: '',
    description: '',
    status: 'open',
    recipeId: '',
};

interface QuestApiError {
    response?: {
        data?: {
            error?: string;
        };
    };
}

function getQuestResetValues(
    isOpen: boolean,
    isEditMode: boolean,
    editQuestData: EditQuestData | null
) {
    if (isOpen && isEditMode && editQuestData) {
        return {
            title: editQuestData.title,
            description: editQuestData.description,
            status: editQuestData.status,
            recipeId: '',
        };
    }

    return EMPTY_QUEST_VALUES;
}

async function persistQuest(
    data: FieldValues,
    isEditMode: boolean,
    editQuestData: EditQuestData | null,
    t: (key: string) => string
) {
    if (isEditMode && editQuestData) {
        await axios.patch(`/api/quest/${editQuestData.id}`, data);
        toast.success(t('quest_updated') || 'Quest updated!');
        return;
    }

    await axios.post('/api/quests', data);
    toast.success(t('quest_created') || 'Quest created!');
}

export function useQuestForm() {
    const { refresh, push } = useRouter() || {};
    const { t } = useTranslation();
    const questModal = useQuestModal();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<FieldValues>({
        defaultValues: EMPTY_QUEST_VALUES,
    });

    const statusValue = watch('status');

    useEffect(() => {
        if (
            !questModal.isOpen ||
            (questModal.isEditMode && questModal.editQuestData)
        ) {
            reset(
                getQuestResetValues(
                    questModal.isOpen,
                    questModal.isEditMode,
                    questModal.editQuestData
                )
            );
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
            await persistQuest(
                data,
                questModal.isEditMode,
                questModal.editQuestData,
                t
            );

            reset(EMPTY_QUEST_VALUES);
            const wasCreate = !questModal.isEditMode;
            questModal.onClose();
            if (wasCreate) {
                push?.('/quests?status=open');
            }
            refresh?.();
        } catch (error: unknown) {
            console.error('Failed to save quest', error);
            const apiError = error as QuestApiError;
            const errorMessage =
                apiError.response?.data?.error ||
                t('something_went_wrong') ||
                'Something went wrong';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const modalTitle = questModal.isEditMode
        ? t('edit_quest') || 'Edit Quest'
        : t('request_recipe') || 'Request a Recipe';
    const modalSubtitle = questModal.isEditMode
        ? t('edit_quest_subtitle') || 'Update your recipe request'
        : t('request_recipe_subtitle') ||
          'Tell the community what recipe you would like to see';
    const actionLabel = questModal.isEditMode
        ? t('update') || 'Update'
        : t('create') || 'Create';

    return {
        isOpen: questModal.isOpen,
        onClose: questModal.onClose,
        isEditMode: questModal.isEditMode,
        editQuestData: questModal.editQuestData,
        isLoading,
        register,
        errors,
        statusValue,
        modalTitle,
        modalSubtitle,
        actionLabel,
        handleFormSubmit: handleSubmit(onSubmit),
    };
}
