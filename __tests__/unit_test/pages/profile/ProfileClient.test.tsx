import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import ProfileClient from '@/app/profile/[userId]/ProfileClient';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SafeRecipe, SafeUser } from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';

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
        categories: [],
        method: '',
        minutes: 0,
        numLikes: 0,
        ingredients: [],
        steps: [],
        extraImages: [],
        userId: '',
        coCooksIds: [],
        linkedRecipeIds: [],
        youtubeUrl: '',
        questId: null,
    },
    {
        id: 'recipe2',
        title: 'Recipe 2',
        description: 'Description 2',
        imageSrc: 'http://image.png',
        createdAt: new Date().toISOString(),
        categories: [],
        method: '',
        minutes: 0,
        numLikes: 0,
        ingredients: [],
        steps: [],
        extraImages: [],
        userId: '',
        coCooksIds: [],
        linkedRecipeIds: [],
        youtubeUrl: '',
        questId: null,
    },
];
const mockCurrentUser: SafeUser = {
    id: 'user1',
    name: 'Test User',
    email: null,
    emailVerified: null,
    image: '/test-image.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favoriteIds: [],
    emailNotifications: false,
    level: 0,
    verified: false,
    badges: [],
    resetToken: null,
    resetTokenExpiry: null,
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
                totalPages={1}
                currentPage={1}
                searchParams={{}}
                profileUserId="user1"
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
                totalPages={1}
                currentPage={1}
                searchParams={{}}
                profileUserId="user1"
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
                totalPages={0}
                currentPage={1}
                searchParams={{}}
                profileUserId="user1"
            />
        );

        // Assert that no recipes are displayed
        expect(container.querySelector('.grid')?.nodeValue).toBeNull();
    });

    it('renders pinned recipes when pinnedRecipes is provided', () => {
        const mockPinnedRecipes = [
            {
                ...mockRecipes[0],
                id: 'pinned1',
                title: 'Pinned Recipe 1',
            },
        ];
        const { getByText } = render(
            <ProfileClient
                recipes={mockRecipes}
                pinnedRecipes={mockPinnedRecipes}
                currentUser={mockCurrentUser}
                totalPages={1}
                currentPage={1}
                searchParams={{}}
                profileUserId="user1"
            />
        );

        expect(getByText('Pinned Recipe 1')).toBeDefined();
        expect(getByText('Recipe 1')).toBeDefined();
    });

    it('renders profile tabs and switches between Recipes and Stories & Articles', () => {
        const mockBlogs: Blog[] = [
            {
                id: 'my-first-article',
                slug: 'my-first-article',
                content: 'Full article content here',
                language: 'en',
                frontmatter: {
                    title: 'The Art of Sourdough',
                    description: 'A deep dive into naturally leavened bread',
                    date: '2026-06-01T00:00:00.000Z',
                    user_id: 'user1',
                },
            },
        ];

        const { getByTestId, getByText, queryByText } = render(
            <ProfileClient
                recipes={mockRecipes}
                currentUser={mockCurrentUser}
                totalPages={1}
                currentPage={1}
                searchParams={{}}
                profileUserId="user1"
                blogs={mockBlogs}
            />
        );

        // Initially on recipes tab
        expect(getByTestId('profile-tabs')).toBeDefined();
        expect(getByText('Recipe 1')).toBeDefined();
        expect(queryByText('The Art of Sourdough')).toBeNull();

        // Switch to articles tab
        const articlesTab = getByTestId('tab-articles');
        fireEvent.click(articlesTab);

        // Now articles are visible
        expect(getByText('The Art of Sourdough')).toBeDefined();
        expect(
            getByText('A deep dive into naturally leavened bread')
        ).toBeDefined();
        expect(queryByText('Recipe 1')).toBeNull();
    });

    it('renders empty state in Stories & Articles tab when user has no articles', () => {
        const { getByTestId, getByText } = render(
            <ProfileClient
                recipes={mockRecipes}
                currentUser={mockCurrentUser}
                totalPages={1}
                currentPage={1}
                searchParams={{ tab: 'articles' }}
                profileUserId="user1"
                blogs={[]}
            />
        );

        expect(getByTestId('profile-articles-content')).toBeDefined();
        expect(getByText('no_articles_found')).toBeDefined();
    });
});
