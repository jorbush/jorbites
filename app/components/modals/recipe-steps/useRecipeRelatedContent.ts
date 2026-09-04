'use client';

import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { SafeUser, SafeRecipe, SafeQuest } from '@/app/types';
import { axiosFetcher } from '@/app/utils/fetcher';
import { MAX_CO_COOKS, MAX_LINKED_RECIPES } from '@/app/utils/constants';
import { DraftData } from '@/app/types/draft';
import { RecipeModalStateLike } from './useRecipeFormState';

interface UseRecipeRelatedContentProps {
    recipeModal: RecipeModalStateLike;
    draftData?: Partial<DraftData> | null;
    coCooksIds: string[];
    linkedRecipeIds: string[];
    questId?: string | null;
    updateFormField: (name: string, value: unknown) => void;
    t: (key: string) => string;
}

export function useRecipeRelatedContent({
    recipeModal,
    draftData,
    coCooksIds,
    linkedRecipeIds,
    questId,
    updateFormField,
    t,
}: UseRecipeRelatedContentProps) {
    const [manuallyAddedUsers, setManuallyAddedUsers] = useState<
        Record<string, SafeUser>
    >({});
    const [manuallyAddedRecipes, setManuallyAddedRecipes] = useState<
        Record<string, SafeRecipe>
    >({});
    const [manuallySelectedQuest, setManuallySelectedQuest] =
        useState<SafeQuest | null>(null);

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

    const allKnownUsers = useMemo(() => {
        const map: Record<string, SafeUser> = {};
        const items = recipeModal.isEditMode
            ? recipeModal.editRecipeData?.coCooks
            : draftData?.coCooks;
        if (Array.isArray(items)) {
            items.forEach((user: SafeUser) => {
                if (user?.id) map[user.id] = user;
            });
        }
        if (Array.isArray(coCooksData)) {
            coCooksData.forEach((user: SafeUser) => {
                if (user?.id) map[user.id] = user;
            });
        }
        return { ...map, ...manuallyAddedUsers };
    }, [
        recipeModal.isEditMode,
        recipeModal.editRecipeData?.coCooks,
        draftData?.coCooks,
        coCooksData,
        manuallyAddedUsers,
    ]);

    const allKnownRecipes = useMemo(() => {
        const map: Record<string, SafeRecipe> = {};
        const items = recipeModal.isEditMode
            ? recipeModal.editRecipeData?.linkedRecipes
            : draftData?.linkedRecipes;
        if (Array.isArray(items)) {
            items.forEach((recipe: SafeRecipe) => {
                if (recipe?.id) map[recipe.id] = recipe;
            });
        }
        if (Array.isArray(linkedRecipesData)) {
            linkedRecipesData.forEach((recipe: SafeRecipe) => {
                if (recipe?.id) map[recipe.id] = recipe;
            });
        }
        return { ...map, ...manuallyAddedRecipes };
    }, [
        recipeModal.isEditMode,
        recipeModal.editRecipeData?.linkedRecipes,
        draftData?.linkedRecipes,
        linkedRecipesData,
        manuallyAddedRecipes,
    ]);

    const initialQuest = useMemo(() => {
        const questCandidate = recipeModal.isEditMode
            ? (recipeModal.editRecipeData as any)?.quest
            : (draftData as any)?.quest;
        return questCandidate && questCandidate.id
            ? (questCandidate as SafeQuest)
            : null;
    }, [recipeModal.isEditMode, recipeModal.editRecipeData, draftData]);

    const selectedQuest = useMemo<SafeQuest | null>(() => {
        if (!questId) return null;
        if (manuallySelectedQuest && manuallySelectedQuest.id === questId) {
            return manuallySelectedQuest;
        }
        if (initialQuest && initialQuest.id === questId) {
            return initialQuest;
        }
        if (questData && questData.id === questId) {
            return questData;
        }
        return null;
    }, [questId, manuallySelectedQuest, initialQuest, questData]);

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

    const addCoCook = useCallback(
        (user: SafeUser) => {
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
            setManuallyAddedUsers((prev) => ({ ...prev, [user.id]: user }));
            updateFormField('coCooksIds', [...coCooksIds, user.id]);
        },
        [coCooksIds, t, updateFormField]
    );

    const removeCoCook = useCallback(
        (userId: string) => {
            updateFormField(
                'coCooksIds',
                coCooksIds.filter((id: string) => id !== userId)
            );
        },
        [coCooksIds, updateFormField]
    );

    const addLinkedRecipe = useCallback(
        (recipe: SafeRecipe) => {
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
            setManuallyAddedRecipes((prev) => ({
                ...prev,
                [recipe.id]: recipe,
            }));
            updateFormField('linkedRecipeIds', [...linkedRecipeIds, recipe.id]);
        },
        [linkedRecipeIds, t, updateFormField]
    );

    const removeLinkedRecipe = useCallback(
        (recipeId: string) => {
            updateFormField(
                'linkedRecipeIds',
                linkedRecipeIds.filter((id: string) => id !== recipeId)
            );
        },
        [linkedRecipeIds, updateFormField]
    );

    const selectQuest = useCallback(
        (quest: SafeQuest) => {
            if (quest?.id) {
                setManuallySelectedQuest(quest);
                updateFormField('questId', quest.id);
            }
        },
        [updateFormField]
    );

    const removeQuest = useCallback(() => {
        setManuallySelectedQuest(null);
        updateFormField('questId', '');
    }, [updateFormField]);

    return {
        selectedCoCooks,
        selectedLinkedRecipes,
        selectedQuest,
        addCoCook,
        removeCoCook,
        addLinkedRecipe,
        removeLinkedRecipe,
        selectQuest,
        removeQuest,
    };
}
