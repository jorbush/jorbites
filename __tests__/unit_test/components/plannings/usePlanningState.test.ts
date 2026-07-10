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
            description: 'Delicious pasta',
            user: { name: 'Chef Luigi' },
            calories: 450,
        };

        await act(async () => {
            await result.current.handleRecipeSelect(mockSelectedRecipe);
        });

        // The meals array should now contain our new meal with mapped calories
        const newMeal = result.current.meals.find(
            (m) => m.recipeId === 'rec-2'
        );
        expect(newMeal).toBeDefined();
        expect(newMeal.recipe.calories).toBe(450);
        expect(result.current.groupedMeals['monday-lunch']).toHaveLength(1);
        expect(
            result.current.groupedMeals['monday-lunch'][0].recipe.calories
        ).toBe(450);
        expect(axios.patch).toHaveBeenCalled();
    });
});
