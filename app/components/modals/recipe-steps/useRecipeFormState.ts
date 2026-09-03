'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
    STEPS,
    STEPS_LENGTH,
} from '@/app/utils/constants';

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
import {
    processIngredientsOnStepAdvance,
    processStepsOnStepAdvance,
} from './recipeStepProcessors';

export interface RecipeModalStateLike extends RecipeModalDraftController {
    editRecipeData?: EditRecipeData | null;
    questId?: string | null;
}

interface UseRecipeFormStateProps {
    recipeModal: RecipeModalStateLike;
    currentUser?: SafeUser | null;
    draftData?: Partial<DraftData> | null;
    mutateDraft?: () => Promise<unknown>;
}

function checkIsCollaborativeSession({
    isEditMode,
    draftType,
    coCooksIds,
    hasDraftCoCooks,
    hasInviteToken,
}: {
    isEditMode?: boolean;
    draftType?: string;
    coCooksIds?: string[];
    hasDraftCoCooks?: boolean;
    hasInviteToken?: boolean;
    activeDraftId?: string | null;
}): boolean {
    if (isEditMode) return true;
    if (draftType === 'shared') return true;
    if (hasDraftCoCooks) return true;
    if (Array.isArray(coCooksIds) && coCooksIds.length > 0) return true;
    if (hasInviteToken) return true;
    return false;
}

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

    const [numIngredients, setNumIngredients] = useState<number>(() => {
        if (recipeModal.isEditMode && recipeModal.editRecipeData) {
            return recipeModal.editRecipeData.ingredients?.length || 1;
        }
        if (draftData && draftData.ingredients) {
            return draftData.ingredients.length || 1;
        }
        return 1;
    });

    const [numSteps, setNumSteps] = useState<number>(() => {
        if (recipeModal.isEditMode && recipeModal.editRecipeData) {
            return recipeModal.editRecipeData.steps?.length || 1;
        }
        if (draftData && draftData.steps) {
            return draftData.steps.length || 1;
        }
        return 1;
    });

    const effectiveNumIngredients = Math.max(
        numIngredients,
        Array.isArray(draftData?.ingredients) ? draftData.ingredients.length : 1
    );
    const effectiveNumSteps = Math.max(
        numSteps,
        Array.isArray(draftData?.steps) ? draftData.steps.length : 1
    );

    const [isLoading, setIsLoading] = useState(false);
    const [ingredientsInputMode, setIngredientsInputMode] = useState<
        'list' | 'text'
    >('list');
    const [stepsInputMode, setStepsInputMode] = useState<'list' | 'text'>(
        'list'
    );

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

    const addIngredientInput = useCallback(() => {
        if (effectiveNumIngredients >= RECIPE_MAX_INGREDIENTS) {
            toast.error(
                t('max_ingredients_reached') ||
                    `Maximum of ${RECIPE_MAX_INGREDIENTS} ingredients allowed`
            );
            return;
        }
        setNumIngredients(effectiveNumIngredients + 1);
    }, [effectiveNumIngredients, t]);

    const removeIngredientInput = useCallback(
        (index: number) => {
            setNumIngredients(Math.max(1, effectiveNumIngredients - 1));
            updateFormField(`ingredient-${index}`, '');
        },
        [effectiveNumIngredients, updateFormField]
    );

    const setIngredients = useCallback(
        (ingredients: string[]) => {
            for (let i = 0; i < RECIPE_MAX_INGREDIENTS; i++) {
                updateFormField(`ingredient-${i}`, '');
            }
            setNumIngredients(Math.max(1, ingredients.length));
            ingredients.forEach((ingredient, index) => {
                updateFormField(`ingredient-${index}`, ingredient);
            });
            updateFormField('ingredients', ingredients);
        },
        [updateFormField]
    );

    const addStepInput = useCallback(() => {
        if (effectiveNumSteps >= RECIPE_MAX_STEPS) {
            toast.error(
                t('max_steps_reached') ||
                    `Maximum of ${RECIPE_MAX_STEPS} steps allowed`
            );
            return;
        }
        setNumSteps(effectiveNumSteps + 1);
    }, [effectiveNumSteps, t]);

    const removeStepInput = useCallback(
        (index: number) => {
            setNumSteps(Math.max(1, effectiveNumSteps - 1));
            updateFormField(`step-${index}`, '');
        },
        [effectiveNumSteps, updateFormField]
    );

    const setSteps = useCallback(
        (steps: string[]) => {
            for (let i = 0; i < RECIPE_MAX_STEPS; i++) {
                updateFormField(`step-${i}`, '');
            }
            setNumSteps(Math.max(1, steps.length));
            steps.forEach((step, index) => {
                updateFormField(`step-${index}`, step);
            });
            updateFormField('steps', steps);
        },
        [updateFormField]
    );

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
        activeDraftId: recipeModal.activeDraftId,
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
            effectiveNumIngredients,
            effectiveNumSteps,
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
            effectiveNumIngredients,
            effectiveNumSteps,
            ingredientsInputMode,
            stepsInputMode,
            stepOverride
        );
    };

    const deleteDraft = async () => {
        await _deleteDraft(formAccessor, draftData);
    };

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
        step,
        setStep,
        numIngredients: effectiveNumIngredients,
        numSteps: effectiveNumSteps,
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
        onBack,
        onSubmit,
        setCustomValue,
        draftData,
        isLoadingDraft,
        mutateDraft,
    };
}
