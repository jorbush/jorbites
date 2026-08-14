'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
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
import { parseTextToList } from '@/app/utils/textParser';

import { useRecipeLock } from '@/app/hooks/useRecipeLock';

interface UseRecipeFormStateProps {
    recipeModal: any;
    currentUser?: SafeUser | null;
    draftData?: any;
}

export function useRecipeFormState({
    recipeModal,
    currentUser,
    draftData,
}: UseRecipeFormStateProps) {
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
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
    const [isLoading, setIsLoading] = useState(false);
    const currentUserRef = useRef<SafeUser | null>(currentUser || null);
    useEffect(() => {
        currentUserRef.current = currentUser || null;
    }, [currentUser]);
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
        if (recipeModal.isEditMode && recipeModal.editRecipeData) {
            const editData = recipeModal.editRecipeData;
            const ingredientsObject: Record<string, string> = {};
            editData.ingredients.forEach(
                (ingredient: string, index: number) => {
                    ingredientsObject[`ingredient-${index}`] = ingredient;
                }
            );
            const stepsObject: Record<string, string> = {};
            editData.steps.forEach((step: string, index: number) => {
                stepsObject[`step-${index}`] = step;
            });
            return {
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
                ingredients: editData.ingredients,
                steps: editData.steps,
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
            const ingredients = draftData.ingredients || [];
            const ingredientsObject: Record<string, string> = {};
            ingredients.forEach((ingredient: string, index: number) => {
                ingredientsObject[`ingredient-${index}`] = ingredient;
            });
            const steps = draftData.steps || [];
            const stepsObject: Record<string, string> = {};
            steps.forEach((step: string, index: number) => {
                stepsObject[`step-${index}`] = step;
            });
            return {
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
                ingredients: draftData.ingredients || [],
                steps: draftData.steps || [],
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
        formState: { errors },
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

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

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
        setValue('coCooksIds', [...coCooksIds, user.id]);
    };

    const removeCoCook = (userId: string) => {
        setValue(
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
        setValue('linkedRecipeIds', [...linkedRecipeIds, recipe.id]);
    };

    const removeLinkedRecipe = (recipeId: string) => {
        setValue(
            'linkedRecipeIds',
            linkedRecipeIds.filter((id: string) => id !== recipeId)
        );
    };

    const selectQuest = (quest: SafeQuest) => {
        if (quest?.id) {
            setKnownQuests((prev) => ({ ...prev, [quest.id]: quest }));
        }
        setValue('questId', quest?.id || '');
    };

    const removeQuest = () => {
        setValue('questId', '');
    };

    const lockTargetId = recipeModal.isEditMode
        ? recipeModal.editRecipeData?.id
        : watch('draftId') || draftData?.draftId;

    const lock = useRecipeLock(lockTargetId, currentUser?.id);

    useEffect(() => {
        if (lockTargetId && currentUser?.id) {
            const stepKey = `step:${step}`;
            lock.acquire(stepKey);
            return () => {
                lock.release(stepKey);
            };
        }
    }, [step, lockTargetId, currentUser?.id, lock.acquire, lock.release]);

    const copyInviteLink = async () => {
        let currentDraftId = getValues('draftId') || draftData?.draftId;
        let currentToken = getValues('inviteToken') || draftData?.inviteToken;

        if (!currentDraftId || !currentToken) {
            try {
                const formData = {
                    currentStep: step,
                    categories: getValues('categories'),
                    method: getValues('method'),
                    imageSrc: getValues('imageSrc'),
                    imageSrc1: getValues('imageSrc1'),
                    imageSrc2: getValues('imageSrc2'),
                    imageSrc3: getValues('imageSrc3'),
                    title: getValues('title'),
                    description: getValues('description'),
                    minutes: getValues('minutes'),
                    coCooksIds: getValues('coCooksIds'),
                    linkedRecipeIds: getValues('linkedRecipeIds'),
                };
                const res = await axios.post('/api/draft/invite', formData);
                currentDraftId = res.data.draftId;
                currentToken = res.data.inviteToken;
                setValue('draftId', currentDraftId);
                setValue('inviteToken', currentToken);
                mutate('/api/draft', res.data.draft, false);
            } catch {
                toast.error(
                    t('error_generating_link') ||
                        'Failed to generate invite link'
                );
                return;
            }
        }

        const shareUrl = `${window.location.origin}/api/draft/join?draft=${currentDraftId}&token=${currentToken}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success(
                t('co_cook_link_copied') ||
                    'Co-cook invite link copied to clipboard! 🔗'
            );
        } catch {
            toast.error('Could not copy link to clipboard');
        }
    };

    const saveDraft = async (stepOverride?: number | React.MouseEvent) => {
        const stepToSave =
            typeof stepOverride === 'number' ? stepOverride : step;
        let newIngredients: string[] = [];
        if (ingredientsInputMode === 'text') {
            const textareaValue = getValues('ingredients-plain-text');
            const parsedItems = parseTextToList(
                textareaValue,
                RECIPE_MAX_INGREDIENTS
            );
            if (parsedItems.length > 0) {
                newIngredients = parsedItems;
            }
        } else {
            for (let i = 0; i < numIngredients; i++) {
                const val = getValues(`ingredient-${i}`);
                if (typeof val === 'string' && val.trim() !== '') {
                    newIngredients.push(val);
                }
            }
        }

        let newSteps: string[] = [];
        if (stepsInputMode === 'text') {
            const textareaValue = getValues('steps-plain-text');
            const parsedItems = parseTextToList(
                textareaValue,
                RECIPE_MAX_STEPS
            );
            if (parsedItems.length > 0) {
                newSteps = parsedItems;
            }
        } else {
            for (let i = 0; i < numSteps; i++) {
                const val = getValues(`step-${i}`);
                if (typeof val === 'string' && val.trim() !== '') {
                    newSteps.push(val);
                }
            }
        }

        const currentDraftId = watch('draftId') || draftData?.draftId;
        const currentInviteToken =
            watch('inviteToken') || draftData?.inviteToken;

        const data = {
            draftId: currentDraftId,
            inviteToken: currentInviteToken,
            currentStep: stepToSave,
            categories: watch('categories'),
            method: watch('method'),
            imageSrc: watch('imageSrc'),
            imageSrc1: watch('imageSrc1'),
            imageSrc2: watch('imageSrc2'),
            imageSrc3: watch('imageSrc3'),
            title: watch('title'),
            description: watch('description'),
            ingredients: newIngredients,
            steps: newSteps,
            minutes: watch('minutes'),
            prepTime: watch('prepTime'),
            cookTime: watch('cookTime'),
            coCooksIds: watch('coCooksIds'),
            linkedRecipeIds: watch('linkedRecipeIds'),
            youtubeUrl: watch('youtubeUrl'),
            questId: watch('questId'),
        };

        try {
            const res = await axios.post(
                `${window.location.origin}/api/draft`,
                data
            );
            if (res.data?.draftId && !currentDraftId) {
                setValue('draftId', res.data.draftId);
            }
            mutate('/api/draft', res.data || data, false);
            toast.success(t('draft_saved') ?? 'Draft saved!');
        } catch (error) {
            console.error(error);
            toast.error(t('error_saving_draft') ?? 'Failed to save draft.');
        }
    };

    const deleteDraft = async () => {
        try {
            const currentDraftId = watch('draftId') || draftData?.draftId;
            const url = currentDraftId
                ? `${window.location.origin}/api/draft?draftId=${currentDraftId}`
                : `${window.location.origin}/api/draft`;
            await axios.delete(url);
            mutate('/api/draft', null, false);
        } catch (error) {
            console.error(error);
            toast.error(t('error_deleting_draft') ?? 'Failed to delete draft.');
        }
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

    const selectedQuest = useMemo<SafeQuest | null>(() => {
        return questId ? (knownQuests[questId] ?? null) : null;
    }, [questId, knownQuests]);

    const selectedCoCooks = useMemo<SafeUser[]>(() => {
        return coCooksIds
            .map((id: string) => knownUsers[id])
            .filter((user: SafeUser | undefined): user is SafeUser =>
                Boolean(user)
            );
    }, [coCooksIds, knownUsers]);

    const selectedLinkedRecipes = useMemo<SafeRecipe[]>(() => {
        return linkedRecipeIds
            .map((id: string) => knownRecipes[id])
            .filter((recipe: SafeRecipe | undefined): recipe is SafeRecipe =>
                Boolean(recipe)
            );
    }, [linkedRecipeIds, knownRecipes]);

    const onBack = () => {
        setStep((value) => Math.max(value - 1, 0));
    };

    const onNext = () => {
        if (step >= STEPS_LENGTH - 1) {
            return false;
        }

        if (step === STEPS.INGREDIENTS) {
            if (ingredientsInputMode === 'text') {
                const textareaValue = getValues('ingredients-plain-text');
                const parsedItems = parseTextToList(
                    textareaValue,
                    RECIPE_MAX_INGREDIENTS
                );
                if (parsedItems.length > 0) {
                    setIngredients(parsedItems);
                    setIngredientsInputMode('list');
                    toast.success(
                        `${parsedItems.length} ${t('ingredients_applied')}`
                    );
                } else {
                    toast.error(
                        t('no_ingredients_found') || 'No ingredients found'
                    );
                    return false;
                }
            } else {
                const newIngredients: string[] = [];
                for (let i = 0; i < numIngredients; i++) {
                    const val = getValues(`ingredient-${i}`);
                    if (typeof val === 'string' && val.trim() !== '') {
                        newIngredients.push(val);
                    }
                }
                setCustomValue('ingredients', newIngredients);
            }
        }
        if (step === STEPS.STEPS) {
            if (stepsInputMode === 'text') {
                const textareaValue = getValues('steps-plain-text');
                const parsedItems = parseTextToList(
                    textareaValue,
                    RECIPE_MAX_STEPS
                );
                if (parsedItems.length > 0) {
                    setSteps(parsedItems);
                    setStepsInputMode('list');
                    toast.success(
                        `${parsedItems.length} ${t('steps_applied')}`
                    );
                } else {
                    toast.error(t('no_steps_found') || 'No steps found');
                    return false;
                }
            } else {
                const newSteps: string[] = [];
                for (let i = 0; i < numSteps; i++) {
                    const val = getValues(`step-${i}`);
                    if (typeof val === 'string' && val.trim() !== '') {
                        newSteps.push(val);
                    }
                }
                setCustomValue('steps', newSteps);
            }
        }
        setStep((value) => value + 1);
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
            recipeModal.onClose();
            refresh();
        } catch (error) {
            console.error('Failed to save recipe', error);
            toast.error(t('something_went_wrong') ?? 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const addIngredientInput = () => {
        if (numIngredients >= RECIPE_MAX_INGREDIENTS) {
            toast.error(
                t('max_ingredients_reached') ||
                    `Maximum of ${RECIPE_MAX_INGREDIENTS} ingredients allowed`
            );
            return;
        }
        setNumIngredients((value) => value + 1);
    };

    const removeIngredientInput = (index: number) => {
        setNumIngredients((value) => value - 1);
        setCustomValue(`ingredient-${index}`, '');
    };

    const setIngredients = (ingredients: string[]) => {
        const maxCount = Math.max(numIngredients, ingredients.length);
        for (let i = 0; i < maxCount; i++) {
            setCustomValue(`ingredient-${i}`, '');
        }
        setNumIngredients(ingredients.length);
        ingredients.forEach((ingredient, index) => {
            setCustomValue(`ingredient-${index}`, ingredient);
        });
        setCustomValue('ingredients', ingredients);
    };

    const addStepInput = () => {
        if (numSteps >= RECIPE_MAX_STEPS) {
            toast.error(
                t('max_steps_reached') ||
                    `Maximum of ${RECIPE_MAX_STEPS} steps allowed`
            );
            return;
        }
        setNumSteps((value) => value + 1);
    };

    const removeStepInput = (index: number) => {
        setNumSteps((value) => value - 1);
        setCustomValue(`step-${index}`, '');
    };

    const setSteps = (steps: string[]) => {
        const maxCount = Math.max(numSteps, steps.length);
        for (let i = 0; i < maxCount; i++) {
            setCustomValue(`step-${i}`, '');
        }
        setNumSteps(steps.length);
        steps.forEach((step, index) => {
            setCustomValue(`step-${index}`, step);
        });
        setCustomValue('steps', steps);
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
        numIngredients,
        numSteps,
        isLoading,
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
        copyInviteLink,
        lock,
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
    };
}
