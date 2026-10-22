import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfileRecipesContent from '@/app/components/profile/ProfileRecipesContent';
import { SafeRecipe, SafeUser } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    }),
    initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(() => null),
        toString: vi.fn(() => ''),
    }),
    usePathname: () => '/profile/user1',
}));

const mockRecipe: SafeRecipe = {
    id: 'recipe-1',
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta',
    imageSrc: 'http://image.png',
    createdAt: new Date().toISOString(),
    categories: [],
    method: '',
    minutes: 20,
    numLikes: 5,
    ingredients: [],
    steps: [],
    extraImages: [],
    userId: 'user1',
    coCooksIds: [],
    linkedRecipeIds: [],
    youtubeUrl: '',
    questId: null,
};

const mockUser: SafeUser = {
    id: 'user1',
    name: 'Mario',
    email: null,
    emailVerified: null,
    image: null,
    createdAt: '',
    updatedAt: '',
    favoriteIds: [],
    emailNotifications: false,
    level: 1,
    verified: false,
    badges: [],
};

describe('ProfileRecipesContent Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders empty state without OrderByDropdown when no recipes exist', () => {
        render(
            <ProfileRecipesContent
                recipes={[]}
                pinnedRecipes={[]}
                currentUser={mockUser}
                isOwnProfile={true}
                totalPages={0}
                currentPage={1}
                searchParams={{}}
            />
        );

        expect(screen.getByTestId('profile-recipes-empty')).toBeDefined();
        expect(screen.getByText('no_recipes_found')).toBeDefined();
        expect(screen.queryByTestId('profile-recipes-content')).toBeNull();
    });

    it('renders recipes grid and OrderByDropdown when recipes exist', () => {
        render(
            <ProfileRecipesContent
                recipes={[mockRecipe]}
                pinnedRecipes={[]}
                currentUser={mockUser}
                isOwnProfile={true}
                totalPages={1}
                currentPage={1}
                searchParams={{}}
            />
        );

        expect(screen.getByTestId('profile-recipes-content')).toBeDefined();
        expect(screen.getByText('Pasta Carbonara')).toBeDefined();
        expect(screen.queryByTestId('profile-recipes-empty')).toBeNull();
    });

    it('renders pinned recipes when pinnedRecipes are provided', () => {
        const pinnedRecipe = {
            ...mockRecipe,
            id: 'pinned-1',
            title: 'Special Pizza',
        };
        render(
            <ProfileRecipesContent
                recipes={[mockRecipe]}
                pinnedRecipes={[pinnedRecipe]}
                currentUser={mockUser}
                isOwnProfile={true}
                totalPages={1}
                currentPage={1}
                searchParams={{}}
            />
        );

        expect(screen.getByText('pinned_recipes')).toBeDefined();
        expect(screen.getByText('Special Pizza')).toBeDefined();
        expect(screen.getByText('Pasta Carbonara')).toBeDefined();
    });

    it('renders pagination when totalPages > 1', () => {
        render(
            <ProfileRecipesContent
                recipes={[mockRecipe]}
                pinnedRecipes={[]}
                currentUser={mockUser}
                isOwnProfile={true}
                totalPages={3}
                currentPage={1}
                searchParams={{}}
            />
        );

        expect(
            screen.getByRole('navigation', { name: 'Pagination' })
        ).toBeDefined();
    });
});
