import { expect } from '@jest/globals';
import {
    POST as FavoritePOST,
    DELETE as FavoriteDELETE,
} from '@/app/api/favorites/[recipeId]/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

// This mocks our custom helper function to avoid passing authOptions around
jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

// This mocks calls to getServerSession
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

describe('Favorites API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/favorites/[recipeId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await FavoritePOST({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to add favorite'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when recipe ID is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockParams = {
                params: Promise.resolve({ recipeId: '' }),
            };

            const response = await FavoritePOST({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when recipe ID is not a string', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockParams = {
                params: Promise.resolve({ recipeId: undefined }),
            };

            const response = await FavoritePOST({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('DELETE /api/favorites/[recipeId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await FavoriteDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to remove favorite'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when recipe ID is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockParams = {
                params: Promise.resolve({ recipeId: '' }),
            };

            const response = await FavoriteDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });
    });
});
