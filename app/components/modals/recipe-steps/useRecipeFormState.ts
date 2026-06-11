'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import { axiosFetcher } from '@/app/utils/fetcher';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
    STEPS,
    STEPS_LENGTH,
} from '@/app/utils/constants';
import { parseTextToList } from '@/app/utils/textParser';

interface UseRecipeFormStateProps {
    recipeModal: any;
    currentUser?: SafeUser | null;
}

export function useRecipeFormState({
    recipeModal,
    currentUser,
}: UseRecipeFormStateProps) {
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const [step, setStep] = useState(STEPS.CATEGORY);
    const [numIngredients, setNumIngredients] = useState(1);
    const [numSteps, setNumSteps] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const hasLoadedDraft = useRef(false);
    const hasLoadedEditData = useRef(false);
    const currentUserRef = useRef<SafeUser | null>(null);
    currentUserRef.current = currentUser || null;
    const prevQuestDataRef = useRef<any>(null);
    const prevCoCooksDataRef = useRef<any>(null);
    const prevLinkedRecipesDataRef = useRef<any>(null);
    const prevDraftDataRef = useRef<any>(null);
    const hasLoadedDraftReset = useRef(false);
    const [selectedCoCooks, setSelectedCoCooks] = useState<any[]>([]);
    const [selectedLinkedRecipes, setSelectedLinkedRecipes] = useState<any[]>(
        []
    );
    const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
    const [ingredientsInputMode, setIngredientsInputMode] = useState<
        'list' | 'text'
    >('list');
    const [stepsInputMode, setStepsInputMode] = useState<'list' | 'text'>(
        'list'
    );

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { errors },
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
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
            coCooksIds: [],
            linkedRecipeIds: [],
            youtubeUrl: '',
            questId: '',
        },
    });

    const categories = watch('categories');
    const minutes = watch('minutes');
    const imageSrc = watch('imageSrc');
    const method = watch('method');

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    const addCoCook = (user: any) => {
        if (selectedCoCooks.length >= 4) {
            toast.error(
                t('max_cooks_reached') || 'Maximum of 4 co-cooks allowed'
            );
            return;
        }
        if (selectedCoCooks.some((cook) => cook.id === user.id)) {
            toast.error(
                t('cook_already_added') || 'This cook is already added'
            );
            return;
        }
        const newSelectedCoCooks = [...selectedCoCooks, user];
        setSelectedCoCooks(newSelectedCoCooks);
        setValue(
            'coCooksIds',
            newSelectedCoCooks.map((cook) => cook.id)
        );
    };

    const removeCoCook = (userId: string) => {
        const updatedCooks = selectedCoCooks.filter(
            (cook) => cook.id !== userId
        );
        setSelectedCoCooks(updatedCooks);
        setValue(
            'coCooksIds',
            updatedCooks.map((cook) => cook.id)
        );
    };

    const addLinkedRecipe = (recipe: any) => {
        if (selectedLinkedRecipes.length >= 2) {
            toast.error(
                t('max_recipes_reached') ||
                    'Maximum of 2 linked recipes allowed'
            );
            return;
        }
        if (selectedLinkedRecipes.some((r) => r.id === recipe.id)) {
            toast.error(
                t('recipe_already_added') || 'This recipe is already added'
            );
            return;
        }
        const newLinkedRecipes = [...selectedLinkedRecipes, recipe];
        setSelectedLinkedRecipes(newLinkedRecipes);
        setValue(
            'linkedRecipeIds',
            newLinkedRecipes.map((r) => r.id)
        );
    };

    const removeLinkedRecipe = (recipeId: string) => {
        const updatedRecipes = selectedLinkedRecipes.filter(
            (recipe) => recipe.id !== recipeId
        );
        setSelectedLinkedRecipes(updatedRecipes);
        setValue(
            'linkedRecipeIds',
            updatedRecipes.map((recipe) => recipe.id)
        );
    };

    const selectQuest = (quest: any) => {
        setSelectedQuest(quest);
        setValue('questId', quest.id);
    };

    const removeQuest = () => {
        setSelectedQuest(null);
        setValue('questId', '');
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

        const data = {
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
            coCooksIds: watch('coCooksIds'),
            linkedRecipeIds: watch('linkedRecipeIds'),
            youtubeUrl: watch('youtubeUrl'),
            questId: watch('questId'),
        };

        try {
            await axios.post(`${window.location.origin}/api/draft`, data);
            toast.success(t('draft_saved') ?? 'Draft saved!');
        } catch (error) {
            console.error(error);
            toast.error(t('error_saving_draft') ?? 'Failed to save draft.');
        }
    };

    const deleteDraft = async () => {
        try {
            await axios.delete(`${window.location.origin}/api/draft`);
        } catch (error) {
            console.error(error);
            toast.error(t('error_deleting_draft') ?? 'Failed to delete draft.');
        }
    };

    const questId = watch('questId');
    const coCooksIds = watch('coCooksIds') || [];
    const linkedRecipeIds = watch('linkedRecipeIds') || [];

    const { data: questData } = useSWR(
        recipeModal.isOpen && questId ? `/api/quest/${questId}` : null,
        axiosFetcher
    );

    const { data: coCooksData } = useSWR(
        recipeModal.isOpen && coCooksIds.length > 0
            ? `/api/users/multiple?ids=${coCooksIds.join(',')}`
            : null,
        axiosFetcher
    );

    const { data: linkedRecipesData } = useSWR(
        recipeModal.isOpen && linkedRecipeIds.length > 0
            ? `/api/recipes/multiple?ids=${linkedRecipeIds.join(',')}`
            : null,
        axiosFetcher
    );

    const { data: draftData, isLoading: isDraftLoading } = useSWR(
        recipeModal.isOpen && !recipeModal.isEditMode && currentUserRef.current
            ? `/api/draft`
            : null,
        axiosFetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            shouldRetryOnError: false,
        }
    );

    const isLoadingDraft = isDraftLoading;

    if (questData && questData !== prevQuestDataRef.current) {
        prevQuestDataRef.current = questData;
        setSelectedQuest(questData);
    }

    if (coCooksData && coCooksData !== prevCoCooksDataRef.current) {
        prevCoCooksDataRef.current = coCooksData;
        setSelectedCoCooks(coCooksData);
    }

    if (
        linkedRecipesData &&
        linkedRecipesData !== prevLinkedRecipesDataRef.current
    ) {
        prevLinkedRecipesDataRef.current = linkedRecipesData;
        setSelectedLinkedRecipes(linkedRecipesData);
    }

    if (
        draftData &&
        draftData !== prevDraftDataRef.current &&
        !recipeModal.isEditMode &&
        !hasLoadedDraft.current
    ) {
        prevDraftDataRef.current = draftData;
        hasLoadedDraft.current = true;
        const { currentStep } = draftData;
        if (currentStep !== undefined) {
            setStep(Math.max(0, Math.min(currentStep, STEPS_LENGTH - 1)));
        }
        setNumIngredients(draftData.ingredients?.length || 1);
        setNumSteps(draftData.steps?.length || 1);
    }

    useEffect(() => {
        if (draftData && !recipeModal.isEditMode && hasLoadedDraft.current) {
            if (!hasLoadedDraftReset.current) {
                hasLoadedDraftReset.current = true;
                const { currentStep: _, ...formData } = draftData;
                reset(formData);
                const ingredients = formData.ingredients || [];
                ingredients.forEach((ingredient: string, index: number) => {
                    setValue(`ingredient-${index}`, ingredient);
                });
                const steps = formData.steps || [];
                steps.forEach((step: string, index: number) => {
                    setValue(`step-${index}`, step);
                });
            }
        }
    }, [draftData, recipeModal.isEditMode, reset, setValue]);

    const prevIsOpenRef = useRef(recipeModal.isOpen);
    const prevIsEditModeRef = useRef(recipeModal.isEditMode);
    const prevEditRecipeDataIdRef = useRef(recipeModal.editRecipeData?.id);

    if (
        recipeModal.isOpen !== prevIsOpenRef.current ||
        recipeModal.isEditMode !== prevIsEditModeRef.current ||
        recipeModal.editRecipeData?.id !== prevEditRecipeDataIdRef.current
    ) {
        prevIsOpenRef.current = recipeModal.isOpen;
        prevIsEditModeRef.current = recipeModal.isEditMode;
        prevEditRecipeDataIdRef.current = recipeModal.editRecipeData?.id;

        if (!recipeModal.isOpen) {
            setStep(STEPS.CATEGORY);
            setNumIngredients(1);
            setNumSteps(1);
            setSelectedCoCooks([]);
            setSelectedLinkedRecipes([]);
            setSelectedQuest(null);
            setIngredientsInputMode('list');
            setStepsInputMode('list');
            hasLoadedDraft.current = false;
            hasLoadedEditData.current = false;
            hasLoadedDraftReset.current = false;
            prevQuestDataRef.current = null;
            prevCoCooksDataRef.current = null;
            prevLinkedRecipesDataRef.current = null;
            prevDraftDataRef.current = null;
        } else {
            if (recipeModal.isEditMode && recipeModal.editRecipeData) {
                const editData = recipeModal.editRecipeData;
                setStep(STEPS.CATEGORY);
                setNumIngredients(editData.ingredients?.length || 1);
                setNumSteps(editData.steps?.length || 1);
                if (editData.coCooks) {
                    setSelectedCoCooks(editData.coCooks);
                }
                if (editData.linkedRecipes) {
                    setSelectedLinkedRecipes(editData.linkedRecipes);
                }
                hasLoadedEditData.current = false;
            }
        }
    }

    useEffect(() => {
        if (!recipeModal.isOpen) {
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
                coCooksIds: [],
                linkedRecipeIds: [],
                youtubeUrl: '',
                questId: '',
            });
        } else {
            if (recipeModal.questId) {
                setValue('questId', recipeModal.questId);
            }
            if (
                recipeModal.isEditMode &&
                recipeModal.editRecipeData &&
                !hasLoadedEditData.current
            ) {
                hasLoadedEditData.current = true;
                const editData = recipeModal.editRecipeData;
                reset({
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
                    coCooksIds: editData.coCooksIds || [],
                    linkedRecipeIds: editData.linkedRecipeIds || [],
                    youtubeUrl: editData.youtubeUrl || '',
                    questId: editData.questId || '',
                });

                editData.ingredients.forEach(
                    (ingredient: string, index: number) => {
                        setValue(`ingredient-${index}`, ingredient);
                    }
                );
                editData.steps.forEach((step: string, index: number) => {
                    setValue(`step-${index}`, step);
                });
            }
        }
    }, [
        recipeModal.isOpen,
        recipeModal.isEditMode,
        recipeModal.editRecipeData,
        recipeModal.questId,
        reset,
        setValue,
    ]);

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
                coCooksIds: [],
                linkedRecipeIds: [],
                youtubeUrl: '',
                questId: '',
            });
            setStep(STEPS.CATEGORY);
            setNumIngredients(1);
            setNumSteps(1);
            setSelectedCoCooks([]);
            setSelectedLinkedRecipes([]);
            setSelectedQuest(null);
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
        imageSrc,
        method,
        addCoCook,
        removeCoCook,
        addLinkedRecipe,
        removeLinkedRecipe,
        selectQuest,
        removeQuest,
        saveDraft,
        addIngredientInput,
        removeIngredientInput,
        setIngredients,
        addStepInput,
        removeStepInput,
        setSteps,
        actionLabel,
        secondaryActionLabel,
        isLoadingDraft,
        onBack,
        onSubmit,
        setCustomValue,
    };
}
