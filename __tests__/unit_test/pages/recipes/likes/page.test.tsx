import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LikesPage from '@/app/recipes/[recipeId]/likes/page';

// Mocks
vi.mock('@/app/actions/getCurrentUser', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/actions/getRecipeById', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/actions/getUsersWhoLikedRecipe', () => ({
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
        <div data-testid="container">{children}</div>
    ),
}));

vi.mock('@/app/components/utils/EmptyState', () => ({
    default: () => <div data-testid="empty-state">Empty State</div>,
}));

vi.mock('@/app/recipes/[recipeId]/likes/LikesClient', () => ({
    default: () => <div data-testid="likes-client">Likes Client</div>,
}));

describe('LikesPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders EmptyState when recipe is not found', async () => {
        const getRecipeByIdMock = await import('@/app/actions/getRecipeById');
        vi.mocked(getRecipeByIdMock.default).mockResolvedValue(null);

        const { findByTestId } = render(
            await LikesPage({
                params: Promise.resolve({ recipeId: 'recipe-1' }),
            })
        );

        expect(await findByTestId('empty-state')).toBeDefined();
    });

    it('renders LikesClient when recipe is found', async () => {
        const getRecipeByIdMock = await import('@/app/actions/getRecipeById');
        vi.mocked(getRecipeByIdMock.default).mockResolvedValue({
            id: 'recipe-1',
            title: 'Test Recipe',
        } as any);

        const getCurrentUserMock = await import('@/app/actions/getCurrentUser');
        vi.mocked(getCurrentUserMock.default).mockResolvedValue({
            id: 'user1',
        } as any);

        const getUsersWhoLikedRecipeMock =
            await import('@/app/actions/getUsersWhoLikedRecipe');
        vi.mocked(getUsersWhoLikedRecipeMock.default).mockResolvedValue([
            { id: 'user2', name: 'Liker' },
        ] as any);

        const { findByTestId } = render(
            await LikesPage({
                params: Promise.resolve({ recipeId: 'recipe-1' }),
            })
        );

        expect(await findByTestId('likes-client')).toBeDefined();
        expect(getUsersWhoLikedRecipeMock.default).toHaveBeenCalledWith({
            recipeId: 'recipe-1',
        });
    });
});
