'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeUser, SafeRecipe, SafeQuest } from '@/app/types';
import { axiosFetcher } from '@/app/utils/fetcher';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
    STEPS,
    STEPS_LENGTH,
    MAX_CO_COOKS,
    MAX_LINKED_RECIPES,
} from '@/app/utils/constants';
import { parseIngredientsText, parseStepsText } from '@/app/utils/textParser';

import { useRecipeLock } from '@/app/hooks/useRecipeLock';
import { useDraftSync } from '@/app/hooks/useDraftSync';
import {
    useDraftPersistence,
    RecipeModalDraftController,
} from '@/app/hooks/useDraftPersistence';
import { EditRecipeData } from '@/app/hooks/useRecipeModal';
import { DraftData } from '@/app/types/draft';

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
    const [knownUsers, setKnownUsers] = useState<Record<string, SafeUser>>(
        () => {
            const initial: Record<string, SafeUser> = {};
            const items = recipeModal.isEditMode
                ? recipeModal.editRecipeData?.coCooks
                : draftData?.coCooks;
            if (Array.isArray(items)) {
                items.forEach((user: SafeUser) => {
                    if (user?.id) initial[user.id] = user;
                });
            }
            return initial;
        }
    );
    const [knownRecipes, setKnownRecipes] = useState<
        Record<string, SafeRecipe>
    >(() => {
        const initial: Record<string, SafeRecipe> = {};
        const items = recipeModal.isEditMode
            ? recipeModal.editRecipeData?.linkedRecipes
            : draftData?.linkedRecipes;
        if (Array.isArray(items)) {
            items.forEach((recipe: SafeRecipe) => {
                if (recipe?.id) initial[recipe.id] = recipe;
            });
        }
        return initial;
    });
    const [knownQuests, setKnownQuests] = useState<Record<string, SafeQuest>>(
        () => {
            return {};
        }
    );
    const [ingredientsInputMode, setIngredientsInputMode] = useState<
        'list' | 'text'
    >('list');
    const [stepsInputMode, setStepsInputMode] = useState<'list' | 'text'>(
        'list'
    );

    const initialDefaultValues = useMemo(() => {
        const emptySlots: Record<string, string> = {};
        for (let i = 0; i < RECIPE_MAX_INGREDIENTS; i++) {
            emptySlots[`ingredient-${i}`] = '';
        }
        for (let i = 0; i < RECIPE_MAX_STEPS; i++) {
            emptySlots[`step-${i}`] = '';
        }

        if (recipeModal.isEditMode && recipeModal.editRecipeData) {
            const editData = recipeModal.editRecipeData;
            const ingredients = Array.isArray(editData.ingredients)
                ? editData.ingredients
                : [];
            const ingredientsObject: Record<string, string> = {};
            ingredients.forEach((ingredient: string, index: number) => {
                ingredientsObject[`ingredient-${index}`] = ingredient;
            });
            const steps = Array.isArray(editData.steps) ? editData.steps : [];
            const stepsObject: Record<string, string> = {};
            steps.forEach((step: string, index: number) => {
                stepsObject[`step-${index}`] = step;
            });
            return {
                ...emptySlots,
                categories: Array.isArray(editData.categories)
                    ? editData.categories
                    : [],
                method: editData.method,
                imageSrc: editData.imageSrc,
                imageSrc1: editData.imageSrc1 || '',
                imageSrc2: editData.imageSrc2 || '',
                imageSrc3: editData.imageSrc3 || '',
                title: editData.title,
                description: editData.description,
                ingredients,
                steps,
                minutes: editData.minutes,
                prepTime: editData.prepTime ?? undefined,
                cookTime: editData.cookTime ?? undefined,
                coCooksIds:
                    editData.coCooksIds ||
                    editData.coCooks?.map((c: SafeUser) => c.id) ||
                    [],
                linkedRecipeIds:
                    editData.linkedRecipeIds ||
                    editData.linkedRecipes?.map((r: SafeRecipe) => r.id) ||
                    [],
                youtubeUrl: editData.youtubeUrl || '',
                questId: editData.questId || recipeModal.questId || '',
                draftId: '',
                inviteToken: '',
                ...ingredientsObject,
                ...stepsObject,
            };
        }
        if (draftData) {
            const ingredients = Array.isArray(draftData.ingredients)
                ? draftData.ingredients
                : [];
            const ingredientsObject: Record<string, string> = {};
            ingredients.forEach((ingredient: string, index: number) => {
                ingredientsObject[`ingredient-${index}`] = ingredient;
            });
            const steps = Array.isArray(draftData.steps) ? draftData.steps : [];
            const stepsObject: Record<string, string> = {};
            steps.forEach((step: string, index: number) => {
                stepsObject[`step-${index}`] = step;
            });
            return {
                ...emptySlots,
                categories: Array.isArray(draftData.categories)
                    ? draftData.categories
                    : [],
                method: draftData.method || '',
                imageSrc: draftData.imageSrc || '',
                imageSrc1: draftData.imageSrc1 || '',
                imageSrc2: draftData.imageSrc2 || '',
                imageSrc3: draftData.imageSrc3 || '',
                title: draftData.title || '',
                description: draftData.description || '',
                ingredients,
                steps,
                minutes:
                    draftData.minutes !== undefined ? draftData.minutes : 30,
                prepTime: draftData.prepTime ?? undefined,
                cookTime: draftData.cookTime ?? undefined,
                coCooksIds:
                    draftData.coCooksIds ||
                    draftData.coCooks?.map((c: SafeUser) => c.id) ||
                    [],
                linkedRecipeIds:
                    draftData.linkedRecipeIds ||
                    draftData.linkedRecipes?.map((r: SafeRecipe) => r.id) ||
                    [],
                youtubeUrl: draftData.youtubeUrl || '',
                questId: draftData.questId || recipeModal.questId || '',
                draftId: draftData.draftId || '',
                inviteToken: draftData.inviteToken || '',
                ...ingredientsObject,
                ...stepsObject,
            };
        }
        return {
            ...emptySlots,
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
            questId: recipeModal.questId || '',
            draftId: '',
            inviteToken: '',
        };
    }, [
        recipeModal.isEditMode,
        recipeModal.editRecipeData,
        recipeModal.questId,
        draftData,
    ]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { errors, isDirty },
        reset,
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
        if (numIngredients >= RECIPE_MAX_INGREDIENTS) {
            toast.error(
                t('max_ingredients_reached') ||
                    `Maximum of ${RECIPE_MAX_INGREDIENTS} ingredients allowed`
            );
            return;
        }
        setNumIngredients((prev) => prev + 1);
    }, [numIngredients, t]);

    const removeIngredientInput = useCallback(
        (index: number) => {
            setNumIngredients((prev) => Math.max(1, prev - 1));
            updateFormField(`ingredient-${index}`, '');
        },
        [updateFormField]
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
        if (numSteps >= RECIPE_MAX_STEPS) {
            toast.error(
                t('max_steps_reached') ||
                    `Maximum of ${RECIPE_MAX_STEPS} steps allowed`
            );
            return;
        }
        setNumSteps((prev) => prev + 1);
    }, [numSteps, t]);

    const removeStepInput = useCallback(
        (index: number) => {
            setNumSteps((prev) => Math.max(1, prev - 1));
            updateFormField(`step-${index}`, '');
        },
        [updateFormField]
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

    const lock = useRecipeLock(lockTargetId, currentUser?.id);
    const isCurrentStepLocked = Boolean(lock?.isLockedByOther(`step:${step}`));

    useEffect(() => {
        syncFormFromDraft(setValue, getValues, step, lock, false);
    }, [draftData, syncFormFromDraft, setValue, getValues, step, lock]);

    const [prevDraftId, setPrevDraftId] = useState<string | null>(
        () => draftData?.draftId || null
    );

    useEffect(() => {
        if (
            !recipeModal.isEditMode &&
            (draftData?.draftId || null) !== prevDraftId
        ) {
            setPrevDraftId(draftData?.draftId || null);
            if (draftData && draftData.currentStep !== undefined) {
                setStep(
                    Math.max(
                        0,
                        Math.min(draftData.currentStep, STEPS_LENGTH - 1)
                    )
                );
            } else if (!draftData) {
                setStep(STEPS.CATEGORY);
            }
        }
    }, [draftData, prevDraftId, recipeModal.isEditMode]);

    const addCoCook = (user: SafeUser) => {
        if (coCooksIds.length >= MAX_CO_COOKS) {
            toast.error(
                t('max_cooks_reached') ||
                    `Maximum of ${MAX_CO_COOKS} co-cooks allowed`
            );
            return;
        }
        if (coCooksIds.includes(user.id)) {
            toast.error(
                t('cook_already_added') || 'This cook is already added'
            );
            return;
        }
        setKnownUsers((prev) => ({ ...prev, [user.id]: user }));
        updateFormField('coCooksIds', [...coCooksIds, user.id]);
    };

    const removeCoCook = (userId: string) => {
        updateFormField(
            'coCooksIds',
            coCooksIds.filter((id: string) => id !== userId)
        );
    };

    const addLinkedRecipe = (recipe: SafeRecipe) => {
        if (linkedRecipeIds.length >= MAX_LINKED_RECIPES) {
            toast.error(
                t('max_recipes_reached') ||
                    `Maximum of ${MAX_LINKED_RECIPES} linked recipes allowed`
            );
            return;
        }
        if (linkedRecipeIds.includes(recipe.id)) {
            toast.error(
                t('recipe_already_added') || 'This recipe is already added'
            );
            return;
        }
        setKnownRecipes((prev) => ({ ...prev, [recipe.id]: recipe }));
        updateFormField('linkedRecipeIds', [...linkedRecipeIds, recipe.id]);
    };

    const removeLinkedRecipe = (recipeId: string) => {
        updateFormField(
            'linkedRecipeIds',
            linkedRecipeIds.filter((id: string) => id !== recipeId)
        );
    };

    const selectQuest = (quest: SafeQuest) => {
        if (quest?.id) {
            setKnownQuests((prev) => ({ ...prev, [quest.id]: quest }));
        }
        updateFormField('questId', quest?.id || '');
    };

    const removeQuest = () => {
        updateFormField('questId', '');
    };

    useEffect(() => {
        if (lockTargetId && currentUser?.id) {
            const stepKey = `step:${step}`;
            lock.acquire(stepKey);
            return () => {
                lock.release(stepKey);
            };
        }
    }, [step, lockTargetId, currentUser?.id, lock.acquire, lock.release]);

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

    const questId = watch('questId');

    const { data: questData } = useSWR<SafeQuest>(
        questId ? `/api/quest/${questId}` : null,
        axiosFetcher
    );

    const { data: coCooksData } = useSWR<SafeUser[]>(
        coCooksIds.length > 0
            ? `/api/users/multiple?ids=${coCooksIds.join(',')}`
            : null,
        axiosFetcher
    );

    const { data: linkedRecipesData } = useSWR<SafeRecipe[]>(
        linkedRecipeIds.length > 0
            ? `/api/recipes/multiple?ids=${linkedRecipeIds.join(',')}`
            : null,
        axiosFetcher
    );

    const [prevCoCooksData, setPrevCoCooksData] = useState(coCooksData);
    if (coCooksData && coCooksData !== prevCoCooksData) {
        setPrevCoCooksData(coCooksData);
        if (Array.isArray(coCooksData)) {
            setKnownUsers((prev) => {
                const next = { ...prev };
                coCooksData.forEach((user: SafeUser) => {
                    if (user?.id) next[user.id] = user;
                });
                return next;
            });
        }
    }

    const [prevLinkedRecipesData, setPrevLinkedRecipesData] =
        useState(linkedRecipesData);
    if (linkedRecipesData && linkedRecipesData !== prevLinkedRecipesData) {
        setPrevLinkedRecipesData(linkedRecipesData);
        if (Array.isArray(linkedRecipesData)) {
            setKnownRecipes((prev) => {
                const next = { ...prev };
                linkedRecipesData.forEach((recipe: SafeRecipe) => {
                    if (recipe?.id) next[recipe.id] = recipe;
                });
                return next;
            });
        }
    }

    const [prevQuestData, setPrevQuestData] = useState(questData);
    if (questData && questData !== prevQuestData) {
        setPrevQuestData(questData);
        if (questData?.id) {
            setKnownQuests((prev) => ({ ...prev, [questData.id]: questData }));
        }
    }

    const allKnownUsers = useMemo(() => {
        const map: Record<string, SafeUser> = { ...knownUsers };
        const items = recipeModal.isEditMode
            ? recipeModal.editRecipeData?.coCooks
            : draftData?.coCooks;
        if (Array.isArray(items)) {
            items.forEach((user: SafeUser) => {
                if (user?.id) map[user.id] = user;
            });
        }
        return map;
    }, [
        knownUsers,
        recipeModal.isEditMode,
        recipeModal.editRecipeData?.coCooks,
        draftData?.coCooks,
    ]);

    const allKnownRecipes = useMemo(() => {
        const map: Record<string, SafeRecipe> = { ...knownRecipes };
        const items = recipeModal.isEditMode
            ? recipeModal.editRecipeData?.linkedRecipes
            : draftData?.linkedRecipes;
        if (Array.isArray(items)) {
            items.forEach((recipe: SafeRecipe) => {
                if (recipe?.id) map[recipe.id] = recipe;
            });
        }
        return map;
    }, [
        knownRecipes,
        recipeModal.isEditMode,
        recipeModal.editRecipeData?.linkedRecipes,
        draftData?.linkedRecipes,
    ]);

    const selectedQuest = useMemo<SafeQuest | null>(() => {
        return questId ? (knownQuests[questId] ?? null) : null;
    }, [questId, knownQuests]);

    const selectedCoCooks = useMemo<SafeUser[]>(() => {
        return coCooksIds
            .map((id: string) => allKnownUsers[id])
            .filter((user: SafeUser | undefined): user is SafeUser =>
                Boolean(user)
            );
    }, [coCooksIds, allKnownUsers]);

    const selectedLinkedRecipes = useMemo<SafeRecipe[]>(() => {
        return linkedRecipeIds
            .map((id: string) => allKnownRecipes[id])
            .filter((recipe: SafeRecipe | undefined): recipe is SafeRecipe =>
                Boolean(recipe)
            );
    }, [linkedRecipeIds, allKnownRecipes]);

    const onBack = async () => {
        if (process.env.NODE_ENV === 'production' && !recipeModal.isEditMode) {
            await saveDraft(step - 1);
        }
        setStep((value) => Math.max(value - 1, 0));
        mutateDraft?.();
    };

    const onNext = () => {
        if (step >= STEPS_LENGTH - 1) {
            return false;
        }

        if (step === STEPS.INGREDIENTS) {
            if (ingredientsInputMode === 'text') {
                const textareaValue = getValues('ingredients-plain-text');
                const parsedItems = parseIngredientsText(
                    textareaValue,
                    RECIPE_MAX_INGREDIENTS
                );
                if (parsedItems.length > 0) {
                    setIngredients(parsedItems);
                    setIngredientsInputMode('list');
                    toast.success(
                        `${parsedItems.length} ${t('ingredients_applied')}`
                    );
                } else if (!isCurrentStepLocked) {
                    toast.error(
                        t('no_ingredients_found') || 'No ingredients found'
                    );
                    return false;
                }
            } else {
                let newIngredients: string[] = [];
                for (let i = 0; i < RECIPE_MAX_INGREDIENTS; i++) {
                    const val = getValues(`ingredient-${i}`);
                    if (typeof val === 'string' && val.trim() !== '') {
                        newIngredients.push(val.trim());
                    }
                }
                if (newIngredients.length === 1) {
                    const parsedItems = parseIngredientsText(
                        newIngredients[0],
                        RECIPE_MAX_INGREDIENTS
                    );
                    if (parsedItems.length > 1) {
                        newIngredients = parsedItems;
                        setIngredients(parsedItems);
                        toast.success(
                            `${parsedItems.length} ${t('ingredients_applied')}`
                        );
                    } else {
                        setCustomValue('ingredients', newIngredients);
                    }
                } else {
                    setCustomValue('ingredients', newIngredients);
                }
            }
        }
        if (step === STEPS.STEPS) {
            if (stepsInputMode === 'text') {
                const textareaValue = getValues('steps-plain-text');
                const parsedItems = parseStepsText(
                    textareaValue,
                    RECIPE_MAX_STEPS
                );
                if (parsedItems.length > 0) {
                    setSteps(parsedItems);
                    setStepsInputMode('list');
                    toast.success(
                        `${parsedItems.length} ${t('steps_applied')}`
                    );
                } else if (!isCurrentStepLocked) {
                    toast.error(t('no_steps_found') || 'No steps found');
                    return false;
                }
            } else {
                let newSteps: string[] = [];
                for (let i = 0; i < RECIPE_MAX_STEPS; i++) {
                    const val = getValues(`step-${i}`);
                    if (typeof val === 'string' && val.trim() !== '') {
                        newSteps.push(val.trim());
                    }
                }
                if (newSteps.length === 1) {
                    const parsedItems = parseStepsText(
                        newSteps[0],
                        RECIPE_MAX_STEPS
                    );
                    if (parsedItems.length > 1) {
                        newSteps = parsedItems;
                        setSteps(parsedItems);
                        toast.success(
                            `${parsedItems.length} ${t('steps_applied')}`
                        );
                    } else {
                        setCustomValue('steps', newSteps);
                    }
                } else {
                    setCustomValue('steps', newSteps);
                }
            }
        }
        setStep((value) => value + 1);
        mutateDraft?.();
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
                minutes: 10,
                prepTime: undefined,
                cookTime: undefined,
                coCooksIds: [],
                linkedRecipeIds: [],
                youtubeUrl: '',
                questId: '',
            });
            setStep(STEPS.CATEGORY);
            setNumIngredients(1);
            setNumSteps(1);
            setKnownUsers({});
            setKnownRecipes({});
            setKnownQuests({});
            recipeModal.onClose?.();
            refresh?.();
        } catch (error) {
            console.error('Failed to save recipe', error);
            toast.error(t('something_went_wrong') ?? 'Something went wrong');
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
