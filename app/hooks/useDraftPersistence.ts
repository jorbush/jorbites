'use client';

import axios from 'axios';
import { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    FormAccessor,
    extractIngredientsAndSteps,
    collectDraftFormData,
} from '@/app/utils/draftFormUtils';

export type { FormAccessor };
export { extractIngredientsAndSteps, collectDraftFormData };

interface UseDraftPersistenceOptions {
    recipeModal: any;
    mutateDraft?: () => Promise<any>;
}

export function useDraftPersistence({
    recipeModal,
    mutateDraft,
}: UseDraftPersistenceOptions) {
    const { t } = useTranslation();

    const saveDraft = async (
        form: FormAccessor,
        step: number,
        draftData: any,
        effectiveNumIngredients: number,
        effectiveNumSteps: number,
        ingredientsInputMode: string,
        stepsInputMode: string,
        stepOverride?: number | React.MouseEvent
    ) => {
        const stepNum =
            typeof stepOverride === 'number' ? stepOverride : undefined;
        const { data, currentDraftId, currentInviteToken } =
            collectDraftFormData(
                form,
                step,
                draftData,
                effectiveNumIngredients,
                effectiveNumSteps,
                ingredientsInputMode,
                stepsInputMode,
                stepNum
            );

        try {
            const res = await axios.post('/api/draft', data);
            if (res.data?.draftId) {
                if (!currentDraftId) {
                    form.setValue('draftId', res.data.draftId);
                }
                if (recipeModal.activeDraftId !== res.data.draftId) {
                    recipeModal.onOpenSharedDraft(res.data.draftId);
                }
            }
            if (res.data?.inviteToken && !currentInviteToken) {
                form.setValue('inviteToken', res.data.inviteToken);
            }
            if (res.data?.draftId) {
                mutateDraft?.();
            }
            mutate('/api/draft/active');
            if (typeof stepOverride !== 'number') {
                toast.success(t('draft_saved') || 'Draft saved!');
            }
        } catch (error) {
            console.error('Failed to save draft', error);
            if (typeof stepOverride !== 'number') {
                toast.error(t('error_saving_draft') || 'Failed to save draft.');
            }
        }
    };

    const copyInviteLink = async (
        form: FormAccessor,
        step: number,
        draftData: any,
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
                recipeModal.onOpenSharedDraft(currentDraftId);
                mutateDraft?.();
            } else {
                try {
                    await axios.post('/api/draft', fullDraftData);
                    mutateDraft?.();
                } catch {
                    // Non-critical background sync
                }
            }
            return `${window.location.origin}/api/draft/join?draft=${currentDraftId}&token=${currentToken}`;
        };

        if (
            typeof navigator !== 'undefined' &&
            navigator.clipboard &&
            typeof ClipboardItem !== 'undefined' &&
            typeof navigator.clipboard.write === 'function'
        ) {
            try {
                const textPromise = prepareShareUrl();
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
            } catch {
                // Fall through to writeText
            }
        }

        try {
            const shareUrl = await prepareShareUrl();
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

    const deleteDraft = async (form: FormAccessor, draftData: any) => {
        const currentDraftId = form.getValues('draftId') || draftData?.draftId;
        const url = currentDraftId
            ? `/api/draft?draftId=${currentDraftId}`
            : `/api/draft`;
        try {
            await axios.delete(url);
            form.setValue('draftId', '');
            form.setValue('inviteToken', '');
            mutateDraft?.();
            mutate('/api/draft/active');
            mutate('/api/draft');
            if (currentDraftId) {
                mutate(
                    `/api/draft?draftId=${encodeURIComponent(currentDraftId)}`
                );
            }
        } catch (error) {
            console.error('Failed to delete draft', error);
        }
    };

    return {
        saveDraft,
        copyInviteLink,
        deleteDraft,
    };
}
