import { expect } from '@jest/globals';
import { POST, DELETE } from '@/app/api/pinned/[recipeId]/route';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

jest.mock('@/app/lib/redis', () => ({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    },
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    },
}));

// Mock dependencies
jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            update: jest.fn(),
        },
        recipe: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@/app/lib/axiom/server', () => ({
    __esModule: true,
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Pinned Recipes API Route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/pinned/[recipeId]', () => {
        it('returns 401 if user is not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-123' }),
            };

            const response = await POST({} as Request, mockParams);

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe(
                'User authentication required to pin recipe'
            );
        });

        it('returns 400 if recipe ID is invalid or missing', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });

            const mockParams = {
                params: Promise.resolve({ recipeId: '' }),
            };

            const response = await POST({} as Request, mockParams);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe(
                'Recipe ID is required and must be a valid string'
            );
        });

        it('returns 400 if recipe is not found', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });
            (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null);

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-not-found' }),
            };

            const response = await POST({} as Request, mockParams);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Recipe not found');
        });

        it('returns 400 if user does not own the recipe', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });
            (prisma.recipe.findUnique as jest.Mock).mockResolvedValue({
                id: 'recipe-456',
                userId: 'different-user',
            });

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-456' }),
            };

            const response = await POST({} as Request, mockParams);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe(
                'You can only pin recipes that you created'
            );
        });

        it('returns 400 if recipe is already pinned', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue({
                id: 'user-123',
                pinnedRecipeIds: ['recipe-456'],
            });
            (prisma.recipe.findUnique as jest.Mock).mockResolvedValue({
                id: 'recipe-456',
                userId: 'user-123',
            });

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-456' }),
            };

            const response = await POST({} as Request, mockParams);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Recipe is already pinned');
        });

        it('returns 400 if user has already pinned 4 recipes', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue({
                id: 'user-123',
                pinnedRecipeIds: ['pin-1', 'pin-2', 'pin-3', 'pin-4'],
            });
            (prisma.recipe.findUnique as jest.Mock).mockResolvedValue({
                id: 'recipe-new',
                userId: 'user-123',
            });

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-new' }),
            };

            const response = await POST({} as Request, mockParams);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('You can only pin up to 4 recipes');
        });

        it('returns 200 and updates pinned list successfully', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue({
                id: 'user-123',
                pinnedRecipeIds: ['pin-1'],
            });
            (prisma.recipe.findUnique as jest.Mock).mockResolvedValue({
                id: 'recipe-ok',
                userId: 'user-123',
            });
            (prisma.user.update as jest.Mock).mockResolvedValue({
                id: 'user-123',
                pinnedRecipeIds: ['pin-1', 'recipe-ok'],
            });

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-ok' }),
            };

            const response = await POST({} as Request, mockParams);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.pinnedRecipeIds).toContain('recipe-ok');
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'user-123' },
                    data: { pinnedRecipeIds: ['pin-1', 'recipe-ok'] },
                })
            );
            const { redisCache } = require('@/app/lib/redis');
            expect(redisCache.del).toHaveBeenCalledWith(
                'pinned_recipes:user-123'
            );
        });
    });

    describe('DELETE /api/pinned/[recipeId]', () => {
        it('returns 401 if user is not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-123' }),
            };

            const response = await DELETE({} as Request, mockParams);

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe(
                'User authentication required to unpin recipe'
            );
        });

        it('returns 200 and removes recipe from pinned list', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue({
                id: 'user-123',
                pinnedRecipeIds: ['pin-1', 'recipe-remove'],
            });
            (prisma.user.update as jest.Mock).mockResolvedValue({
                id: 'user-123',
                pinnedRecipeIds: ['pin-1'],
            });

            const mockParams = {
                params: Promise.resolve({ recipeId: 'recipe-remove' }),
            };

            const response = await DELETE({} as Request, mockParams);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.pinnedRecipeIds).not.toContain('recipe-remove');
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'user-123' },
                    data: { pinnedRecipeIds: ['pin-1'] },
                })
            );
            const { redisCache } = require('@/app/lib/redis');
            expect(redisCache.del).toHaveBeenCalledWith(
                'pinned_recipes:user-123'
            );
        });
    });
});
