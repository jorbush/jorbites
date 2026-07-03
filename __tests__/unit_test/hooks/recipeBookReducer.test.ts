import { describe, it, expect } from 'vitest';
import {
    recipeBookReducer,
    RecipeBookState,
    RecipeBookAction,
} from '@/app/hooks/recipeBookReducer';

const initialState: RecipeBookState = {
    imageDisplay: 'random',
    displayExtraImages: true,
    displayUserImage: true,
    selectedRecipeIds: new Set<string>(),
    allRecipeIds: [],
};

const stateWithRecipes: RecipeBookState = {
    ...initialState,
    allRecipeIds: ['r1', 'r2', 'r3'],
    selectedRecipeIds: new Set(['r1', 'r2', 'r3']),
};

describe('recipeBookReducer', () => {
    describe('RESET', () => {
        it('resets to default state', () => {
            const modified: RecipeBookState = {
                imageDisplay: 'left-top',
                displayExtraImages: false,
                displayUserImage: false,
                selectedRecipeIds: new Set(['r1', 'r2']),
                allRecipeIds: ['r1', 'r2'],
            };
            const result = recipeBookReducer(modified, { type: 'RESET' });
            expect(result.imageDisplay).toBe('random');
            expect(result.displayExtraImages).toBe(true);
            expect(result.displayUserImage).toBe(true);
            expect(result.selectedRecipeIds.size).toBe(0);
            expect(result.allRecipeIds).toEqual([]);
        });
    });

    describe('SET_IMAGE_DISPLAY', () => {
        it('updates imageDisplay', () => {
            const result = recipeBookReducer(initialState, {
                type: 'SET_IMAGE_DISPLAY',
                payload: 'left-top',
            });
            expect(result.imageDisplay).toBe('left-top');
        });

        it('preserves other state fields', () => {
            const result = recipeBookReducer(initialState, {
                type: 'SET_IMAGE_DISPLAY',
                payload: 'right-bottom',
            });
            expect(result.displayExtraImages).toBe(true);
            expect(result.displayUserImage).toBe(true);
        });
    });

    describe('TOGGLE_EXTRA_IMAGES', () => {
        it('toggles displayExtraImages from true to false', () => {
            const result = recipeBookReducer(initialState, {
                type: 'TOGGLE_EXTRA_IMAGES',
            });
            expect(result.displayExtraImages).toBe(false);
        });

        it('toggles displayExtraImages from false to true', () => {
            const state = { ...initialState, displayExtraImages: false };
            const result = recipeBookReducer(state, {
                type: 'TOGGLE_EXTRA_IMAGES',
            });
            expect(result.displayExtraImages).toBe(true);
        });
    });

    describe('TOGGLE_USER_IMAGE', () => {
        it('toggles displayUserImage from true to false', () => {
            const result = recipeBookReducer(initialState, {
                type: 'TOGGLE_USER_IMAGE',
            });
            expect(result.displayUserImage).toBe(false);
        });

        it('toggles displayUserImage from false to true', () => {
            const state = { ...initialState, displayUserImage: false };
            const result = recipeBookReducer(state, {
                type: 'TOGGLE_USER_IMAGE',
            });
            expect(result.displayUserImage).toBe(true);
        });
    });

    describe('SET_RECIPES', () => {
        it('sets allRecipeIds and selects all by default', () => {
            const ids = ['r1', 'r2', 'r3'];
            const result = recipeBookReducer(initialState, {
                type: 'SET_RECIPES',
                payload: ids,
            });
            expect(result.allRecipeIds).toEqual(ids);
            expect(result.selectedRecipeIds.size).toBe(3);
            expect(result.selectedRecipeIds.has('r1')).toBe(true);
            expect(result.selectedRecipeIds.has('r2')).toBe(true);
            expect(result.selectedRecipeIds.has('r3')).toBe(true);
        });

        it('handles empty recipe list', () => {
            const result = recipeBookReducer(initialState, {
                type: 'SET_RECIPES',
                payload: [],
            });
            expect(result.allRecipeIds).toEqual([]);
            expect(result.selectedRecipeIds.size).toBe(0);
        });
    });

    describe('TOGGLE_RECIPE', () => {
        it('deselects a selected recipe', () => {
            const result = recipeBookReducer(stateWithRecipes, {
                type: 'TOGGLE_RECIPE',
                payload: 'r1',
            });
            expect(result.selectedRecipeIds.has('r1')).toBe(false);
            expect(result.selectedRecipeIds.has('r2')).toBe(true);
            expect(result.selectedRecipeIds.has('r3')).toBe(true);
        });

        it('selects a deselected recipe', () => {
            const state: RecipeBookState = {
                ...stateWithRecipes,
                selectedRecipeIds: new Set(['r2', 'r3']),
            };
            const result = recipeBookReducer(state, {
                type: 'TOGGLE_RECIPE',
                payload: 'r1',
            });
            expect(result.selectedRecipeIds.has('r1')).toBe(true);
            expect(result.selectedRecipeIds.size).toBe(3);
        });

        it('does not mutate original Set', () => {
            const original = new Set(['r1', 'r2', 'r3']);
            const state: RecipeBookState = {
                ...stateWithRecipes,
                selectedRecipeIds: original,
            };
            recipeBookReducer(state, {
                type: 'TOGGLE_RECIPE',
                payload: 'r1',
            });
            expect(original.has('r1')).toBe(true);
        });
    });

    describe('SELECT_ALL_RECIPES', () => {
        it('selects all recipes from allRecipeIds', () => {
            const state: RecipeBookState = {
                ...stateWithRecipes,
                selectedRecipeIds: new Set(['r1']),
            };
            const result = recipeBookReducer(state, {
                type: 'SELECT_ALL_RECIPES',
            });
            expect(result.selectedRecipeIds.size).toBe(3);
            expect(result.selectedRecipeIds.has('r1')).toBe(true);
            expect(result.selectedRecipeIds.has('r2')).toBe(true);
            expect(result.selectedRecipeIds.has('r3')).toBe(true);
        });
    });

    describe('DESELECT_ALL_RECIPES', () => {
        it('clears all selected recipes', () => {
            const result = recipeBookReducer(stateWithRecipes, {
                type: 'DESELECT_ALL_RECIPES',
            });
            expect(result.selectedRecipeIds.size).toBe(0);
        });
    });

    describe('unknown action', () => {
        it('returns current state unchanged', () => {
            const result = recipeBookReducer(initialState, {
                type: 'UNKNOWN',
            } as unknown as RecipeBookAction);
            expect(result).toBe(initialState);
        });
    });
});
