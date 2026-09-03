'use client';

import axios from 'axios';
import { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormAccessor, collectDraftFormData } from '@/app/utils/draftFormUtils';
import { DraftData } from '@/app/types/draft';

export interface RecipeModalDraftController {
    isOpen?: boolean;
    isEditMode?: boolean;
    activeDraftId?: string | null;
    onOpenSharedDraft: (draftId: string) => void;
    onClose?: () => void;
}

interface UseDraftPersistenceOptions {
    recipeModal: RecipeModalDraftController;
    mutateDraft?: () => Promise<unknown>;
}

export function useDraftPersistence({
    recipeModal,
    mutateDraft,
}: UseDraftPersistenceOptions) {
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const isMountedRef = useRef(true);
    const pendingSavesRef = useRef(0);
    const saveQueueRef = useRef<Promise<boolean> | null>(null);
    const openedDraftIdRef = useRef<string | null>(
        recipeModal.activeDraftId || null
    );

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (recipeModal.isOpen && recipeModal.activeDraftId) {
            openedDraftIdRef.current = recipeModal.activeDraftId;
        } else if (!recipeModal.isOpen) {
            openedDraftIdRef.current = null;
        }
    }, [recipeModal.isOpen, recipeModal.activeDraftId]);

    const saveDraft = useCallback(
        (
            form: FormAccessor,
            step: number,
            draftData: Partial<DraftData> | null | undefined,
            effectiveNumIngredients: number,
            effectiveNumSteps: number,
            ingredientsInputMode: string,
            stepsInputMode: string,
            stepOverride?: number | React.MouseEvent,
            isLocked?: boolean
        ): Promise<boolean> => {
            pendingSavesRef.current += 1;
            if (isMountedRef.current) {
                setIsSaving(true);
            }

            const performSave = async (): Promise<boolean> => {
                const stepNum =
                    typeof stepOverride === 'number' ? stepOverride : undefined;

                try {
                    // Collection intentionally happens inside the queue. In
                    // particular, a prior create response can bind draftId
                    // before the next save takes its snapshot.
                    const { data, currentDraftId, currentInviteToken } =
                        collectDraftFormData(
                            form,
                            step,
                            draftData,
                            effectiveNumIngredients,
                            effectiveNumSteps,
                            ingredientsInputMode,
                            stepsInputMode,
                            stepNum,
                            false,
                            Boolean(isLocked)
                        );
                    const res = await axios.post('/api/draft', data);
                    if (res.data?.draftId) {
                        if (!currentDraftId) {
                            form.setValue('draftId', res.data.draftId);
                        }
                        if (
                            isMountedRef.current &&
                            recipeModal.isOpen !== false &&
                            openedDraftIdRef.current !== res.data.draftId
                        ) {
                            openedDraftIdRef.current = res.data.draftId;
                            recipeModal.onOpenSharedDraft(res.data.draftId);
                        }
                    }
                    if (res.data?.inviteToken && !currentInviteToken) {
                        form.setValue('inviteToken', res.data.inviteToken);
                    }
                    if (isMountedRef.current && res.data?.draftId) {
                        mutateDraft?.();
                    }
                    mutate('/api/draft/active');
                    if (
                        isMountedRef.current &&
                        typeof stepOverride !== 'number'
                    ) {
                        toast.success(t('draft_saved') || 'Draft saved!');
                    }
                    return true;
                } catch (error) {
                    console.error('Failed to save draft', error);
                    if (
                        isMountedRef.current &&
                        typeof stepOverride !== 'number'
                    ) {
                        toast.error(
                            t('error_saving_draft') || 'Failed to save draft.'
                        );
                    }
                    return false;
                }
            };

            const currentQueue = saveQueueRef.current ?? Promise.resolve(true);
            const queuedSave = currentQueue.then(performSave, performSave);
            const trackedSave = queuedSave.finally(() => {
                pendingSavesRef.current = Math.max(
                    0,
                    pendingSavesRef.current - 1
                );
                if (isMountedRef.current && pendingSavesRef.current === 0) {
                    setIsSaving(false);
                }
            });
            saveQueueRef.current = trackedSave;
            return trackedSave;
        },
        [mutateDraft, recipeModal, t]
    );

    const flushDraftSaves = useCallback(
        () => saveQueueRef.current ?? Promise.resolve(true),
        []
    );

    const copyInviteLink = async (
        form: FormAccessor,
        step: number,
        draftData: Partial<DraftData> | null | undefined,
        effectiveNumIngredients: number,
        effectiveNumSteps: number,
        ingredientsInputMode: string,
        stepsInputMode: string
    ) => {
        const { data: fullDraftData } = collectDraftFormData(
            form,
            step,
            draftData,
            effectiveNumIngredients,
            effectiveNumSteps,
            ingredientsInputMode,
            stepsInputMode,
            undefined,
            true
        );

        let currentDraftId = fullDraftData.draftId;
        let currentToken = fullDraftData.inviteToken;

        const prepareShareUrl = async (): Promise<string> => {
            if (!currentDraftId || !currentToken) {
                const res = await axios.post(
                    '/api/draft/invite',
                    fullDraftData
                );
                currentDraftId = res.data.draftId;
                currentToken = res.data.inviteToken;
                form.setValue('draftId', currentDraftId);
                form.setValue('inviteToken', currentToken);
                if (currentDraftId) {
                    recipeModal.onOpenSharedDraft(currentDraftId);
                }
                mutateDraft?.();
            } else {
                try {
                    await axios.post('/api/draft', fullDraftData);
                    mutateDraft?.();
                } catch {
                    // Non-critical background sync
                }
            }
            return `${window.location.origin}/api/draft/join?draft=${encodeURIComponent(currentDraftId)}&token=${encodeURIComponent(currentToken)}`;
        };

        let shareUrlPromise: Promise<string> | null = null;
        const getShareUrl = () => {
            if (!shareUrlPromise) {
                shareUrlPromise = prepareShareUrl();
            }
            return shareUrlPromise;
        };

        if (
            typeof navigator !== 'undefined' &&
            navigator.clipboard &&
            typeof ClipboardItem !== 'undefined' &&
            typeof navigator.clipboard.write === 'function'
        ) {
            try {
                const textPromise = getShareUrl();
                const clipboardItem = new ClipboardItem({
                    'text/plain': textPromise.then(
                        (url) => new Blob([url], { type: 'text/plain' })
                    ),
                });
                await navigator.clipboard.write([clipboardItem]);
                await textPromise;
                toast.success(
                    t('co_cook_link_copied') ||
                        'Co-cook invite link copied to clipboard! 🔗'
                );
                return;
            } catch (clipError) {
                console.warn(
                    'ClipboardItem API failed, falling back to writeText',
                    clipError
                );
            }
        }

        try {
            const shareUrl = await getShareUrl();
            await navigator.clipboard.writeText(shareUrl);
            toast.success(
                t('co_cook_link_copied') ||
                    'Co-cook invite link copied to clipboard! 🔗'
            );
        } catch {
            toast.error(
                t('could_not_copy_link') || 'Could not copy link to clipboard'
            );
        }
    };

    const deleteDraft = async (
        form: FormAccessor,
        draftData: Partial<DraftData> | null | undefined
    ) => {
        const rawDraftId = form.getValues('draftId');
        const currentDraftId =
            typeof rawDraftId === 'string' && rawDraftId
                ? rawDraftId
                : draftData?.draftId;
        const url = currentDraftId
            ? `/api/draft?draftId=${encodeURIComponent(currentDraftId)}`
            : `/api/draft`;
        try {
            await axios.delete(url);
            form.setValue('draftId', '');
            form.setValue('inviteToken', '');
            mutateDraft?.();
            mutate('/api/draft', null, false);
            if (currentDraftId) {
                mutate(
                    `/api/draft?draftId=${encodeURIComponent(currentDraftId)}`,
                    null,
                    false
                );
            }
            mutate('/api/draft/active');
        } catch (error) {
            console.error('Failed to delete draft', error);
        }
    };

    return {
        saveDraft,
        copyInviteLink,
        deleteDraft,
        isSaving,
        flushDraftSaves,
    };
}
