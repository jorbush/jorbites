import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecipeFormState } from '@/app/components/modals/recipe-steps/useRecipeFormState';

// Mocks
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('swr', () => ({
    default: () => ({ data: null, isLoading: false }),
}));

describe('useRecipeFormState hook', () => {
    const mockRecipeModal = {
        isOpen: true,
        isEditMode: false,
        onClose: vi.fn(),
    };

    it('initializes default values correctly', () => {
        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser: null,
            })
        );

        expect(result.current.step).toBe(0);
        expect(result.current.numIngredients).toBe(1);
        expect(result.current.numSteps).toBe(1);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.selectedCoCooks).toEqual([]);
        expect(result.current.selectedLinkedRecipes).toEqual([]);
        expect(result.current.selectedQuest).toBeNull();
    });

    it('handles step navigation', () => {
        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser: null,
            })
        );

        act(() => {
            result.current.onBack();
        });
        expect(result.current.step).toBe(0); // Cannot go below 0
    });
});
