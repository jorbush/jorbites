import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeCreateClient from '@/app/recipes/create/RecipeCreateClient';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import { SafeRecipe } from '@/app/types';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        refresh: vi.fn(),
    }),
}));

describe('RecipeCreateClient', () => {
    const mockRecipe: SafeRecipe = {
        id: 'recipe-123',
        title: 'Original Recipe',
        description: 'Original description',
        categories: ['Italian'],
        method: 'Bake',
        ingredients: ['Flour', 'Water'],
        steps: ['Mix', 'Bake'],
        minutes: 45,
        prepTime: 15,
        cookTime: 30,
        createdAt: '2026-01-01',
        user: {} as any,
        userId: 'user-1',
        imageSrc: 'recipe.jpg',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useRecipeModal.setState({
            isOpen: false,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: null,
            activeDraftId: null,
            onCloseCallback: null,
        });
    });

    it('opens modal in fork mode with recipe data on mount', () => {
        render(
            <RecipeCreateClient
                forkFromRecipe={mockRecipe}
                forkFromId="recipe-123"
            />
        );

        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(true);
        expect(state.forkedFromRecipeId).toBe('recipe-123');
        expect(state.forkRecipeData?.title).toBe('Original Recipe');
        expect(state.forkRecipeData?.description).toBe('Original description');
    });

    it('opens modal in standard create mode when no fork params are provided', () => {
        render(<RecipeCreateClient />);

        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(true);
        expect(state.forkedFromRecipeId).toBeNull();
    });

    it('redirects to original recipe when user closes modal in fork mode', () => {
        render(
            <RecipeCreateClient
                forkFromRecipe={mockRecipe}
                forkFromId="recipe-123"
            />
        );

        // Simulate user closing the modal
        useRecipeModal.getState().onClose();

        expect(mockPush).toHaveBeenCalledWith('/recipes/recipe-123');
    });

    it('redirects to home when user closes modal in standard create mode', () => {
        render(<RecipeCreateClient />);

        // Simulate user closing the modal
        useRecipeModal.getState().onClose();

        expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('cleans up modal on unmount without triggering redirect callback', () => {
        const { unmount } = render(
            <RecipeCreateClient
                forkFromRecipe={mockRecipe}
                forkFromId="recipe-123"
            />
        );

        expect(useRecipeModal.getState().isOpen).toBe(true);

        unmount();

        expect(useRecipeModal.getState().isOpen).toBe(false);
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('remains open under React StrictMode (double mount/unmount cycle)', () => {
        render(
            <StrictMode>
                <RecipeCreateClient
                    forkFromRecipe={mockRecipe}
                    forkFromId="recipe-123"
                />
            </StrictMode>
        );

        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(true);
        expect(state.forkedFromRecipeId).toBe('recipe-123');
        expect(state.forkRecipeData?.title).toBe('Original Recipe');
        expect(mockPush).not.toHaveBeenCalled();
    });
});
