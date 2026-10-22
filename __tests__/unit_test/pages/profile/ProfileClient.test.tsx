import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import ProfileClient from '@/app/profile/[userId]/ProfileClient';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SafeRecipe, SafeUser } from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush,
        replace: vi.fn(),
        query: {},
    })),
    useSearchParams: vi.fn(() => ({
        get: vi.fn(() => null),
        toString: vi.fn(() => ''),
    })),
    usePathname: vi.fn(() => '/profile/user1'),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => key || fallback,
        i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    }),
    initReactI18next: { type: '3rdParty', init: () => {} },
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
        vi.clearAllMocks();
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

        expect(getByText('Recipe 1')).toBeDefined();
        expect(getByText('Recipe 2')).toBeDefined();
    });

    it('renders empty state when recipes list is empty', () => {
        const { getByTestId, queryByText } = render(
            <ProfileClient
                recipes={[]}
                currentUser={mockCurrentUser}
                totalPages={0}
                currentPage={1}
                searchParams={{}}
                profileUserId="user1"
            />
        );

        expect(getByTestId('profile-recipes-empty')).toBeDefined();
        expect(queryByText('Recipe 1')).toBeNull();
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

    it('renders profile tabs without counts and switches between Recipes and Blogs', () => {
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

        // Assert tabs render clean labels without count parentheses
        const tabsElement = getByTestId('profile-tabs');
        expect(tabsElement.textContent).not.toContain('(');
        expect(tabsElement.textContent).not.toContain(')');

        // Initially on recipes tab
        expect(getByText('Recipe 1')).toBeDefined();
        expect(queryByText('The Art of Sourdough')).toBeNull();

        // Switch to blogs tab
        const blogsTab = getByTestId('tab-blogs');
        fireEvent.click(blogsTab);

        // Now blogs are visible
        expect(getByText('The Art of Sourdough')).toBeDefined();
        expect(
            getByText('A deep dive into naturally leavened bread')
        ).toBeDefined();
        expect(queryByText('Recipe 1')).toBeNull();
    });

    it('defaults to blogs tab when account has 0 recipes but has blogs', () => {
        const mockBlogs: Blog[] = [
            {
                id: 'exclusive-blog',
                slug: 'exclusive-blog',
                content: 'Blog content',
                language: 'en',
                frontmatter: {
                    title: 'Culinary Journey 2026',
                    description: 'Story of taste',
                    date: '2026-06-01T00:00:00.000Z',
                    user_id: 'user1',
                },
            },
        ];

        const { getByText, getByTestId } = render(
            <ProfileClient
                recipes={[]}
                currentUser={mockCurrentUser}
                totalPages={0}
                currentPage={1}
                searchParams={{}}
                profileUserId="user1"
                blogs={mockBlogs}
            />
        );

        // Should default to blogs tab automatically
        expect(getByTestId('profile-blogs-content')).toBeDefined();
        expect(getByText('Culinary Journey 2026')).toBeDefined();
    });

    it('renders empty state in Blogs tab when user has no blogs', () => {
        const { getByTestId, getByText } = render(
            <ProfileClient
                recipes={mockRecipes}
                currentUser={mockCurrentUser}
                totalPages={1}
                currentPage={1}
                searchParams={{ tab: 'blogs' }}
                profileUserId="user1"
                blogs={[]}
            />
        );

        expect(getByTestId('profile-blogs-empty')).toBeDefined();
        expect(getByText('no_blogs_found')).toBeDefined();
    });
});
