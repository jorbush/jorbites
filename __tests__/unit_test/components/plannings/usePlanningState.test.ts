import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlanningState } from '@/app/components/plannings/usePlanningState';
import axios from 'axios';

vi.mock('axios');

// Mocks
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
        push: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

vi.mock('@/app/hooks/useShare', () => ({
    default: () => ({
        share: vi.fn(),
    }),
}));

const mockLoginModal = {
    onOpen: vi.fn(),
};
vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => mockLoginModal,
}));

describe('usePlanningState hook', () => {
    const mockPlanning = {
        id: 'plan-123',
        name: 'Weekly Keto',
        description: 'Low carb plan',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        isPrivate: false,
        meals: [
            {
                id: 'meal-1',
                day: 'monday',
                mealType: 'breakfast',
                recipeId: 'rec-1',
                recipe: { id: 'rec-1', title: 'Eggs' },
            },
        ],
    } as any;

    const mockCurrentUser = {
        id: 'user-1',
        savedPlanningIds: ['plan-123'],
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes states correctly', () => {
        const { result } = renderHook(() =>
            usePlanningState({
                planning: mockPlanning,
                currentUser: mockCurrentUser,
            })
        );

        expect(result.current.editedName).toBe('Weekly Keto');
        expect(result.current.editedDesc).toBe('Low carb plan');
        expect(result.current.isPrivate).toBe(false);
        expect(result.current.isSaved).toBe(true);
        expect(result.current.isOwner).toBe(true);
        expect(result.current.meals).toHaveLength(1);
    });

    it('groups meals correctly by day and meal type', () => {
        const { result } = renderHook(() =>
            usePlanningState({
                planning: mockPlanning,
                currentUser: mockCurrentUser,
            })
        );

        expect(result.current.groupedMeals['monday-breakfast']).toHaveLength(1);
        expect(result.current.groupedMeals['monday-lunch']).toHaveLength(0);
    });

    it('handles active slot selections', () => {
        const { result } = renderHook(() =>
            usePlanningState({
                planning: mockPlanning,
                currentUser: mockCurrentUser,
            })
        );

        act(() => {
            result.current.handleAddRecipeClick('tuesday', 'dinner');
        });

        expect(result.current.isRecipeSelectOpen).toBe(true);
        expect(result.current.activeSlot).toEqual({
            day: 'tuesday',
            mealType: 'dinner',
        });
    });

    it('sets calories and details on recipe selection', async () => {
        const { result } = renderHook(() =>
            usePlanningState({
                planning: mockPlanning,
                currentUser: mockCurrentUser,
            })
        );

        // Open slot first to set activeSlot
        act(() => {
            result.current.handleAddRecipeClick('monday', 'lunch');
        });

        // Mock axios patch success
        vi.mocked(axios.patch).mockResolvedValueOnce({ data: {} });

        const mockSelectedRecipe = {
            id: 'rec-2',
            title: 'Pasta',
            imageSrc: '/pasta.png',
            ingredients: ['pasta', 'sauce'],
            categories: ['Pasta'],
            description: 'Delicious pasta',
            user: { name: 'Chef Luigi' },
            calories: 450,
            protein: 18,
            carbohydrates: 65,
            fat: 12,
            fiber: 0,
            difficulty: 'Easy',
            dietaryTags: ['one-pot'],
            allergens: ['gluten'],
        };

        await act(async () => {
            await result.current.handleRecipeSelect(mockSelectedRecipe);
        });

        // The meals array should now contain our new meal with mapped nutrition & allergens
        const newMeal = result.current.meals.find(
            (m) => m.recipeId === 'rec-2'
        );
        expect(newMeal).toBeDefined();
        expect(newMeal.recipe.calories).toBe(450);
        expect(newMeal.recipe.protein).toBe(18);
        expect(newMeal.recipe.carbohydrates).toBe(65);
        expect(newMeal.recipe.fat).toBe(12);
        expect(newMeal.recipe.fiber).toBe(0);
        expect(newMeal.recipe.allergens).toEqual(['gluten']);
        expect(result.current.groupedMeals['monday-lunch']).toHaveLength(1);
        expect(
            result.current.groupedMeals['monday-lunch'][0].recipe.calories
        ).toBe(450);
        expect(axios.patch).toHaveBeenCalled();
    });

    it('calls axios.delete and navigates to /plannings on handleDeletePlanning', async () => {
        vi.mocked(axios.delete).mockResolvedValueOnce({ data: {} });

        const { result } = renderHook(() =>
            usePlanningState({
                planning: mockPlanning,
                currentUser: mockCurrentUser,
            })
        );

        await act(async () => {
            await result.current.handleDeletePlanning();
        });

        expect(axios.delete).toHaveBeenCalledWith('/api/plannings/plan-123');
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('updates dailyTargets via handleUpdatePlanning', async () => {
        vi.mocked(axios.patch).mockResolvedValueOnce({ data: {} });

        const { result } = renderHook(() =>
            usePlanningState({
                planning: mockPlanning,
                currentUser: mockCurrentUser,
            })
        );

        await act(async () => {
            await result.current.handleUpdatePlanning({
                name: 'Weekly Keto',
                description: 'Low carb plan',
                isPrivate: false,
                targetCalories: 2000,
                targetProtein: 140,
                targetCarbohydrates: 100,
                targetFat: 80,
            });
        });

        expect(axios.patch).toHaveBeenCalledWith('/api/plannings/plan-123', {
            name: 'Weekly Keto',
            description: 'Low carb plan',
            isPrivate: false,
            targetCalories: 2000,
            targetProtein: 140,
            targetCarbohydrates: 100,
            targetFat: 80,
            meals: [
                {
                    day: 'monday',
                    mealType: 'breakfast',
                    recipeId: 'rec-1',
                },
            ],
        });
        expect(result.current.dailyTargets).toEqual({
            targetCalories: 2000,
            targetProtein: 140,
            targetCarbohydrates: 100,
            targetFat: 80,
        });
    });

    it('opens RecipeSelectModal with remaining macro suggestionContext and allows switching slots', () => {
        const { result } = renderHook(() =>
            usePlanningState({
                planning: mockPlanning,
                currentUser: mockCurrentUser,
            })
        );

        act(() => {
            result.current.handleFillRemainingMacros('monday', 'dinner', {
                remainingCalories: 500,
                remainingProtein: 35,
                remainingCarbohydrates: 60,
                remainingFat: 20,
                initialFilters: { maxCalories: 500, minProtein: 35 },
                optionalFilters: { maxCarbohydrates: 60, maxFat: 20 },
                hasRemaining: true,
            });
        });

        expect(result.current.isRecipeSelectOpen).toBe(true);
        expect(result.current.activeSlot).toEqual({
            day: 'monday',
            mealType: 'dinner',
        });
        expect(result.current.suggestionContext?.initialBudget).toEqual({
            maxCalories: 500,
            minProtein: 35,
        });

        act(() => {
            result.current.suggestionContext?.onMealTypeChange?.('lunch');
        });

        expect(result.current.activeSlot).toEqual({
            day: 'monday',
            mealType: 'lunch',
        });
    });

    it('prompts login when unauthenticated user clicks Fill Remaining Macros', () => {
        const { result } = renderHook(() =>
            usePlanningState({
                planning: mockPlanning,
                currentUser: null,
            })
        );

        act(() => {
            result.current.handleFillRemainingMacros('monday', 'dinner', {
                remainingCalories: 500,
                remainingProtein: 35,
                remainingCarbohydrates: null,
                remainingFat: null,
                initialFilters: { maxCalories: 500, minProtein: 35 },
                optionalFilters: {},
                hasRemaining: true,
            });
        });

        expect(mockLoginModal.onOpen).toHaveBeenCalled();
        expect(result.current.isRecipeSelectOpen).toBe(false);
    });
});
