'use client';

import type { Dispatch, SetStateAction, MouseEvent } from 'react';
import { useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    SubmitHandler,
    FieldValues,
    UseFormReset,
    UseFormGetValues,
} from 'react-hook-form';
import { TFunction } from 'i18next';
import { STEPS, STEPS_LENGTH } from '@/app/utils/constants';
import { RecipeModalStateLike } from './useRecipeFormState';
import {
    processIngredientsOnStepAdvance,
    processStepsOnStepAdvance,
} from './recipeStepProcessors';

export interface UseRecipeStepNavigationProps {
    step: number;
    setStep: Dispatch<SetStateAction<number>>;
    recipeModal: RecipeModalStateLike;
    mutateDraft?: (() => Promise<unknown>) | null;
    saveDraft: (stepOverride?: number | MouseEvent) => Promise<boolean>;
    deleteDraft: () => Promise<void>;
    reset: UseFormReset<FieldValues>;
    imageSrc: string;
    ingredientsInputMode: 'list' | 'text';
    stepsInputMode: 'list' | 'text';
    setIngredients: (ingredients: string[]) => void;
    setSteps: (steps: string[]) => void;
    setIngredientsInputMode: (mode: 'list' | 'text') => void;
    setStepsInputMode: (mode: 'list' | 'text') => void;
    setCustomValue: (id: string, value: unknown) => void;
    getValues: UseFormGetValues<FieldValues>;
    isCurrentStepLocked: boolean;
    t: TFunction;
    refresh?: () => void;
}

export function useRecipeStepNavigation({
    step,
    setStep,
    recipeModal,
    mutateDraft,
    saveDraft,
    deleteDraft,
    reset,
    imageSrc,
    ingredientsInputMode,
    stepsInputMode,
    setIngredients,
    setSteps,
    setIngredientsInputMode,
    setStepsInputMode,
    setCustomValue,
    getValues,
    isCurrentStepLocked,
    t,
    refresh,
}: UseRecipeStepNavigationProps) {
    const [isLoading, setIsLoading] = useState(false);

    const onBack = async () => {
        if (process.env.NODE_ENV === 'production' && !recipeModal.isEditMode) {
            await saveDraft(step - 1);
        }
        setStep((value) => Math.max(value - 1, 0));
        if (mutateDraft) {
            void mutateDraft();
        }
    };

    const onNext = () => {
        if (step >= STEPS_LENGTH - 1) {
            return false;
        }

        if (step === STEPS.INGREDIENTS) {
            const ok = processIngredientsOnStepAdvance({
                ingredientsInputMode,
                getValues,
                setIngredients,
                setIngredientsInputMode,
                setCustomValue,
                isCurrentStepLocked,
                t,
            });
            if (!ok) return false;
        }

        if (step === STEPS.STEPS) {
            const ok = processStepsOnStepAdvance({
                stepsInputMode,
                getValues,
                setSteps,
                setStepsInputMode,
                setCustomValue,
                isCurrentStepLocked,
                t,
            });
            if (!ok) return false;
        }

        setStep((value) => value + 1);
        if (mutateDraft) {
            void mutateDraft();
        }
        return true;
    };

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        if (step !== STEPS.IMAGES) {
            const success = onNext();
            if (
                success &&
                process.env.NODE_ENV === 'production' &&
                !recipeModal.isEditMode
            ) {
                await saveDraft(step + 1);
            }
            return;
        }

        if (
            process.env.NEXT_PUBLIC_SKIP_IMAGE_VALIDATION !== 'true' &&
            imageSrc === ''
        ) {
            toast.error('You must upload an image');
            return;
        }

        setIsLoading(true);

        try {
            if (recipeModal.isEditMode && recipeModal.editRecipeData) {
                const url = `${window.location.origin}/api/recipe/${recipeModal.editRecipeData.id}`;
                await axios.patch(url, data);
                toast.success(t('recipe_updated'));
            } else {
                const url = `${window.location.origin}/api/recipes`;
                await axios.post(url, data);
                await deleteDraft();
                toast.success(t('recipe_posted'));
            }

            reset({
                categories: [],
                method: '',
                imageSrc: '',
                imageSrc1: '',
                imageSrc2: '',
                imageSrc3: '',
                title: '',
                description: '',
                ingredients: [],
                steps: [],
                minutes: 30,
                prepTime: undefined,
                cookTime: undefined,
                coCooksIds: [],
                linkedRecipeIds: [],
                youtubeUrl: '',
                questId: '',
                draftId: '',
                inviteToken: '',
            });
            setStep(STEPS.CATEGORY);
            recipeModal.onClose?.();
            if (refresh) {
                refresh();
            }
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setIsLoading(false);
        }
    };

    const actionLabel = useMemo(() => {
        if (step === STEPS.IMAGES) {
            if (isLoading) {
                return recipeModal.isEditMode
                    ? t('updating_recipe') || 'Updating...'
                    : t('creating_recipe') || 'Creating...';
            }
            return recipeModal.isEditMode ? t('update') : t('create');
        }
        return t('next');
    }, [step, t, recipeModal.isEditMode, isLoading]);

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY) {
            return undefined;
        }
        return t('back');
    }, [step, t]);

    return {
        isLoading,
        onBack,
        onNext,
        onSubmit,
        actionLabel,
        secondaryActionLabel,
    };
}
