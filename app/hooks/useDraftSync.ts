'use client';

import { useRef, useCallback } from 'react';
import useSWR from 'swr';
import { UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeUser } from '@/app/types';
import { STEPS, SHARED_DRAFT_POLL_INTERVAL_MS } from '@/app/utils/constants';

interface UseDraftSyncOptions {
    activeDraftId: string | null | undefined;
    isEditMode: boolean;
    currentUser?: SafeUser | null;
    isOpen: boolean;
    initialDraftData?: any;
    initialMutateDraft?: any;
}

interface UseDraftSyncReturn {
    draftData: any;
    isLoadingDraft: boolean;
    mutateDraft: () => Promise<any>;
    /** Call during render to sync remote draft changes into form state */
    syncFormFromDraft: (
        setValue: UseFormSetValue<any>,
        getValues: UseFormGetValues<any>,
        step: number,
        lock: any,
        stepChanged: boolean
    ) => void;
}

export function useDraftSync({
    activeDraftId,
    isEditMode,
    currentUser,
    isOpen,
    initialDraftData,
    initialMutateDraft,
}: UseDraftSyncOptions): UseDraftSyncReturn {
    const draftEndpoint = activeDraftId
        ? `/api/draft?draftId=${activeDraftId}`
        : `/api/draft`;

    const isSharedDraft = Boolean(activeDraftId);

    const {
        data: swrDraftData,
        isLoading: isLoadingDraft,
        mutate: swrMutateDraft,
    } = useSWR(
        isOpen && !isEditMode && currentUser ? draftEndpoint : null,
        axiosFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: isSharedDraft ? SHARED_DRAFT_POLL_INTERVAL_MS : 0,
            shouldRetryOnError: false,
            keepPreviousData: true,
        }
    );

    const draftData =
        initialDraftData !== undefined ? initialDraftData : swrDraftData;
    const mutateDraft =
        initialMutateDraft !== undefined ? initialMutateDraft : swrMutateDraft;

    const prevSyncedDraftStr = useRef<string>('');

    const syncFormFromDraft = useCallback(
        (
            setValue: UseFormSetValue<any>,
            getValues: UseFormGetValues<any>,
            step: number,
            lock: any,
            stepChanged: boolean
        ) => {
            const serialized = draftData ? JSON.stringify(draftData) : '';
            const draftChanged = serialized !== prevSyncedDraftStr.current;

            if (draftChanged) {
                prevSyncedDraftStr.current = serialized;
            }

            if (!isEditMode && draftData && (draftChanged || stepChanged)) {
                const isStepLockedByOther = (stepIndex: number) =>
                    Boolean(lock?.isLockedByOther(`step:${stepIndex}`));

                // Step 0: Category
                if (
                    Array.isArray(draftData.categories) &&
                    draftData.categories.length > 0 &&
                    JSON.stringify(getValues('categories')) !==
                        JSON.stringify(draftData.categories)
                ) {
                    setValue('categories', draftData.categories);
                }

                // Step 1: Description
                if (
                    draftData.title &&
                    draftData.title !== '' &&
                    getValues('title') !== draftData.title &&
                    (step !== STEPS.DESCRIPTION ||
                        stepChanged ||
                        !getValues('title') ||
                        isStepLockedByOther(STEPS.DESCRIPTION))
                ) {
                    setValue('title', draftData.title);
                }
                if (
                    draftData.description &&
                    draftData.description !== '' &&
                    getValues('description') !== draftData.description &&
                    (step !== STEPS.DESCRIPTION ||
                        stepChanged ||
                        !getValues('description') ||
                        isStepLockedByOther(STEPS.DESCRIPTION))
                ) {
                    setValue('description', draftData.description);
                }
                if (
                    draftData.minutes !== undefined &&
                    getValues('minutes') !== draftData.minutes
                ) {
                    setValue('minutes', draftData.minutes);
                }
                if (
                    draftData.prepTime !== undefined &&
                    getValues('prepTime') !== draftData.prepTime
                ) {
                    setValue('prepTime', draftData.prepTime);
                }
                if (
                    draftData.cookTime !== undefined &&
                    getValues('cookTime') !== draftData.cookTime
                ) {
                    setValue('cookTime', draftData.cookTime);
                }

                // Step 2: Ingredients
                if (
                    Array.isArray(draftData.ingredients) &&
                    draftData.ingredients.length > 0
                ) {
                    const incoming = draftData.ingredients;
                    incoming.forEach((item: string, idx: number) => {
                        const currentVal = getValues(`ingredient-${idx}`);
                        if (
                            !currentVal ||
                            currentVal === '' ||
                            isStepLockedByOther(STEPS.INGREDIENTS) ||
                            stepChanged ||
                            step !== STEPS.INGREDIENTS
                        ) {
                            setValue(`ingredient-${idx}`, item);
                        }
                    });
                    setValue('ingredients', incoming);
                }

                // Step 3: Methods
                if (
                    draftData.method &&
                    draftData.method !== '' &&
                    getValues('method') !== draftData.method &&
                    (step !== STEPS.METHODS ||
                        stepChanged ||
                        !getValues('method') ||
                        isStepLockedByOther(STEPS.METHODS))
                ) {
                    setValue('method', draftData.method);
                }

                // Step 4: Steps
                if (
                    Array.isArray(draftData.steps) &&
                    draftData.steps.length > 0
                ) {
                    const incoming = draftData.steps;
                    incoming.forEach((item: string, idx: number) => {
                        const currentVal = getValues(`step-${idx}`);
                        if (
                            !currentVal ||
                            currentVal === '' ||
                            isStepLockedByOther(STEPS.STEPS) ||
                            stepChanged ||
                            step !== STEPS.STEPS
                        ) {
                            setValue(`step-${idx}`, item);
                        }
                    });
                    setValue('steps', incoming);
                }

                // Step 5: Related Content
                if (
                    Array.isArray(draftData.coCooksIds) &&
                    draftData.coCooksIds.length > 0 &&
                    JSON.stringify(getValues('coCooksIds')) !==
                        JSON.stringify(draftData.coCooksIds) &&
                    (step !== STEPS.RELATED_CONTENT ||
                        stepChanged ||
                        isStepLockedByOther(STEPS.RELATED_CONTENT))
                ) {
                    setValue('coCooksIds', draftData.coCooksIds);
                }
                if (
                    Array.isArray(draftData.linkedRecipeIds) &&
                    draftData.linkedRecipeIds.length > 0 &&
                    JSON.stringify(getValues('linkedRecipeIds')) !==
                        JSON.stringify(draftData.linkedRecipeIds) &&
                    (step !== STEPS.RELATED_CONTENT ||
                        stepChanged ||
                        isStepLockedByOther(STEPS.RELATED_CONTENT))
                ) {
                    setValue('linkedRecipeIds', draftData.linkedRecipeIds);
                }
                if (
                    draftData.youtubeUrl !== undefined &&
                    getValues('youtubeUrl') !== draftData.youtubeUrl
                ) {
                    setValue('youtubeUrl', draftData.youtubeUrl);
                }
                if (
                    draftData.questId !== undefined &&
                    getValues('questId') !== draftData.questId
                ) {
                    setValue('questId', draftData.questId);
                }

                // Step 6: Images
                if (
                    draftData.imageSrc &&
                    draftData.imageSrc !== '' &&
                    getValues('imageSrc') !== draftData.imageSrc &&
                    (step !== STEPS.IMAGES ||
                        stepChanged ||
                        isStepLockedByOther(STEPS.IMAGES))
                ) {
                    setValue('imageSrc', draftData.imageSrc);
                }
                if (
                    draftData.imageSrc1 &&
                    draftData.imageSrc1 !== '' &&
                    getValues('imageSrc1') !== draftData.imageSrc1 &&
                    (step !== STEPS.IMAGES ||
                        stepChanged ||
                        isStepLockedByOther(STEPS.IMAGES))
                ) {
                    setValue('imageSrc1', draftData.imageSrc1);
                }
                if (
                    draftData.imageSrc2 &&
                    draftData.imageSrc2 !== '' &&
                    getValues('imageSrc2') !== draftData.imageSrc2 &&
                    (step !== STEPS.IMAGES ||
                        stepChanged ||
                        isStepLockedByOther(STEPS.IMAGES))
                ) {
                    setValue('imageSrc2', draftData.imageSrc2);
                }
                if (
                    draftData.imageSrc3 &&
                    draftData.imageSrc3 !== '' &&
                    getValues('imageSrc3') !== draftData.imageSrc3 &&
                    (step !== STEPS.IMAGES ||
                        stepChanged ||
                        isStepLockedByOther(STEPS.IMAGES))
                ) {
                    setValue('imageSrc3', draftData.imageSrc3);
                }

                if (
                    draftData.draftId &&
                    getValues('draftId') !== draftData.draftId
                ) {
                    setValue('draftId', draftData.draftId);
                }
                if (
                    draftData.inviteToken &&
                    getValues('inviteToken') !== draftData.inviteToken
                ) {
                    setValue('inviteToken', draftData.inviteToken);
                }
            }
        },
        [draftData, isEditMode]
    );

    return {
        draftData,
        isLoadingDraft,
        mutateDraft,
        syncFormFromDraft,
    };
}
