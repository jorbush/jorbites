import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecipeItemsState } from '@/app/components/modals/recipe-steps/useRecipeItemsState';
import { toast } from 'react-hot-toast';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useRecipeItemsState', () => {
    const mockT = vi.fn((key: string) => key);
    const mockUpdateFormField = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with 1 ingredient and 1 step by default', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: { isEditMode: false },
                draftData: null,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        expect(result.current.numIngredients).toBe(1);
        expect(result.current.numSteps).toBe(1);
        expect(result.current.ingredientsInputMode).toBe('list');
        expect(result.current.stepsInputMode).toBe('list');
    });

    it('initializes from editRecipeData when in edit mode', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: {
                    isEditMode: true,
                    editRecipeData: {
                        id: 'recipe-1',
                        title: 'Pasta',
                        description: 'Tasty',
                        categories: ['Pasta'],
                        ingredients: ['Flour', 'Eggs', 'Salt'],
                        steps: ['Mix', 'Roll', 'Boil'],
                        imageSrc: '',
                        minutes: 30,
                    } as any,
                },
                draftData: null,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        expect(result.current.numIngredients).toBe(3);
        expect(result.current.numSteps).toBe(3);
    });

    it('initializes from draftData when available', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: { isEditMode: false },
                draftData: {
                    ingredients: ['Tomato', 'Basil'],
                    steps: ['Chop', 'Simmer'],
                } as any,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        expect(result.current.numIngredients).toBe(2);
        expect(result.current.numSteps).toBe(2);
    });

    it('adds and removes ingredient inputs correctly', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: { isEditMode: false },
                draftData: null,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        expect(result.current.numIngredients).toBe(1);

        act(() => {
            result.current.addIngredientInput();
        });
        expect(result.current.numIngredients).toBe(2);

        act(() => {
            result.current.removeIngredientInput(1);
        });
        expect(result.current.numIngredients).toBe(1);
        expect(mockUpdateFormField).toHaveBeenCalledWith('ingredient-1', '');
    });

    it('enforces maximum ingredient limit and alerts', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: { isEditMode: false },
                draftData: {
                    ingredients: Array.from(
                        { length: RECIPE_MAX_INGREDIENTS },
                        () => 'item'
                    ),
                } as any,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        expect(result.current.numIngredients).toBe(RECIPE_MAX_INGREDIENTS);

        act(() => {
            result.current.addIngredientInput();
        });

        expect(result.current.numIngredients).toBe(RECIPE_MAX_INGREDIENTS);
        expect(toast.error).toHaveBeenCalled();
    });

    it('sets ingredients list in bulk', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: { isEditMode: false },
                draftData: null,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        act(() => {
            result.current.setIngredients(['Garlic', 'Olive Oil']);
        });

        expect(result.current.numIngredients).toBe(2);
        expect(mockUpdateFormField).toHaveBeenCalledWith(
            'ingredient-0',
            'Garlic'
        );
        expect(mockUpdateFormField).toHaveBeenCalledWith(
            'ingredient-1',
            'Olive Oil'
        );
        expect(mockUpdateFormField).toHaveBeenCalledWith('ingredients', [
            'Garlic',
            'Olive Oil',
        ]);
    });

    it('adds and removes steps correctly', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: { isEditMode: false },
                draftData: null,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        expect(result.current.numSteps).toBe(1);

        act(() => {
            result.current.addStepInput();
        });
        expect(result.current.numSteps).toBe(2);

        act(() => {
            result.current.removeStepInput(1);
        });
        expect(result.current.numSteps).toBe(1);
        expect(mockUpdateFormField).toHaveBeenCalledWith('step-1', '');
    });

    it('enforces maximum steps limit and alerts', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: { isEditMode: false },
                draftData: {
                    steps: Array.from(
                        { length: RECIPE_MAX_STEPS },
                        () => 'step'
                    ),
                } as any,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        expect(result.current.numSteps).toBe(RECIPE_MAX_STEPS);

        act(() => {
            result.current.addStepInput();
        });

        expect(result.current.numSteps).toBe(RECIPE_MAX_STEPS);
        expect(toast.error).toHaveBeenCalled();
    });

    it('sets steps list in bulk', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: { isEditMode: false },
                draftData: null,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        act(() => {
            result.current.setSteps(['Preheat oven', 'Bake for 20 mins']);
        });

        expect(result.current.numSteps).toBe(2);
        expect(mockUpdateFormField).toHaveBeenCalledWith(
            'step-0',
            'Preheat oven'
        );
        expect(mockUpdateFormField).toHaveBeenCalledWith(
            'step-1',
            'Bake for 20 mins'
        );
        expect(mockUpdateFormField).toHaveBeenCalledWith('steps', [
            'Preheat oven',
            'Bake for 20 mins',
        ]);
    });

    it('allows toggling between list and text input modes', () => {
        const { result } = renderHook(() =>
            useRecipeItemsState({
                recipeModal: { isEditMode: false },
                draftData: null,
                updateFormField: mockUpdateFormField,
                t: mockT as any,
            })
        );

        act(() => {
            result.current.setIngredientsInputMode('text');
            result.current.setStepsInputMode('text');
        });

        expect(result.current.ingredientsInputMode).toBe('text');
        expect(result.current.stepsInputMode).toBe('text');
    });
});
