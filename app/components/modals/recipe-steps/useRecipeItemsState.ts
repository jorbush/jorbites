'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { TFunction } from 'i18next';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';
import { DraftData } from '@/app/types/draft';
import { RecipeModalStateLike } from './useRecipeFormState';

export interface UseRecipeItemsStateProps {
    recipeModal: RecipeModalStateLike;
    draftData?: DraftData | Partial<DraftData> | null;
    updateFormField: (id: string, value: unknown) => void;
    t: TFunction;
}

export function useRecipeItemsState({
    recipeModal,
    draftData,
    updateFormField,
    t,
}: UseRecipeItemsStateProps) {
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

    const [ingredientsInputMode, setIngredientsInputMode] = useState<
        'list' | 'text'
    >('list');
    const [stepsInputMode, setStepsInputMode] = useState<'list' | 'text'>(
        'list'
    );

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

    return {
        numIngredients: effectiveNumIngredients,
        numSteps: effectiveNumSteps,
        setNumIngredients,
        setNumSteps,
        effectiveNumIngredients,
        effectiveNumSteps,
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
    };
}
