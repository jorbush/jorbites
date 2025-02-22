import React from 'react';
import { render } from '@testing-library/react';
import FavoritesPage from '@/app/favorites/page';
import getFavoriteRecipes from '@/app/actions/getFavoriteRecipes';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { vi, it, describe, expect } from 'vitest';

vi.mock('@/app/actions/getFavoriteRecipes');
vi.mock('@/app/actions/getCurrentUser');
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
}));

vi.mock('next/headers', () => ({
    headers: () => Promise.resolve(new Headers({ 'x-forwarded-for': 'test' })),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { changeLanguage: () => new Promise(() => {}) },
    }),
    initReactI18next: { type: '3rdParty', init: () => {} },
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children, // Añadir esto
}));

describe('FavoritesPage', () => {
    it('renders EmptyState when no favorite recipes are found', async () => {
        (getFavoriteRecipes as any).mockResolvedValue([]);
        (getCurrentUser as any).mockResolvedValue(null);

        const page = await FavoritesPage();
        const { findByText } = render(page);

        const noFavText = await findByText('no_favorites_found');
        const noFavDesc = await findByText(
            'looks_like_you_have_no_favorite_recipes.'
        );

        expect(noFavText).toBeDefined();
        expect(noFavDesc).toBeDefined();
    });

    it('renders FavoritesClient with favorite recipes', async () => {
        const mockFavoriteRecipes = [
            {
                id: 'recipe1',
                title: 'Recipe 1',
                description: 'Description 1',
                imageSrc: 'http://image.png',
                category: '',
            },
            {
                id: 'recipe2',
                title: 'Recipe 2',
                description: 'Description 2',
                imageSrc: 'http://image.png',
                category: '',
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

        (getFavoriteRecipes as any).mockResolvedValue(mockFavoriteRecipes);
        (getCurrentUser as any).mockResolvedValue(mockCurrentUser);

        const page = await FavoritesPage();
        const { findByText } = render(page);

        const recipe1 = await findByText('Recipe 1');
        const recipe2 = await findByText('Recipe 2');

        expect(recipe1).toBeDefined();
        expect(recipe2).toBeDefined();
    });
});
