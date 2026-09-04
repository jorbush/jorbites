'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import { STEPS, STEPS_LENGTH } from '@/app/utils/constants';

import { useRecipeLock } from '@/app/hooks/useRecipeLock';
import { useDraftSync } from '@/app/hooks/useDraftSync';
import {
    useDraftPersistence,
    RecipeModalDraftController,
} from '@/app/hooks/useDraftPersistence';
import { EditRecipeData } from '@/app/hooks/useRecipeModal';
import { DraftData } from '@/app/types/draft';
import { buildInitialRecipeDefaultValues } from './recipeFormDefaults';
import { useRecipeRelatedContent } from './useRecipeRelatedContent';
import { useRecipeItemsState } from './useRecipeItemsState';
import { useRecipeStepNavigation } from './useRecipeStepNavigation';

export interface RecipeModalStateLike extends RecipeModalDraftController {
    isEditMode?: boolean;
    onClose?: () => void;
    editRecipeData?: EditRecipeData | null;
    questId?: string | null;
}

interface UseRecipeFormStateProps {
    recipeModal: RecipeModalStateLike;
    currentUser?: SafeUser | null;
    draftData?: Partial<DraftData> | null;
    mutateDraft?: () => Promise<unknown>;
}

import {
    checkIsCollaborativeSession,
    CheckIsCollaborativeSessionProps,
} from '@/app/utils/draftFormUtils';

export { checkIsCollaborativeSession };
export type { CheckIsCollaborativeSessionProps };

