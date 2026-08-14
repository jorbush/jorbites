import { expect } from '@jest/globals';
import {
    POST as RecipePOST,
    DELETE as RecipeDELETE,
    PATCH as RecipePATCH,
} from '@/app/api/recipe/[recipeId]/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

const mockUser = {
    id: 'test-user-id',
    name: 'test',
    email: 'test@a.com',
    favoriteIds: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    recipe: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';

jest.mock('@/app/actions/getRecipeById', () => ({
    __esModule: true,
    default: jest.fn(),
}));

import getRecipeById from '@/app/actions/getRecipeById';

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
        if (mockedSession?.user?.email) {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        } else {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        }
    });

    describe('POST /api/recipe/[recipeId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

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
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

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
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

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
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

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
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

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
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

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
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

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

        it('should preserve existing linkedRecipeIds when omitted from PATCH payload', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const existingRecipe = {
                id: 'recipe-123',
                userId: 'test-user-id',
                title: 'Existing Title',
                description: 'Existing Desc',
                imageSrc: 'http://test.jpg',
                categories: ['Dinner'],
                method: 'Baking',
                ingredients: ['Flour'],
                steps: ['Mix'],
                minutes: 30,
                linkedRecipeIds: ['linked-1', 'linked-2'],
                coCooksIds: [],
            };

            (getRecipeById as jest.Mock).mockResolvedValue(existingRecipe);
            (prisma.recipe.update as jest.Mock).mockResolvedValue({
                ...existingRecipe,
                title: 'Updated Title',
            });

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    title: 'Updated Title',
                    description: 'Existing Desc',
                    categories: ['Dinner'],
                    method: 'Baking',
                    ingredients: ['Flour'],
                    steps: ['Mix'],
                    minutes: 30,
                    // linkedRecipeIds omitted
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-123' }),
            };

            const response = await RecipePATCH(mockRequest, mockParams);
            expect(response.status).toBe(200);

            expect(prisma.recipe.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'recipe-123' },
                    data: expect.objectContaining({
                        linkedRecipeIds: ['linked-1', 'linked-2'],
                    }),
                })
            );
        });

        it('should prevent co-cook from updating coCooksIds on PATCH', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'Co Cook', email: 'cocook@test.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'cocook-id',
                name: 'Co Cook',
                email: 'cocook@test.com',
                favoriteIds: [],
                createdAt: new Date('2026-01-01'),
                updatedAt: new Date('2026-01-01'),
            });

            const existingRecipe = {
                id: 'recipe-123',
                userId: 'owner-id',
                coCooksIds: ['cocook-id'],
                title: 'Existing Title',
                description: 'Existing Desc',
                imageSrc: 'http://test.jpg',
                categories: ['Dinner'],
                method: 'Baking',
                ingredients: ['Flour'],
                steps: ['Mix'],
                minutes: 30,
                linkedRecipeIds: [],
            };

            (getRecipeById as jest.Mock).mockResolvedValue(existingRecipe);
            (prisma.recipe.update as jest.Mock).mockResolvedValue(
                existingRecipe
            );

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    title: 'Co-Cook Edit',
                    description: 'Existing Desc',
                    categories: ['Dinner'],
                    method: 'Baking',
                    ingredients: ['Flour'],
                    steps: ['Mix'],
                    minutes: 30,
                    coCooksIds: ['cocook-id', 'malicious-co-cook'], // Co-cook tries to add another user
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-123' }),
            };

            const response = await RecipePATCH(mockRequest, mockParams);
            expect(response.status).toBe(200);

            // Verify update was called with existing coCooksIds ['cocook-id'], ignoring the payload
            expect(prisma.recipe.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'recipe-123' },
                    data: expect.objectContaining({
                        coCooksIds: ['cocook-id'],
                    }),
                })
            );
        });
    });
});
