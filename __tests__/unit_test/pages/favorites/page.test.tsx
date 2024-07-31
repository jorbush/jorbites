import React from 'react';
import { render, waitFor } from '@testing-library/react';
import FavoritesPage from '@/app/favorites/page';
import getFavoriteRecipes from '@/app/actions/getFavoriteRecipes';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { vi, it, describe, expect } from 'vitest';

// Mock the getFavoriteRecipes and getCurrentUser functions
vi.mock('@/app/actions/getFavoriteRecipes');
vi.mock('@/app/actions/getCurrentUser');
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
}));

describe('FavoritesPage', () => {
    it('renders EmptyState when no favorite recipes are found', async () => {
        (getFavoriteRecipes as any).mockResolvedValue([]);
        (getCurrentUser as any).mockResolvedValue(null);

        const page = await FavoritesPage();
        const { getByText } = render(page);

        await waitFor(() => {
            expect(
                getByText('No favorites found')
            ).toBeDefined();
            expect(
                getByText(
                    'Looks like you have no favorite recipes.'
                )
            ).toBeDefined();
        });
    });

    it('renders FavoritesClient with favorite recipes', async () => {
        const mockFavoriteRecipes = [
            {
                id: 'recipe1',
                title: 'Recipe 1',
                description: 'Description 1',
                imageSrc: 'http://image.png',
            },
            {
                id: 'recipe2',
                title: 'Recipe 2',
                description: 'Description 2',
                imageSrc: 'http://image.png',
            },
        ];
        const mockCurrentUser = {
            id: 'user1',
            name: 'Test User',
            email: null,
            emailVerified: null,
            image: null,
            hashedPassword: null,
            createdAt: new Date().toISOString(),
        };

        (getFavoriteRecipes as any).mockResolvedValue(
            mockFavoriteRecipes
        );
        (getCurrentUser as any).mockResolvedValue(
            mockCurrentUser
        );

        const page = await FavoritesPage();
        const { getByText } = render(page);

        await waitFor(() => {
            expect(getByText('Recipe 1')).toBeDefined();
            expect(getByText('Recipe 2')).toBeDefined();
        });
    });
});
