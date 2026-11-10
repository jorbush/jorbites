'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeList, SafeUser } from '@/app/types';

interface UseListActionsProps {
    list: SafeList;
    currentUser?: SafeUser | null;
}

export function useListActions({ list, currentUser }: UseListActionsProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const isOwner = currentUser?.id === list.userId;
    const defaultListTitle = t('to_cook_later') as string;
    const shareTitle = list.isDefault ? defaultListTitle : list.name;

    const togglePrivacy = useCallback(async () => {
        if (!isOwner) return;
        setIsLoading(true);
        try {
            await axios.patch(`/api/lists/${list.id}`, {
                isPrivate: !list.isPrivate,
            });
            toast.success(
                list.isPrivate
                    ? t('list_is_now_public')
                    : t('list_is_now_private')
            );
            router?.refresh?.();
        } catch (error) {
            toast.error(t('something_went_wrong'));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [isOwner, list.id, list.isPrivate, router, t]);

    const onDelete = useCallback(async () => {
        if (!isOwner) return;
        setIsLoading(true);
        try {
            await axios.delete(`/api/lists/${list.id}`);
            toast.success(t('list_deleted'));
            router?.push?.('/lists');
            router?.refresh?.();
        } catch (error) {
            toast.error(t('something_went_wrong'));
            console.error(error);
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
        }
    }, [isOwner, list.id, router, t]);

    const onRemoveRecipe = useCallback(
        async (recipeId: string) => {
            if (!isOwner) return;
            setDeletingId(recipeId);
            try {
                await axios.delete(`/api/lists/${list.id}/recipes/${recipeId}`);
                toast.success(t('recipe_removed'));
                router?.refresh?.();
            } catch (error) {
                toast.error(t('something_went_wrong'));
                console.error(error);
            } finally {
                setDeletingId('');
            }
        },
        [isOwner, list.id, router, t]
    );

    return {
        isOwner,
        shareTitle,
        isLoading,
        deletingId,
        isConfirmModalOpen,
        setIsConfirmModalOpen,
        togglePrivacy,
        onDelete,
        onRemoveRecipe,
    };
}

export default useListActions;
