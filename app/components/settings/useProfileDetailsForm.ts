'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export interface ProfileDetailsState {
    bio: string;
    websiteUrl: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
}

const getInitialState = (user?: SafeUser | null): ProfileDetailsState => ({
    bio: user?.bio || '',
    websiteUrl: user?.websiteUrl || '',
    instagram: user?.instagram || '',
    twitter: user?.twitter || '',
    youtube: user?.youtube || '',
    tiktok: user?.tiktok || '',
});

export const useProfileDetailsForm = (currentUser?: SafeUser | null) => {
    const router = useRouter();
    const { t } = useTranslation();

    const [formState, setFormState] = useState<ProfileDetailsState>(() =>
        getInitialState(currentUser)
    );
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    const initial = getInitialState(currentUser);
    const isDirty = (
        Object.keys(initial) as (keyof ProfileDetailsState)[]
    ).some((key) => formState[key] !== initial[key]);

    const updateField = useCallback(
        (field: keyof ProfileDetailsState, value: string) => {
            setFormState((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const handleSave = useCallback(() => {
        if (isPending || !currentUser?.id) return;

        startTransition(async () => {
            try {
                await axios.patch(`/api/user/${currentUser.id}`, formState);
                toast.success(
                    t('profile_updated') ||
                        'Profile details updated successfully'
                );
                setIsEditing(false);
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.error || t('something_went_wrong');
                toast.error(errorMessage);
            } finally {
                router.refresh();
            }
        });
    }, [currentUser?.id, formState, isPending, router, t]);

    const handleCancel = useCallback(() => {
        setFormState(getInitialState(currentUser));
        setIsEditing(false);
    }, [currentUser]);

    return {
        formState,
        updateField,
        isEditing,
        setIsEditing,
        isDirty,
        isPending,
        handleSave,
        handleCancel,
    };
};
