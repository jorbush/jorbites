import React from 'react';
import { render, cleanup } from '@testing-library/react';
import ProfileClient from '@/app/profile/[userId]/ProfileClient';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SafeRecipe, SafeUser } from '@/app/types';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        query: {},
    })),
    useSearchParams: vi.fn(() => ({
        get: vi.fn(() => null),
        toString: vi.fn(() => ''),
    })),
    usePathname: vi.fn(() => '/profile/user1'),
}));

// Mock data
const mockRecipes: SafeRecipe[] = [
    {
        id: 'recipe1',
        title: 'Recipe 1',
        description: 'Description 1',
        imageSrc: 'http://image.png',
        createdAt: new Date().toISOString(),
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
        createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favoriteIds: [],
    emailNotifications: false,
    level: 0,
    verified: false,
};

describe('ProfileClient', () => {
    afterEach(() => {
        cleanup();
    });
    it('renders correctly with recipes and current user', () => {
        const { getByText } = render(
            <ProfileClient
                recipes={mockRecipes}
                currentUser={mockCurrentUser}
            />
        );

        // Assert that recipes are displayed
        expect(getByText('Recipe 1')).toBeDefined();
        expect(getByText('Recipe 2')).toBeDefined();
    });

    it('renders correctly with no current user', () => {
        const { getByText } = render(
            <ProfileClient
                recipes={mockRecipes}
                currentUser={null}
            />
        );

        // Assert that recipes are displayed
        expect(getByText('Recipe 1')).toBeDefined();
        expect(getByText('Recipe 2')).toBeDefined();
    });

    it('renders correctly with no recipes', () => {
        const { container } = render(
            <ProfileClient
                recipes={[]}
                currentUser={mockCurrentUser}
            />
        );

        // Assert that no recipes are displayed
        expect(container.querySelector('.grid')?.nodeValue).toBeNull();
    });
});