export function useRecipeFormState({
    recipeModal,
    currentUser,
    draftData: propDraftData,
    mutateDraft: propMutateDraft,
}: UseRecipeFormStateProps) {
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();

    const { draftData, isLoadingDraft, mutateDraft, syncFormFromDraft } =
        useDraftSync({
            activeDraftId: recipeModal.activeDraftId,
            isEditMode: Boolean(recipeModal.isEditMode),
            currentUser,
            isOpen: Boolean(recipeModal.isOpen),
            initialDraftData: propDraftData,
            initialMutateDraft: propMutateDraft,
        });

    const [step, setStep] = useState(() => {
        if (
            !recipeModal.isEditMode &&
            draftData &&
            draftData.currentStep !== undefined
        ) {
            return Math.max(
                0,
                Math.min(draftData.currentStep, STEPS_LENGTH - 1)
            );
        }
        return STEPS.CATEGORY;
    });

    const initialDefaultValues = useMemo(
        () => buildInitialRecipeDefaultValues(recipeModal, draftData),
        [recipeModal, draftData]
    );

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        reset,
        formState: { errors, isDirty },
    } = useForm<FieldValues>({
        defaultValues: initialDefaultValues,
    });

    const categories = watch('categories');
    const minutes = watch('minutes');
    const prepTime = watch('prepTime');
    const cookTime = watch('cookTime');
    const imageSrc = watch('imageSrc');
    const method = watch('method');
    const rawCoCooksIds = watch('coCooksIds');
    const rawLinkedRecipeIds = watch('linkedRecipeIds');
    const questId = watch('questId');

    const coCooksIds: string[] = useMemo(
        () => (Array.isArray(rawCoCooksIds) ? rawCoCooksIds : []),
        [rawCoCooksIds]
    );

    const linkedRecipeIds: string[] = useMemo(
        () => (Array.isArray(rawLinkedRecipeIds) ? rawLinkedRecipeIds : []),
        [rawLinkedRecipeIds]
    );

    const updateFormField = useCallback(
        (id: string, value: unknown) => {
            setValue(id, value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        },
        [setValue]
    );

    const setCustomValue = updateFormField;

    const {
        numIngredients,
        numSteps,
        setNumIngredients,
        setNumSteps,
        ingredientsInputMode,
        setIngredientsInputMode,
        stepsInputMode,
        setStepsInputMode,
        addIngredientInput,
        removeIngredientInput,
        setIngredients,
        addStepInput,
        removeStepInput,
        setSteps,
    } = useRecipeItemsState({
        recipeModal,
        draftData,
        updateFormField,
        t,
    });

    const formAccessor = useMemo(
        () => ({
            watch,
            getValues,
            setValue,
        }),
        [watch, getValues, setValue]
    );

    const lockTargetId = recipeModal.isEditMode
        ? recipeModal.editRecipeData?.id
        : watch('draftId') || draftData?.draftId || recipeModal.activeDraftId;

    const hasDraftCoCooks = Boolean(
        (draftData?.coCooksIds && draftData.coCooksIds.length > 0) ||
        (draftData?.coCooks && draftData.coCooks.length > 0)
    );
    const hasInviteToken = Boolean(
        draftData?.inviteToken || watch('inviteToken')
    );
    const isCollaborativeSession = checkIsCollaborativeSession({
        isEditMode: recipeModal.isEditMode,
        draftType: draftData?.type,
        coCooksIds,
        hasDraftCoCooks,
        hasInviteToken,
    });

    const activeLockField =
        recipeModal.isOpen && isCollaborativeSession && lockTargetId
            ? `step:${step}`
            : null;

    const lock = useRecipeLock(
        isCollaborativeSession ? lockTargetId : null,
        currentUser?.id,
        activeLockField
    );
    const isCurrentStepLocked = Boolean(lock?.isLockedByOther(`step:${step}`));

    useEffect(() => {
        syncFormFromDraft(setValue, getValues, step, lock, false);
    }, [draftData, syncFormFromDraft, setValue, getValues, step, lock]);

    const [prevDraftId, setPrevDraftId] = useState<string | null>(
        () => draftData?.draftId || null
    );

    const currentDraftId = draftData?.draftId || null;
    if (!recipeModal.isEditMode && currentDraftId !== prevDraftId) {
        setPrevDraftId(currentDraftId);
        if (draftData) {
            if (Array.isArray(draftData.ingredients)) {
                setNumIngredients(Math.max(1, draftData.ingredients.length));
            }
            if (Array.isArray(draftData.steps)) {
                setNumSteps(Math.max(1, draftData.steps.length));
            }
            if (draftData.currentStep !== undefined) {
                setStep(
                    Math.max(
                        0,
                        Math.min(draftData.currentStep, STEPS_LENGTH - 1)
                    )
                );
            }
        } else {
            setStep(STEPS.CATEGORY);
            setNumIngredients(1);
            setNumSteps(1);
        }
    }

    const {
        selectedCoCooks,
        selectedLinkedRecipes,
        selectedQuest,
        addCoCook,
        removeCoCook,
        addLinkedRecipe,
        removeLinkedRecipe,
        selectQuest,
        removeQuest,
    } = useRecipeRelatedContent({
        recipeModal,
        draftData,
        coCooksIds,
        linkedRecipeIds,
        questId,
        updateFormField,
        t,
    });

    const {
        saveDraft: _saveDraft,
        copyInviteLink: _copyInviteLink,
        deleteDraft: _deleteDraft,
        isSaving,
        flushDraftSaves,
    } = useDraftPersistence({
        recipeModal,
        mutateDraft,
    });

    const copyInviteLink = async () => {
        await _copyInviteLink(
            formAccessor,
            step,
            draftData,
            numIngredients,
            numSteps,
            ingredientsInputMode,
            stepsInputMode
        );
    };

    const saveDraft = async (
        stepOverride?: number | React.MouseEvent
    ): Promise<boolean> => {
        return _saveDraft(
            formAccessor,
            step,
            draftData,
            numIngredients,
            numSteps,
            ingredientsInputMode,
            stepsInputMode,
            stepOverride
        );
    };

    const deleteDraft = async () => {
        await _deleteDraft(formAccessor, draftData);
    };

    const {
        isLoading,
        onBack,
        onNext,
        onSubmit,
        actionLabel,
        secondaryActionLabel,
    } = useRecipeStepNavigation({
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
    });

    return {
        step,
        setStep,
        numIngredients,
        numSteps,
        isLoading,
        isSaving,
        isDirty,
        selectedCoCooks,
        selectedLinkedRecipes,
        selectedQuest,
        ingredientsInputMode,
        setIngredientsInputMode,
        stepsInputMode,
        setStepsInputMode,
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        errors,
        reset,
        categories,
        minutes,
        prepTime,
        cookTime,
        imageSrc,
        method,
        addCoCook,
        removeCoCook,
        addLinkedRecipe,
        removeLinkedRecipe,
        selectQuest,
        removeQuest,
        saveDraft,
        flushDraftSaves,
        copyInviteLink,
        lock,
        isCurrentStepLocked,
        addIngredientInput,
        removeIngredientInput,
        setIngredients,
        addStepInput,
        removeStepInput,
        setSteps,
        actionLabel,
        secondaryActionLabel,
        onNext,
        onBack,
        onSubmit,
        setCustomValue,
        draftData,
        isLoadingDraft,
        mutateDraft,
    };
}
