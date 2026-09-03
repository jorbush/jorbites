import { SafeUser, SafeRecipe } from '@/app/types';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';
import { DraftData } from '@/app/types/draft';
import { RecipeModalStateLike } from './useRecipeFormState';

function buildEmptySlots(): Record<string, string> {
    const emptySlots: Record<string, string> = {};
    for (let i = 0; i < RECIPE_MAX_INGREDIENTS; i++) {
        emptySlots[`ingredient-${i}`] = '';
    }
    for (let i = 0; i < RECIPE_MAX_STEPS; i++) {
        emptySlots[`step-${i}`] = '';
    }
    return emptySlots;
}

function buildIndexedSlots(
    items: unknown[] | undefined,
    prefix: 'ingredient' | 'step',
    max: number
): { list: string[]; indexed: Record<string, string> } {
    const list = Array.isArray(items) ? items.slice(0, max).map(String) : [];
    const indexed: Record<string, string> = {};
    list.forEach((item, index) => {
        indexed[`${prefix}-${index}`] = item;
    });
    return { list, indexed };
}

/**
 * Builds the initial default values for the recipe form.
 * Pure function extracted from useRecipeFormState to minimize control-flow complexity.
 */
export function buildInitialRecipeDefaultValues(
    recipeModal: RecipeModalStateLike,
    draftData?: Partial<DraftData> | null
): Record<string, unknown> {
    const emptySlots = buildEmptySlots();

    if (recipeModal.isEditMode && recipeModal.editRecipeData) {
        const editData = recipeModal.editRecipeData;
        const { list: ingredients, indexed: ingredientsObject } =
            buildIndexedSlots(
                editData.ingredients,
                'ingredient',
                RECIPE_MAX_INGREDIENTS
            );
        const { list: steps, indexed: stepsObject } = buildIndexedSlots(
            editData.steps,
            'step',
            RECIPE_MAX_STEPS
        );

        return {
            ...emptySlots,
            categories: Array.isArray(editData.categories)
                ? editData.categories
                : [],
            method: editData.method || '',
            imageSrc: editData.imageSrc || '',
            imageSrc1: editData.imageSrc1 || '',
            imageSrc2: editData.imageSrc2 || '',
            imageSrc3: editData.imageSrc3 || '',
            title: editData.title || '',
            description: editData.description || '',
            ingredients,
            steps,
            minutes: editData.minutes ?? 30,
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
        const { list: ingredients, indexed: ingredientsObject } =
            buildIndexedSlots(
                draftData.ingredients,
                'ingredient',
                RECIPE_MAX_INGREDIENTS
            );
        const { list: steps, indexed: stepsObject } = buildIndexedSlots(
            draftData.steps,
            'step',
            RECIPE_MAX_STEPS
        );

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
            minutes: draftData.minutes !== undefined ? draftData.minutes : 30,
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
}
