'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
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
import { parseTextToList } from '@/app/utils/textParser';

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

    const setCustomValue = useCallback(
        (id: string, value: any) => {
            setValue(id, value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        },
        [setValue]
    );

    const addIngredientInput = useCallback(() => {
        if (numIngredients >= RECIPE_MAX_INGREDIENTS) {
            toast.error(
                t('max_ingredients_reached') ||
                    `Maximum of ${RECIPE_MAX_INGREDIENTS} ingredients allowed`
            );
            return;
        }
        setNumIngredients((value) => value + 1);
    }, [numIngredients, t]);

    const removeIngredientInput = useCallback(
        (index: number) => {
            setNumIngredients((value) => value - 1);
            setCustomValue(`ingredient-${index}`, '');
        },
        [setCustomValue]
    );

    const setIngredients = useCallback(
        (ingredients: string[]) => {
            const maxCount = Math.max(numIngredients, ingredients.length);
            for (let i = 0; i < maxCount; i++) {
                setCustomValue(`ingredient-${i}`, '');
            }
            setNumIngredients(ingredients.length);
            ingredients.forEach((ingredient, index) => {
                setCustomValue(`ingredient-${index}`, ingredient);
            });
            setCustomValue('ingredients', ingredients);
        },
        [numIngredients, setCustomValue]
    );

    const addStepInput = useCallback(() => {
        if (numSteps >= RECIPE_MAX_STEPS) {
            toast.error(
                t('max_steps_reached') ||
                    `Maximum of ${RECIPE_MAX_STEPS} steps allowed`
            );
            return;
        }
        setNumSteps((value) => value + 1);
    }, [numSteps, t]);

    const removeStepInput = useCallback(
        (index: number) => {
            setNumSteps((value) => value - 1);
            setCustomValue(`step-${index}`, '');
        },
        [setCustomValue]
    );

    const setSteps = useCallback(
        (steps: string[]) => {
            const maxCount = Math.max(numSteps, steps.length);
            for (let i = 0; i < maxCount; i++) {
                setCustomValue(`step-${i}`, '');
            }
            setNumSteps(steps.length);
            steps.forEach((step, index) => {
                setCustomValue(`step-${index}`, step);
            });
            setCustomValue('steps', steps);
        },
        [numSteps, setCustomValue]
    );

    const lastSyncedDraftStrRef = useRef<string>('');
    const hasInitialSyncedRef = useRef<boolean>(false);

    const lockTargetId = recipeModal.isEditMode
        ? recipeModal.editRecipeData?.id
        : watch('draftId') || draftData?.draftId || recipeModal.activeDraftId;

    const lock = useRecipeLock(lockTargetId, currentUser?.id);
    const isCurrentStepLocked = Boolean(lock?.isLockedByOther(`step:${step}`));

    // Smart non-destructive live synchronization from draftData without overwriting active step inputs
    useEffect(() => {
        if (!draftData || recipeModal.isEditMode) return;

        const serialized = JSON.stringify(draftData);
        if (serialized === lastSyncedDraftStrRef.current) return;
        lastSyncedDraftStrRef.current = serialized;

        const isInitialSync = !hasInitialSyncedRef.current;
        hasInitialSyncedRef.current = true;

        const isStepLockedByOther = (stepIndex: number) =>
            Boolean(lock?.isLockedByOther(`step:${stepIndex}`));

        // Step 0: Category
        if (
            (isInitialSync ||
                step !== STEPS.CATEGORY ||
                isStepLockedByOther(STEPS.CATEGORY)) &&
            Array.isArray(draftData.categories) &&
            JSON.stringify(getValues('categories')) !==
                JSON.stringify(draftData.categories)
        ) {
            setCustomValue('categories', draftData.categories);
        }

        // Step 1: Ingredients
        if (
            isInitialSync ||
            step !== STEPS.INGREDIENTS ||
            isStepLockedByOther(STEPS.INGREDIENTS)
        ) {
            if (Array.isArray(draftData.ingredients)) {
                const incoming = draftData.ingredients;
                if (
                    incoming.length > 0 &&
                    JSON.stringify(getValues('ingredients')) !==
                        JSON.stringify(incoming)
                ) {
                    setNumIngredients(incoming.length);
                    incoming.forEach((item: string, idx: number) => {
                        setCustomValue(`ingredient-${idx}`, item);
                    });
                    setCustomValue('ingredients', incoming);
                }
            }
        }

        // Step 2: Steps
        if (
            isInitialSync ||
            step !== STEPS.STEPS ||
            isStepLockedByOther(STEPS.STEPS)
        ) {
            if (Array.isArray(draftData.steps)) {
                const incoming = draftData.steps;
                if (
                    incoming.length > 0 &&
                    JSON.stringify(getValues('steps')) !==
                        JSON.stringify(incoming)
                ) {
                    setNumSteps(incoming.length);
                    incoming.forEach((item: string, idx: number) => {
                        setCustomValue(`step-${idx}`, item);
                    });
                    setCustomValue('steps', incoming);
                }
            }
        }

        // Step 3: Description & Times
        if (
            isInitialSync ||
            step !== STEPS.DESCRIPTION ||
            isStepLockedByOther(STEPS.DESCRIPTION)
        ) {
            if (
                draftData.title !== undefined &&
                getValues('title') !== draftData.title
            ) {
                setCustomValue('title', draftData.title);
            }
            if (
                draftData.description !== undefined &&
                getValues('description') !== draftData.description
            ) {
                setCustomValue('description', draftData.description);
            }
            if (
                draftData.minutes !== undefined &&
                getValues('minutes') !== draftData.minutes
            ) {
                setCustomValue('minutes', draftData.minutes);
            }
            if (
                draftData.prepTime !== undefined &&
                getValues('prepTime') !== draftData.prepTime
            ) {
                setCustomValue('prepTime', draftData.prepTime);
            }
            if (
                draftData.cookTime !== undefined &&
                getValues('cookTime') !== draftData.cookTime
            ) {
                setCustomValue('cookTime', draftData.cookTime);
            }
        }

        // Step 4: Methods
        if (
            isInitialSync ||
            step !== STEPS.METHODS ||
            isStepLockedByOther(STEPS.METHODS)
        ) {
            if (
                draftData.method !== undefined &&
                getValues('method') !== draftData.method
            ) {
                setCustomValue('method', draftData.method);
            }
        }

        // Step 5: Related Content
        if (
            isInitialSync ||
            step !== STEPS.RELATED_CONTENT ||
            isStepLockedByOther(STEPS.RELATED_CONTENT)
        ) {
            if (
                Array.isArray(draftData.coCooksIds) &&
                JSON.stringify(getValues('coCooksIds')) !==
                    JSON.stringify(draftData.coCooksIds)
            ) {
                setCustomValue('coCooksIds', draftData.coCooksIds);
            }
            if (
                Array.isArray(draftData.linkedRecipeIds) &&
                JSON.stringify(getValues('linkedRecipeIds')) !==
                    JSON.stringify(draftData.linkedRecipeIds)
            ) {
                setCustomValue('linkedRecipeIds', draftData.linkedRecipeIds);
            }
            if (
                draftData.youtubeUrl !== undefined &&
                getValues('youtubeUrl') !== draftData.youtubeUrl
            ) {
                setCustomValue('youtubeUrl', draftData.youtubeUrl);
            }
            if (
                draftData.questId !== undefined &&
                getValues('questId') !== draftData.questId
            ) {
                setCustomValue('questId', draftData.questId);
            }
        }

        // Step 6: Images
        if (
            isInitialSync ||
            step !== STEPS.IMAGES ||
            isStepLockedByOther(STEPS.IMAGES)
        ) {
            if (
                draftData.imageSrc !== undefined &&
                getValues('imageSrc') !== draftData.imageSrc
            ) {
                setCustomValue('imageSrc', draftData.imageSrc);
            }
            if (
                draftData.imageSrc1 !== undefined &&
                getValues('imageSrc1') !== draftData.imageSrc1
            ) {
                setCustomValue('imageSrc1', draftData.imageSrc1);
            }
            if (
                draftData.imageSrc2 !== undefined &&
                getValues('imageSrc2') !== draftData.imageSrc2
            ) {
                setCustomValue('imageSrc2', draftData.imageSrc2);
            }
            if (
                draftData.imageSrc3 !== undefined &&
                getValues('imageSrc3') !== draftData.imageSrc3
            ) {
                setCustomValue('imageSrc3', draftData.imageSrc3);
            }
        }

        if (draftData.draftId && getValues('draftId') !== draftData.draftId) {
            setCustomValue('draftId', draftData.draftId);
        }
        if (
            draftData.inviteToken &&
            getValues('inviteToken') !== draftData.inviteToken
        ) {
            setCustomValue('inviteToken', draftData.inviteToken);
        }
    }, [
        draftData,
        step,
        recipeModal.isEditMode,
        setCustomValue,
        getValues,
        lock,
    ]);

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

        if (step !== STEPS.INGREDIENTS && newIngredients.length === 0) {
            const existing =
                getValues('ingredients') || draftData?.ingredients || [];
            if (existing.length > 0) {
                newIngredients = existing;
            }
        }

        if (step !== STEPS.STEPS && newSteps.length === 0) {
            const existing = getValues('steps') || draftData?.steps || [];
            if (existing.length > 0) {
                newSteps = existing;
            }
        }

        const fullDraftData = {
            draftId: currentDraftId,
            inviteToken: currentToken,
            currentStep: step,
            categories: getValues('categories'),
            method: getValues('method'),
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
            coCooksIds: getValues('coCooksIds'),
            linkedRecipeIds: getValues('linkedRecipeIds'),
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

        if (step !== STEPS.INGREDIENTS && newIngredients.length === 0) {
            const existing =
                getValues('ingredients') || draftData?.ingredients || [];
            if (existing.length > 0) {
                newIngredients = existing;
            }
        }

        if (step !== STEPS.STEPS && newSteps.length === 0) {
            const existing = getValues('steps') || draftData?.steps || [];
            if (existing.length > 0) {
                newSteps = existing;
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
                } else if (!isCurrentStepLocked) {
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
                } else if (!isCurrentStepLocked) {
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
            refresh();
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
