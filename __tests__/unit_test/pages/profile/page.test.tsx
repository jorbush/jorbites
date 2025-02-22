import { cleanup, render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProfilePage from '@/app/profile/[userId]/page';
import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import getUserById from '@/app/actions/getUserById';
import getCurrentUser from '@/app/actions/getCurrentUser';

// Mock implementations
vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: () => false,
}));
vi.mock('@/app/actions/getRecipesByUserId');
vi.mock('@/app/actions/getUserById');
vi.mock('@/app/actions/getCurrentUser');
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
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
        category: '',
    },
    {
        id: 'recipe2',
        title: 'Test Recipe 2',
        userId: 'user1',
        createdAt: new Date().toISOString(),
        imageSrc: 'http://image.png',
        category: '',
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
        vi.mocked(getRecipesByUserId).mockResolvedValue([]);
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
        });

        const params = { userId: 'user1' };
        const profilePage = await ProfilePage({ params });
        const { getByText } = render(profilePage);

        await waitFor(() => {
            expect(getByText('no_recipes_found')).toBeDefined();
            expect(
                getByText('looks_like_this_user_has_not_created_recipes.')
            ).toBeDefined();
        });
    });

    it('renders profile header and recipes when user has recipes', async () => {
        vi.mocked(getRecipesByUserId).mockResolvedValue(
            mockRecipes as {
                createdAt: string;
                id: string;
                title: string;
                description: string;
                imageSrc: string;
                category: string;
                method: string;
                minutes: number;
                numLikes: number;
                ingredients: string[];
                steps: string[];
                extraImages: string[];
                userId: string;
            }[]
        );
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
        });

        const profilePage = await ProfilePage({
            params: { userId: 'user1' },
        });
        const { getByText } = render(profilePage);

        await waitFor(() => {
            expect(getByText('Test User')).toBeDefined();
            expect(getByText('Test Recipe 1')).toBeDefined();
            expect(getByText('Test Recipe 2')).toBeDefined();
        });
    });

    it('renders profile header and empty state when user has no recipes', async () => {
        vi.mocked(getRecipesByUserId).mockResolvedValue([]);
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
        });

        const profilePage = await ProfilePage({
            params: { userId: 'user1' },
        });
        const { getByText } = render(profilePage);

        await waitFor(() => {
            expect(getByText('Test User')).toBeDefined();
            expect(getByText('no_recipes_found')).toBeDefined();
            expect(
                getByText('looks_like_this_user_has_not_created_recipes.')
            ).toBeDefined();
        });
    });
});
