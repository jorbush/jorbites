import React from 'react';
import { render, cleanup } from '@testing-library/react';
import FavoritesClient from '@/app/favorites/FavoritesClient';
import { SafeRecipe, SafeUser } from '@/app/types';
import { vi, it, describe, expect, afterEach } from 'vitest';

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
}));

// Mock data
const mockRecipes: SafeRecipe[] = [
    {
        id: 'recipe1',
        title: 'Recipe 1',
        description: 'Description 1',
        imageSrc: 'http://image.png',
        createdAt: '',
        category: '',
        method: '',
        minutes: 0,
        numLikes: 0,
        ingredients: [],
        steps: [],
        extraImages: [],
        userId: '',
    },
    {
        id: 'recipe2',
        title: 'Recipe 2',
        description: 'Description 2',
        imageSrc: 'http://image.png',
        createdAt: '',
        category: '',
        method: '',
        minutes: 0,
        numLikes: 0,
        ingredients: [],
        steps: [],
        extraImages: [],
        userId: '',
    },
];
const mockCurrentUser: SafeUser = {
    id: 'user1',
    name: 'Test User',
    email: null,
    emailVerified: null,
    image: '/test-image.jpg',
    hashedPassword: null,
    createdAt: '',
    updatedAt: '', // Add the updatedAt property
    favoriteIds: [],
    emailNotifications: false,
    level: 0,
    verified: false,
};

describe('FavoritesClient', () => {
    afterEach(() => {
        cleanup();
    });
    it('renders correctly with favorite recipes and current user', () => {
        const { getByText } = render(
            <FavoritesClient
                recipes={mockRecipes}
                currentUser={mockCurrentUser}
                totalPages={1}
                currentPage={1}
                searchParams={{}}
            />
        );

        // Assert that recipes are displayed
        expect(getByText('Recipe 1')).toBeDefined();
        expect(getByText('Recipe 2')).toBeDefined();
    });

    it('renders correctly with no current user', () => {
        const { getByText } = render(
            <FavoritesClient
                recipes={mockRecipes}
                currentUser={null}
                totalPages={1}
                currentPage={1}
                searchParams={{}}
            />
        );

        // Assert that recipes are displayed
        expect(getByText('Recipe 1')).toBeDefined();
        expect(getByText('Recipe 2')).toBeDefined();
    });

    it('renders correctly with no recipes', () => {
        const { container } = render(
            <FavoritesClient
                recipes={[]}
                currentUser={mockCurrentUser}
                totalPages={0}
                currentPage={1}
                searchParams={{}}
            />
        );

        // Assert that no recipes are displayed
        expect(container.querySelector('.grid')?.nodeValue).toBeNull();
    });

    it('renders pagination with multiple pages', () => {
        const { container, getByText } = render(
            <FavoritesClient
                recipes={mockRecipes}
                currentUser={mockCurrentUser}
                totalPages={3}
                currentPage={2}
                searchParams={{ page: 2 }}
            />
        );

        // Assert that pagination is displayed
        const paginationNav = container.querySelector(
            'nav[aria-label="Pagination"]'
        );
        expect(paginationNav).toBeDefined();
        expect(getByText(/of/)).toBeDefined();
    });
});
