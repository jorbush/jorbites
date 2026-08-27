'use client';

import { useCallback } from 'react';
import axios from 'axios';
import { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    STEPS,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';
import { parseTextToList } from '@/app/utils/textParser';

interface FormAccessor {
    watch: (field: string) => any;
    getValues: (field: string) => any;
    setValue: (field: string, value: any) => void;
}

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
        const stepToSave =
            typeof stepOverride === 'number' ? stepOverride : step;

        let newIngredients: string[] = [];
        if (step === STEPS.INGREDIENTS) {
            if (ingredientsInputMode === 'text') {
                const textareaValue = form.getValues('ingredients-plain-text');
                const parsedItems = parseTextToList(
                    textareaValue,
                    RECIPE_MAX_INGREDIENTS
                );
                if (parsedItems.length > 0) {
                    newIngredients = parsedItems;
                }
            } else {
                for (let i = 0; i < effectiveNumIngredients; i++) {
                    const val = form.getValues(`ingredient-${i}`);
                    if (typeof val === 'string' && val.trim() !== '') {
                        newIngredients.push(val);
                    }
                }
            }
        } else {
            newIngredients =
                draftData?.ingredients && draftData.ingredients.length > 0
                    ? draftData.ingredients
                    : form.getValues('ingredients') || [];
        }

        let newSteps: string[] = [];
        if (step === STEPS.STEPS) {
            if (stepsInputMode === 'text') {
                const textareaValue = form.getValues('steps-plain-text');
                const parsedItems = parseTextToList(
                    textareaValue,
                    RECIPE_MAX_STEPS
                );
                if (parsedItems.length > 0) {
                    newSteps = parsedItems;
                }
            } else {
                for (let i = 0; i < effectiveNumSteps; i++) {
                    const val = form.getValues(`step-${i}`);
                    if (typeof val === 'string' && val.trim() !== '') {
                        newSteps.push(val);
                    }
                }
            }
        } else {
            newSteps =
                draftData?.steps && draftData.steps.length > 0
                    ? draftData.steps
                    : form.getValues('steps') || [];
        }

        const currentDraftId = form.watch('draftId') || draftData?.draftId;
        const currentInviteToken =
            form.watch('inviteToken') || draftData?.inviteToken;

        const isShared = Boolean(currentDraftId);

        const data: any = {
            draftId: currentDraftId,
            inviteToken: currentInviteToken,
            currentStep: stepToSave,
            categories: form.watch('categories'),
            method: form.watch('method'),
            imageSrc: form.watch('imageSrc'),
            imageSrc1: form.watch('imageSrc1'),
            imageSrc2: form.watch('imageSrc2'),
            imageSrc3: form.watch('imageSrc3'),
            title: form.watch('title'),
            description: form.watch('description'),
            minutes: form.watch('minutes'),
            prepTime: form.watch('prepTime'),
            cookTime: form.watch('cookTime'),
            coCooksIds: form.watch('coCooksIds'),
            linkedRecipeIds: form.watch('linkedRecipeIds'),
            youtubeUrl: form.watch('youtubeUrl'),
            questId: form.watch('questId'),
            updatedAt: new Date().toISOString(),
        };

        if (step === STEPS.INGREDIENTS || !isShared) {
            data.ingredients = newIngredients;
        }
        if (step === STEPS.STEPS || !isShared) {
            data.steps = newSteps;
        }

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
        let currentDraftId = form.getValues('draftId') || draftData?.draftId;
        let currentToken =
            form.getValues('inviteToken') || draftData?.inviteToken;

        let newIngredients: string[] = [];
        if (ingredientsInputMode === 'text') {
            const textareaValue = form.getValues('ingredients-plain-text');
            const parsedItems = parseTextToList(
                textareaValue,
                RECIPE_MAX_INGREDIENTS
            );
            if (parsedItems.length > 0) {
                newIngredients = parsedItems;
            }
        } else {
            for (let i = 0; i < effectiveNumIngredients; i++) {
                const val = form.getValues(`ingredient-${i}`);
                if (typeof val === 'string' && val.trim() !== '') {
                    newIngredients.push(val);
                }
            }
        }

        let newSteps: string[] = [];
        if (stepsInputMode === 'text') {
            const textareaValue = form.getValues('steps-plain-text');
            const parsedItems = parseTextToList(
                textareaValue,
                RECIPE_MAX_STEPS
            );
            if (parsedItems.length > 0) {
                newSteps = parsedItems;
            }
        } else {
            for (let i = 0; i < effectiveNumSteps; i++) {
                const val = form.getValues(`step-${i}`);
                if (typeof val === 'string' && val.trim() !== '') {
                    newSteps.push(val);
                }
            }
        }

        if (step !== STEPS.INGREDIENTS) {
            const remoteIngredients = draftData?.ingredients;
            if (
                Array.isArray(remoteIngredients) &&
                remoteIngredients.length > 0
            ) {
                newIngredients = remoteIngredients;
            } else if (newIngredients.length === 0) {
                const existing = form.getValues('ingredients') || [];
                if (existing.length > 0) {
                    newIngredients = existing;
                }
            }
        }

        if (step !== STEPS.STEPS) {
            const remoteSteps = draftData?.steps;
            if (Array.isArray(remoteSteps) && remoteSteps.length > 0) {
                newSteps = remoteSteps;
            } else if (newSteps.length === 0) {
                const existing = form.getValues('steps') || [];
                if (existing.length > 0) {
                    newSteps = existing;
                }
            }
        }

        const fullDraftData = {
            draftId: currentDraftId,
            inviteToken: currentToken,
            currentStep: step,
            categories: form.getValues('categories') || draftData?.categories,
            method:
                step === STEPS.METHODS
                    ? form.getValues('method')
                    : draftData?.method || form.getValues('method'),
            imageSrc: form.getValues('imageSrc'),
            imageSrc1: form.getValues('imageSrc1'),
            imageSrc2: form.getValues('imageSrc2'),
            imageSrc3: form.getValues('imageSrc3'),
            title: form.getValues('title'),
            description: form.getValues('description'),
            ingredients: newIngredients,
            steps: newSteps,
            minutes: form.getValues('minutes'),
            prepTime: form.getValues('prepTime'),
            cookTime: form.getValues('cookTime'),
            coCooksIds:
                step === STEPS.RELATED_CONTENT
                    ? form.getValues('coCooksIds')
                    : draftData?.coCooksIds || form.getValues('coCooksIds'),
            linkedRecipeIds:
                step === STEPS.RELATED_CONTENT
                    ? form.getValues('linkedRecipeIds')
                    : draftData?.linkedRecipeIds ||
                      form.getValues('linkedRecipeIds'),
            youtubeUrl: form.getValues('youtubeUrl'),
            questId: form.getValues('questId'),
            updatedAt: new Date().toISOString(),
        };

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
        const currentDraftId = form.watch('draftId') || draftData?.draftId;
        const url = currentDraftId
            ? `/api/draft?draftId=${currentDraftId}`
            : `/api/draft`;
        try {
            await axios.delete(url);
            form.setValue('draftId', '');
            form.setValue('inviteToken', '');
            mutateDraft?.();
            mutate('/api/draft/active');
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
