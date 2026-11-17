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
                profilePreferences={{
                    showStats: true,
                    showActivityGraph: false,
                    showArticles: true,
                }}
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
                profilePreferences={{
                    showStats: true,
                    showActivityGraph: false,
                    showArticles: true,
                }}
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
                profilePreferences={{
                    showStats: true,
                    showActivityGraph: false,
                    showArticles: true,
                }}
            />
        );

        expect(getByTestId('profile-blogs-empty')).toBeDefined();
        expect(getByText('no_blogs_found')).toBeDefined();
    });

    describe('Profile Display Preferences customization', () => {
        const mockUserWithStats: SafeUser = {
            ...mockCurrentUser,
            id: 'creator-1',
            recipeCount: 10,
            likesReceived: 45,
            totalCookingTime: 120,
            recipesThisYear: 5,
        };

        const mockBlogs: Blog[] = [
            {
                id: 'article-1',
                slug: 'article-1',
                content: 'Content',
                language: 'en',
                frontmatter: {
                    title: 'Baking Sourdough',
                    description: 'Guide',
                    date: '2026-01-01',
                    user_id: 'creator-1',
                },
            },
        ];

        const mockGraphRecipes = [
            { id: 'gr-1', createdAt: new Date().toISOString() },
        ];

        it('shows cooking statistics when showStats is true', () => {
            const userWithStatsVisible = {
                ...mockUserWithStats,
                profilePreferences: {
                    showStats: true,
                    showActivityGraph: true,
                    showArticles: true,
                },
            };

            const { getByTestId } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    user={userWithStatsVisible}
                    currentUser={mockCurrentUser}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="creator-1"
                />
            );

            expect(getByTestId('profile-cooking-statistics')).toBeDefined();
        });

        it('hides cooking statistics when showStats is false', () => {
            const userWithStatsHidden = {
                ...mockUserWithStats,
                profilePreferences: {
                    showStats: false,
                    showActivityGraph: true,
                    showArticles: true,
                },
            };

            const { queryByTestId } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    user={userWithStatsHidden}
                    currentUser={mockCurrentUser}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="creator-1"
                />
            );

            expect(queryByTestId('profile-cooking-statistics')).toBeNull();
        });

        it('shows activity heatmap when showActivityGraph is true and graph data is provided', () => {
            const userWithGraphVisible = {
                ...mockUserWithStats,
                profilePreferences: {
                    showStats: true,
                    showActivityGraph: true,
                    showArticles: true,
                },
            };

            const { getByTestId } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    user={userWithGraphVisible}
                    currentUser={mockCurrentUser}
                    graphRecipes={mockGraphRecipes}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="creator-1"
                />
            );

            expect(getByTestId('profile-activity-graph')).toBeDefined();
            expect(getByTestId('activity-heatmap')).toBeDefined();
        });

        it('hides activity heatmap when showActivityGraph is false even if graph data is present', () => {
            const userWithGraphHidden = {
                ...mockUserWithStats,
                profilePreferences: {
                    showStats: true,
                    showActivityGraph: false,
                    showArticles: true,
                },
            };

            const { queryByTestId } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    user={userWithGraphHidden}
                    currentUser={mockCurrentUser}
                    graphRecipes={mockGraphRecipes}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="creator-1"
                />
            );

            expect(queryByTestId('profile-activity-graph')).toBeNull();
            expect(queryByTestId('activity-heatmap')).toBeNull();
        });

        it('shows authored articles tab when showArticles is true', () => {
            const userWithArticlesVisible = {
                ...mockUserWithStats,
                profilePreferences: {
                    showStats: true,
                    showActivityGraph: true,
                    showArticles: true,
                },
            };

            const { getByTestId } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    blogs={mockBlogs}
                    user={userWithArticlesVisible}
                    currentUser={mockCurrentUser}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="creator-1"
                />
            );

            expect(getByTestId('tab-blogs')).toBeDefined();
        });

        it('hides authored articles tab and prevents navigating to blogs tab when showArticles is false', () => {
            const userWithArticlesHidden = {
                ...mockUserWithStats,
                profilePreferences: {
                    showStats: true,
                    showActivityGraph: true,
                    showArticles: false,
                },
            };

            const { queryByTestId, getByText } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    blogs={mockBlogs}
                    user={userWithArticlesHidden}
                    currentUser={mockCurrentUser}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{ tab: 'blogs' }}
                    profileUserId="creator-1"
                />
            );

            // Tab button for blogs should not exist
            expect(queryByTestId('tab-blogs')).toBeNull();
            // Should fallback to recipes tab and display recipe content instead of blog content
            expect(getByText('Recipe 1')).toBeDefined();
            expect(queryByTestId('profile-blogs-content')).toBeNull();
        });

        it('respects default profile preferences (Option A: stats visible, activity graph hidden, authored articles hidden)', () => {
            const userWithoutCustomPrefs = {
                ...mockUserWithStats,
                profilePreferences: null,
            };

            const { getByTestId, queryByTestId } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    blogs={mockBlogs}
                    user={userWithoutCustomPrefs}
                    currentUser={mockCurrentUser}
                    graphRecipes={mockGraphRecipes}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="creator-1"
                />
            );

            // Stats shown by default
            expect(getByTestId('profile-cooking-statistics')).toBeDefined();
            // Activity graph hidden by default
            expect(queryByTestId('profile-activity-graph')).toBeNull();
            // Authored articles tab hidden by default
            expect(queryByTestId('tab-blogs')).toBeNull();
        });
    });

    describe('Profile Search Bar', () => {
        const mockBlogs: Blog[] = [
            {
                id: 'sourdough-guide',
                slug: 'sourdough-guide',
                content: 'Fermentation notes',
                language: 'en',
                frontmatter: {
                    title: 'The Art of Sourdough',
                    description: 'Naturally leavened bread',
                    date: '2026-06-01T00:00:00.000Z',
                    user_id: 'user1',
                },
            },
            {
                id: 'pasta-guide',
                slug: 'pasta-guide',
                content: 'Fresh pasta dough',
                language: 'en',
                frontmatter: {
                    title: 'Handmade Pasta',
                    description: 'Egg dough basics',
                    date: '2026-06-02T00:00:00.000Z',
                    user_id: 'user1',
                },
            },
        ];

        it('renders the search bar and navigates on submit', () => {
            const { getByTestId } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    currentUser={mockCurrentUser}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="user1"
                />
            );

            const searchInput = getByTestId(
                'profile-search-input'
            ) as HTMLInputElement;
            expect(searchInput).toBeDefined();
            expect(searchInput.placeholder).toBe('search_profile_recipes');

            fireEvent.change(searchInput, { target: { value: 'pasta' } });
            fireEvent.submit(searchInput.closest('form')!);

            expect(mockPush).toHaveBeenCalledWith(
                '/profile/user1?search=pasta',
                { scroll: false }
            );
        });

        it('renders empty search results and clears search on recipes tab', () => {
            const { getByTestId, getByText } = render(
                <ProfileClient
                    recipes={[]}
                    currentUser={mockCurrentUser}
                    totalPages={0}
                    currentPage={1}
                    searchParams={{ search: 'tacos' }}
                    profileUserId="user1"
                />
            );

            expect(getByTestId('profile-recipes-search-empty')).toBeDefined();
            expect(getByText('no_recipes_matching_search')).toBeDefined();

            fireEvent.click(getByTestId('profile-recipes-search-clear'));
            expect(mockPush).toHaveBeenCalledWith('/profile/user1', {
                scroll: false,
            });
        });

        it('updates placeholder and filters blogs when switching to Blogs tab', () => {
            const { getByTestId, getByText, queryByText } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    blogs={mockBlogs}
                    currentUser={mockCurrentUser}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="user1"
                    profilePreferences={{
                        showStats: false,
                        showActivityGraph: false,
                        showArticles: true,
                    }}
                />
            );

            fireEvent.click(getByTestId('tab-blogs'));

            const searchInput = getByTestId(
                'profile-search-input'
            ) as HTMLInputElement;
            expect(searchInput.placeholder).toBe('search_blogs');

            fireEvent.change(searchInput, { target: { value: 'sourdough' } });

            expect(getByText('The Art of Sourdough')).toBeDefined();
            expect(queryByText('Handmade Pasta')).toBeNull();
        });

        it('renders search bar below pinned recipes section on recipes tab', () => {
            const pinned = [
                {
                    ...mockRecipes[0],
                    id: 'pinned1',
                    title: 'Pinned Recipe 1',
                },
            ];

            const { getByTestId } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    pinnedRecipes={pinned}
                    currentUser={mockCurrentUser}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="user1"
                />
            );

            const pinnedSection = getByTestId('profile-pinned-recipes');
            const searchInput = getByTestId('profile-search-input');

            expect(
                Boolean(
                    pinnedSection.compareDocumentPosition(searchInput) &
                    Node.DOCUMENT_POSITION_FOLLOWING
                )
            ).toBe(true);
        });
    });

    describe('Lists, Quests, and Plannings Tabs', () => {
        const mockLists: SafeList[] = [
            {
                id: 'list-1',
                name: 'Weekend Brunch',
                isPrivate: false,
                isDefault: false,
                userId: 'user1',
                recipeIds: ['recipe1'],
                createdAt: '2026-06-01T00:00:00.000Z',
                updatedAt: '2026-06-01T00:00:00.000Z',
                recipes: [],
            },
        ];

        const mockQuests: SafeQuest[] = [
            {
                id: 'quest-1',
                title: 'Authentic Ramen Broth',
                description: 'Looking for a 12-hour tonkotsu recipe',
                status: 'open',
                userId: 'user1',
                acceptedRecipeId: null,
                acceptedSolverId: null,
                badgeEvaluated: false,
                createdAt: '2026-06-01T00:00:00.000Z',
                updatedAt: '2026-06-01T00:00:00.000Z',
                recipes: [],
            },
        ];

        const mockPlannings: SafePlanning[] = [
            {
                id: 'plan-1',
                name: 'Mediterranean Week',
                description: 'Healthy summer meal plan',
                isPrivate: false,
                userId: 'user1',
                createdAt: '2026-06-01T00:00:00.000Z',
                updatedAt: '2026-06-01T00:00:00.000Z',
                meals: [],
            },
        ];

        it('renders pill-style TabNavigation tabs for Lists, Quests, and Plannings by default and switches content', () => {
            const { getByTestId, getByText, queryByText } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    lists={mockLists}
                    quests={mockQuests}
                    plannings={mockPlannings}
                    currentUser={mockCurrentUser}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{}}
                    profileUserId="user1"
                />
            );

            const recipesTab = getByTestId('tab-recipes');
            expect(recipesTab.className).toContain('bg-green-450');
            expect(recipesTab.className).toContain('rounded-full');

            fireEvent.click(getByTestId('tab-lists'));
            expect(getByTestId('profile-lists-content')).toBeDefined();
            expect(getByText('Weekend Brunch')).toBeDefined();
            expect(queryByText('Recipe 1')).toBeNull();

            fireEvent.click(getByTestId('tab-quests'));
            expect(getByTestId('profile-quests-content')).toBeDefined();
            expect(getByText('Authentic Ramen Broth')).toBeDefined();

            fireEvent.click(getByTestId('tab-plannings'));
            expect(getByTestId('profile-plannings-content')).toBeDefined();
            expect(getByText('Mediterranean Week')).toBeDefined();
        });

        it('hides Lists, Quests, and Plannings tabs when disabled in profilePreferences and falls back to recipes', () => {
            const { queryByTestId, getByText } = render(
                <ProfileClient
                    recipes={mockRecipes}
                    lists={mockLists}
                    quests={mockQuests}
                    plannings={mockPlannings}
                    currentUser={mockCurrentUser}
                    totalPages={1}
                    currentPage={1}
                    searchParams={{ tab: 'lists' }}
                    profileUserId="user1"
                    profilePreferences={{
                        showStats: true,
                        showActivityGraph: false,
                        showArticles: false,
                        showLists: false,
                        showQuests: false,
                        showPlannings: false,
                    }}
                />
            );

            expect(queryByTestId('tab-lists')).toBeNull();
            expect(queryByTestId('tab-quests')).toBeNull();
            expect(queryByTestId('tab-plannings')).toBeNull();
            expect(queryByTestId('profile-lists-content')).toBeNull();
            expect(getByText('Recipe 1')).toBeDefined();
        });
    });
});
