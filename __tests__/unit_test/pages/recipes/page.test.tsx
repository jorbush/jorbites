import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipePage from '@/app/recipes/[recipeId]/page';

// Mocks
vi.mock('@/app/actions/getCurrentUser', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/actions/getRecipeById', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/actions/getCommentsByRecipeId', () => ({
    default: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
}));

vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="client-only">{children}</div>
    ),
}));

vi.mock('@/app/components/utils/EmptyState', () => ({
    default: () => <div data-testid="empty-state">Empty State</div>,
}));

vi.mock('@/app/recipes/[recipeId]/RecipeClient', () => ({
    default: () => <div data-testid="recipe-client">Recipe Client</div>,
}));

describe('RecipePage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders EmptyState when recipe is not found', async () => {
        const getRecipeByIdMock = await import('@/app/actions/getRecipeById');
        vi.mocked(getRecipeByIdMock.default).mockResolvedValue(null);

        const { findByTestId } = render(
            await RecipePage({ params: Promise.resolve({ recipeId: '1' }) })
        );

        expect(await findByTestId('empty-state')).toBeDefined();
    });

    it('renders RecipeClient when recipe is found', async () => {
        const getRecipeByIdMock = await import('@/app/actions/getRecipeById');
        vi.mocked(getRecipeByIdMock.default).mockResolvedValue({
            id: '1',
            title: 'Test Recipe',
            coCooks: [],
            linkedRecipes: [],
        } as any);

        const getCurrentUserMock = await import('@/app/actions/getCurrentUser');
        vi.mocked(getCurrentUserMock.default).mockResolvedValue({
            id: 'user1',
        } as any);

        const getCommentsByRecipeIdMock = await import(
            '@/app/actions/getCommentsByRecipeId'
        );
        vi.mocked(getCommentsByRecipeIdMock.default).mockResolvedValue([
            { id: 'comment1' },
        ] as any);

        const { findByTestId } = render(
            await RecipePage({ params: Promise.resolve({ recipeId: '1' }) })
        );

        expect(await findByTestId('recipe-client')).toBeDefined();
    });
});
