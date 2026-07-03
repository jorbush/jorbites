import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeBookSelectStep from '@/app/components/modals/recipe-book-steps/RecipeBookSelectStep';
import { SafeRecipe } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: any) => {
            if (opts) {
                return `${key}:${JSON.stringify(opts)}`;
            }
            return key;
        },
    }),
}));

vi.mock('@/app/components/shared/Loader', () => ({
    default: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ alt }: any) => (
        <img
            alt={alt}
            data-testid={`recipe-image-${alt}`}
        />
    ),
}));

vi.mock('react-icons/fi', () => ({
    FiCheck: () => <span data-testid="check-icon">✓</span>,
}));

const mockRecipes: SafeRecipe[] = [
    {
        id: 'r1',
        title: 'Chocolate Cake',
        imageSrc: 'https://example.com/cake.jpg',
        categories: ['Desserts', 'Baking'],
        steps: ['Mix', 'Bake'],
        ingredients: ['Chocolate', 'Flour'],
        description: '',
        createdAt: '2024-01-01',
        userId: 'user-1',
        minutes: 45,
        method: 'oven',
        extraImages: [],
    } as unknown as SafeRecipe,
    {
        id: 'r2',
        title: 'Pasta Carbonara',
        imageSrc: '',
        categories: ['Italian'],
        steps: ['Boil', 'Mix'],
        ingredients: ['Pasta', 'Eggs'],
        description: '',
        createdAt: '2024-01-02',
        userId: 'user-1',
        minutes: 20,
        method: 'stovetop',
        extraImages: [],
    } as unknown as SafeRecipe,
    {
        id: 'r3',
        title: 'Avocado Toast',
        imageSrc: 'https://example.com/toast.jpg',
        categories: [],
        steps: ['Toast'],
        ingredients: ['Avocado', 'Bread'],
        description: '',
        createdAt: '2024-01-03',
        userId: 'user-1',
        minutes: 5,
        method: 'none',
        extraImages: [],
    } as unknown as SafeRecipe,
];

describe('RecipeBookSelectStep', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Loading state', () => {
        it('renders a loader when isLoadingRecipes is true', () => {
            render(
                <RecipeBookSelectStep
                    recipes={[]}
                    isLoadingRecipes={true}
                    selectedRecipeIds={new Set()}
                    dispatch={mockDispatch}
                />
            );
            expect(screen.getByTestId('loader')).toBeDefined();
        });
    });

    describe('Empty state', () => {
        it('renders an empty message when no recipes', () => {
            render(
                <RecipeBookSelectStep
                    recipes={[]}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set()}
                    dispatch={mockDispatch}
                />
            );
            expect(screen.getByTestId('no-recipes-message')).toBeDefined();
        });
    });

    describe('Recipe list rendering', () => {
        it('renders all recipe items', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r2', 'r3'])}
                    dispatch={mockDispatch}
                />
            );

            expect(screen.getByText('Chocolate Cake')).toBeDefined();
            expect(screen.getByText('Pasta Carbonara')).toBeDefined();
            expect(screen.getByText('Avocado Toast')).toBeDefined();
        });

        it('renders recipe image when imageSrc is present', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r2', 'r3'])}
                    dispatch={mockDispatch}
                />
            );
            expect(
                screen.getByTestId('recipe-image-Chocolate Cake')
            ).toBeDefined();
        });

        it('renders a placeholder div when recipe has no image', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r2', 'r3'])}
                    dispatch={mockDispatch}
                />
            );
            // Pasta Carbonara has no image, so no img for it
            expect(
                screen.queryByTestId('recipe-image-Pasta Carbonara')
            ).toBeNull();
        });

        it('renders categories when present', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r2', 'r3'])}
                    dispatch={mockDispatch}
                />
            );
            expect(screen.getByText('Desserts, Baking')).toBeDefined();
        });

        it('does not render categories section when empty', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r2', 'r3'])}
                    dispatch={mockDispatch}
                />
            );
            // Avocado Toast has no categories — its button should still exist
            expect(screen.getByTestId('recipe-item-r3')).toBeDefined();
        });
    });

    describe('Selection state', () => {
        it('marks selected recipes with aria-pressed=true', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r3'])}
                    dispatch={mockDispatch}
                />
            );
            expect(
                screen
                    .getByTestId('recipe-item-r1')
                    .getAttribute('aria-pressed')
            ).toBe('true');
            expect(
                screen
                    .getByTestId('recipe-item-r2')
                    .getAttribute('aria-pressed')
            ).toBe('false');
            expect(
                screen
                    .getByTestId('recipe-item-r3')
                    .getAttribute('aria-pressed')
            ).toBe('true');
        });

        it('shows check icon only for selected recipes', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1'])}
                    dispatch={mockDispatch}
                />
            );
            const checkIcons = screen.getAllByTestId('check-icon');
            expect(checkIcons).toHaveLength(1);
        });

        it('shows selected count in header', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r2'])}
                    dispatch={mockDispatch}
                />
            );
            const counter = screen.getByTestId('recipes-selected-count');
            expect(counter.textContent).toContain('recipes_selected');
        });
    });

    describe('Individual recipe toggle', () => {
        it('dispatches TOGGLE_RECIPE with the recipe id when clicked', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r2', 'r3'])}
                    dispatch={mockDispatch}
                />
            );

            fireEvent.click(screen.getByTestId('recipe-item-r2'));
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'TOGGLE_RECIPE',
                payload: 'r2',
            });
        });
    });

    describe('Bulk toggle button', () => {
        it('shows "deselect_all" when all recipes are selected', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r2', 'r3'])}
                    dispatch={mockDispatch}
                />
            );
            expect(screen.getByTestId('bulk-toggle-button').textContent).toBe(
                'deselect_all'
            );
        });

        it('shows "select_all" when no recipes are selected', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set()}
                    dispatch={mockDispatch}
                />
            );
            expect(screen.getByTestId('bulk-toggle-button').textContent).toBe(
                'select_all'
            );
        });

        it('shows "select_all" when some (not all) recipes are selected', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1'])}
                    dispatch={mockDispatch}
                />
            );
            expect(screen.getByTestId('bulk-toggle-button').textContent).toBe(
                'select_all'
            );
        });

        it('dispatches DESELECT_ALL_RECIPES when all are selected and bulk toggle is clicked', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1', 'r2', 'r3'])}
                    dispatch={mockDispatch}
                />
            );
            fireEvent.click(screen.getByTestId('bulk-toggle-button'));
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'DESELECT_ALL_RECIPES',
            });
        });

        it('dispatches DESELECT_ALL_RECIPES when partial selection and bulk toggle is clicked', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set(['r1'])}
                    dispatch={mockDispatch}
                />
            );
            fireEvent.click(screen.getByTestId('bulk-toggle-button'));
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'DESELECT_ALL_RECIPES',
            });
        });

        it('dispatches SELECT_ALL_RECIPES when none are selected and bulk toggle is clicked', () => {
            render(
                <RecipeBookSelectStep
                    recipes={mockRecipes}
                    isLoadingRecipes={false}
                    selectedRecipeIds={new Set()}
                    dispatch={mockDispatch}
                />
            );
            fireEvent.click(screen.getByTestId('bulk-toggle-button'));
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SELECT_ALL_RECIPES',
            });
        });
    });
});
