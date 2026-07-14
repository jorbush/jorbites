import { expect } from '@jest/globals';
import {
    POST as RecipePOST,
    DELETE as RecipeDELETE,
    PATCH as RecipePATCH,
} from '@/app/api/recipe/[recipeId]/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

jest.mock('@/app/lib/redis', () => ({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        incr: jest.fn(),
    },
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        incr: jest.fn(),
    },
}));

jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

describe('Recipe API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/recipe/[recipeId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    operation: 'increment',
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipePOST(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to interact with recipe'
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

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    operation: 'increment',
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: '' }),
            };

            const response = await RecipePOST(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when operation is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    operation: 'invalid',
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipePOST(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Operation must be either "increment" or "decrement"'
            );
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('DELETE /api/recipe/[recipeId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipeDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to delete recipe'
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

            const response = await RecipeDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('PATCH /api/recipe/[recipeId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    title: 'Updated Recipe',
                    description: 'Updated description',
                    categories: ['Dinner'],
                    method: 'Baking',
                    imageSrc: 'http://test.jpg',
                    ingredients: ['Ingredient 1'],
                    steps: ['Step 1'],
                    minutes: 30,
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipePATCH(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to edit recipe'
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

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    title: 'Updated Recipe',
                    description: 'Updated description',
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: '' }),
            };

            const response = await RecipePATCH(mockRequest, mockParams);
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
