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
import {
    parseTextToList,
    parseIngredientsText,
    parseStepsText,
} from '@/app/utils/textParser';

import { useRecipeLock } from '@/app/hooks/useRecipeLock';

interface UseRecipeFormStateProps {
    recipeModal: any;
    currentUser?: SafeUser | null;
    draftData?: any;
    mutateDraft?: () => Promise<any>;
}

export function useRecipeFormState({
    recipeModal,
    currentUser,
    draftData,
    mutateDraft,
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

    const updateFormField = useCallback(
        (id: string, value: any) => {
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
            const maxCount = Math.max(
                effectiveNumIngredients,
                ingredients.length
            );
            for (let i = 0; i < maxCount; i++) {
                updateFormField(`ingredient-${i}`, '');
            }
            setNumIngredients(ingredients.length);
            ingredients.forEach((ingredient, index) => {
                updateFormField(`ingredient-${index}`, ingredient);
            });
            updateFormField('ingredients', ingredients);
        },
        [effectiveNumIngredients, updateFormField]
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
            const maxCount = Math.max(effectiveNumSteps, steps.length);
            for (let i = 0; i < maxCount; i++) {
                updateFormField(`step-${i}`, '');
            }
            setNumSteps(steps.length);
            steps.forEach((step, index) => {
                updateFormField(`step-${index}`, step);
            });
            updateFormField('steps', steps);
        },
        [effectiveNumSteps, updateFormField]
    );

    const [prevSyncedDraftStr, setPrevSyncedDraftStr] = useState<string>(() =>
        draftData ? JSON.stringify(draftData) : ''
    );
    const [prevStep, setPrevStep] = useState<number>(step);

    const lockTargetId = recipeModal.isEditMode
        ? recipeModal.editRecipeData?.id
        : watch('draftId') || draftData?.draftId || recipeModal.activeDraftId;

    const lock = useRecipeLock(lockTargetId, currentUser?.id);
    const isCurrentStepLocked = Boolean(lock?.isLockedByOther(`step:${step}`));

    // Smart non-destructive live synchronization from draftData without overwriting active step inputs
    const stepChanged = prevStep !== step;
    if (stepChanged) {
        setPrevStep(step);
    }

    const serialized = draftData ? JSON.stringify(draftData) : '';
    const draftChanged = serialized !== prevSyncedDraftStr;
    if (draftChanged) {
        setPrevSyncedDraftStr(serialized);
    }

    if (!recipeModal.isEditMode && draftData && (draftChanged || stepChanged)) {
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
        if (Array.isArray(draftData.steps) && draftData.steps.length > 0) {
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

        if (draftData.draftId && getValues('draftId') !== draftData.draftId) {
            setValue('draftId', draftData.draftId);
        }
        if (
            draftData.inviteToken &&
            getValues('inviteToken') !== draftData.inviteToken
        ) {
            setValue('inviteToken', draftData.inviteToken);
        }
    }

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
            for (let i = 0; i < effectiveNumIngredients; i++) {
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
            for (let i = 0; i < effectiveNumSteps; i++) {
                const val = getValues(`step-${i}`);
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
                const existing = getValues('ingredients') || [];
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
                const existing = getValues('steps') || [];
                if (existing.length > 0) {
                    newSteps = existing;
                }
            }
        }

        const fullDraftData = {
            draftId: currentDraftId,
            inviteToken: currentToken,
            currentStep: step,
            categories: getValues('categories') || draftData?.categories,
            method:
                step === STEPS.METHODS
                    ? getValues('method')
                    : draftData?.method || getValues('method'),
            imageSrc: getValues('imageSrc'),
            imageSrc1: getValues('imageSrc1'),
            imageSrc2: getValues('imageSrc2'),
            imageSrc3: getValues('imageSrc3'),
            title: getValues('title'),
            description: getValues('description'),
            ingredients: newIngredients,
            steps: newSteps,
            minutes: getValues('minutes'),
            prepTime: getValues('prepTime'),
            cookTime: getValues('cookTime'),
            coCooksIds:
                step === STEPS.RELATED_CONTENT
                    ? getValues('coCooksIds')
                    : draftData?.coCooksIds || getValues('coCooksIds'),
            linkedRecipeIds:
                step === STEPS.RELATED_CONTENT
                    ? getValues('linkedRecipeIds')
                    : draftData?.linkedRecipeIds ||
                      getValues('linkedRecipeIds'),
            youtubeUrl: getValues('youtubeUrl'),
            questId: getValues('questId'),
        };

        const prepareShareUrl = async (): Promise<string> => {
            if (!currentDraftId || !currentToken) {
                const res = await axios.post(
                    '/api/draft/invite',
                    fullDraftData
                );
                currentDraftId = res.data.draftId;
                currentToken = res.data.inviteToken;
                setValue('draftId', currentDraftId);
                setValue('inviteToken', currentToken);
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

    const saveDraft = async (stepOverride?: number | React.MouseEvent) => {
        const stepToSave =
            typeof stepOverride === 'number' ? stepOverride : step;
        let newIngredients: string[] = [];
        if (step === STEPS.INGREDIENTS) {
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
                for (let i = 0; i < effectiveNumIngredients; i++) {
                    const val = getValues(`ingredient-${i}`);
                    if (typeof val === 'string' && val.trim() !== '') {
                        newIngredients.push(val);
                    }
                }
            }
        } else {
            newIngredients =
                draftData?.ingredients && draftData.ingredients.length > 0
                    ? draftData.ingredients
                    : getValues('ingredients') || [];
        }

        let newSteps: string[] = [];
        if (step === STEPS.STEPS) {
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
                for (let i = 0; i < effectiveNumSteps; i++) {
                    const val = getValues(`step-${i}`);
                    if (typeof val === 'string' && val.trim() !== '') {
                        newSteps.push(val);
                    }
                }
            }
        } else {
            newSteps =
                draftData?.steps && draftData.steps.length > 0
                    ? draftData.steps
                    : getValues('steps') || [];
        }

        const currentDraftId = watch('draftId') || draftData?.draftId;
        const currentInviteToken =
            watch('inviteToken') || draftData?.inviteToken;

        const isShared = Boolean(currentDraftId);

        const data: any = {
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
            minutes: watch('minutes'),
            prepTime: watch('prepTime'),
            cookTime: watch('cookTime'),
            coCooksIds: watch('coCooksIds'),
            linkedRecipeIds: watch('linkedRecipeIds'),
            youtubeUrl: watch('youtubeUrl'),
            questId: watch('questId'),
        };

        // For shared drafts, only include ingredients/steps in the payload if actively on that step or if it's a single-user draft.
        // This guarantees that saving from earlier steps never overwrites remote real-time collaborator additions in Redis.
        if (step === STEPS.INGREDIENTS || !isShared) {
            data.ingredients = newIngredients;
        }
        if (step === STEPS.STEPS || !isShared) {
            data.steps = newSteps;
        }

        try {
            const res = await axios.post(
                `${window.location.origin}/api/draft`,
                data
            );
            if (res.data?.draftId) {
                if (!currentDraftId) {
                    setValue('draftId', res.data.draftId);
                }
                if (recipeModal.activeDraftId !== res.data.draftId) {
                    recipeModal.onOpenSharedDraft(res.data.draftId);
                }
            }
            if (res.data?.inviteToken && !currentInviteToken) {
                setValue('inviteToken', res.data.inviteToken);
            }
            if (res.data?.draftId) {
                mutateDraft?.();
            }
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

    const deleteDraft = async () => {
        const currentDraftId = watch('draftId') || draftData?.draftId;
        const url = currentDraftId
            ? `${window.location.origin}/api/draft?draftId=${currentDraftId}`
            : `${window.location.origin}/api/draft`;
        try {
            await axios.delete(url);
            setValue('draftId', '');
            setValue('inviteToken', '');
            mutateDraft?.();
        } catch (error) {
            console.error('Failed to delete draft', error);
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
                for (let i = 0; i < effectiveNumIngredients; i++) {
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
                for (let i = 0; i < effectiveNumSteps; i++) {
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
            recipeModal.onClose();
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
    };
}
