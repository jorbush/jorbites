import { cleanup, render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProfilePage from '@/app/profile/[userId]/page';
import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import getRecipesForGraph from '@/app/actions/getRecipesForGraph';
import getUserById from '@/app/actions/getUserById';
import getCurrentUser from '@/app/actions/getCurrentUser';

// Mock implementations
vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: () => false,
}));
vi.mock('@/app/actions/getRecipesByUserId');
vi.mock('@/app/actions/getRecipesForGraph');
vi.mock('@/app/actions/getUserById');
vi.mock('@/app/actions/getCurrentUser');
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    usePathname: vi.fn(() => '/profile/user1'),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: { changeLanguage: () => new Promise(() => {}) },
    }),
    initReactI18next: { type: '3rdParty', init: () => {} },
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUser = { id: 'user1', name: 'Test User' };
const mockRecipes = [
    {
        id: 'recipe1',
        title: 'Test Recipe 1',
        userId: 'user1',
        createdAt: new Date().toISOString(),
        imageSrc: 'http://image.png',
        categories: [],
        description: 'Test Description 1',
        method: 'Test Method 1',
        minutes: 30,
        numLikes: 0,
        ingredients: ['Ingredient 1'],
        steps: ['Step 1'],
        extraImages: [],
        coCooksIds: [],
        linkedRecipeIds: [],
        youtubeUrl: '',
        questId: null,
    },
    {
        id: 'recipe2',
        title: 'Test Recipe 2',
        userId: 'user1',
        createdAt: new Date().toISOString(),
        imageSrc: 'http://image.png',
        categories: [],
        description: 'Test Description 2',
        method: 'Test Method 2',
        minutes: 45,
        numLikes: 5,
        ingredients: ['Ingredient A'],
        steps: ['Step A'],
        extraImages: [],
        coCooksIds: [],
        linkedRecipeIds: [],
        youtubeUrl: '',
        questId: null,
    },
];
const mockCurrentUser = {
    id: 'currentUserId',
    name: 'Current User',
};

describe('ProfilePage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders empty state when no user and no recipes', async () => {
        vi.mocked(getRecipesByUserId).mockResolvedValue({
            recipes: [],
            totalRecipes: 0,
            totalPages: 0,
            currentPage: 1,
        });
        vi.mocked(getRecipesForGraph).mockResolvedValue([]);
        vi.mocked(getUserById).mockResolvedValue(null);
        vi.mocked(getCurrentUser).mockResolvedValue({
            createdAt: '',
            updatedAt: '',
            emailVerified: null,
            id: mockCurrentUser.id,
            name: mockCurrentUser.name,
            email: null,
            image: null,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            level: 0,
            verified: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
        });

        const params = Promise.resolve({ userId: 'user1' });
        const searchParams = Promise.resolve({});
        const profilePage = await ProfilePage({ params, searchParams });
        const { getByText } = render(profilePage);

        await waitFor(() => {
            expect(getByText('No recipes found')).toBeDefined();
            expect(
                getByText('Looks like this user has not created recipes.')
            ).toBeDefined();
        });
    });

    it('renders profile header and recipes when user has recipes', async () => {
        vi.mocked(getRecipesByUserId).mockResolvedValue({
            recipes: mockRecipes as any,
            totalRecipes: 2,
            totalPages: 1,
            currentPage: 1,
        });
        vi.mocked(getRecipesForGraph).mockResolvedValue([
            { id: 'recipe1', createdAt: new Date().toISOString() },
            { id: 'recipe2', createdAt: new Date().toISOString() },
        ] as any);
        vi.mocked(getUserById).mockResolvedValue({
            createdAt: '',
            updatedAt: '',
            emailVerified: null,
            id: mockUser.id,
            name: mockUser.name,
            email: null,
            image: null,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            level: 0,
            verified: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
        });
        vi.mocked(getCurrentUser).mockResolvedValue({
            createdAt: '',
            updatedAt: '',
            emailVerified: null,
            id: mockCurrentUser.id,
            name: mockCurrentUser.name,
            email: null,
            image: null,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            level: 0,
            verified: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
        });

        const profilePage = await ProfilePage({
            params: Promise.resolve({ userId: 'user1' }),
            searchParams: Promise.resolve({}),
        });
        const { getByText } = render(profilePage);

        await waitFor(() => {
            expect(getByText('Test User')).toBeDefined();
            expect(getByText('Test Recipe 1')).toBeDefined();
            expect(getByText('Test Recipe 2')).toBeDefined();
        });
    });

    it('renders profile header and empty state when user has no recipes', async () => {
        vi.mocked(getRecipesByUserId).mockResolvedValue({
            recipes: [],
            totalRecipes: 0,
            totalPages: 0,
            currentPage: 1,
        });
        vi.mocked(getRecipesForGraph).mockResolvedValue([]);
        vi.mocked(getUserById).mockResolvedValue({
            createdAt: '',
            updatedAt: '',
            emailVerified: null,
            id: mockUser.id,
            name: mockUser.name,
            email: null,
            image: null,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            level: 0,
            verified: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
        });
        vi.mocked(getCurrentUser).mockResolvedValue({
            createdAt: '',
            updatedAt: '',
            emailVerified: null,
            id: mockCurrentUser.id,
            name: mockCurrentUser.name,
            email: null,
            image: null,
            hashedPassword: null,
            favoriteIds: [],
            emailNotifications: false,
            level: 0,
            verified: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
        });

        const profilePage = await ProfilePage({
            params: Promise.resolve({ userId: 'user1' }),
            searchParams: Promise.resolve({}),
        });
        const { getByText } = render(profilePage);

        await waitFor(() => {
            expect(getByText('Test User')).toBeDefined();
            expect(getByText('No recipes found')).toBeDefined();
            expect(
                getByText('Looks like this user has not created recipes.')
            ).toBeDefined();
        });
    });
});
