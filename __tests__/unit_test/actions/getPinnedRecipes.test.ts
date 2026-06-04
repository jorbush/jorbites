import { describe, it, expect, vi, beforeEach } from 'vitest';
import getPinnedRecipesByUserId from '@/app/actions/getPinnedRecipesByUserId';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';

vi.mock('@/app/lib/prismadb', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
        },
        recipe: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock('@/app/lib/redis', () => ({
    redis: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
    },
    redisCache: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
    },
}));

describe('getPinnedRecipesByUserId Server Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return empty list when userId is missing', async () => {
        const result = await getPinnedRecipesByUserId('');
        expect(result).toEqual([]);
    });

    it('should return cached data on cache hit', async () => {
        const mockRecipes = [
            {
                id: 'recipe-1',
                title: 'Recipe One',
                createdAt: '2026-05-20T12:00:00.000Z',
            },
        ];
        vi.mocked(redisCache.get).mockResolvedValue(
            JSON.stringify(mockRecipes)
        );

        const result = await getPinnedRecipesByUserId('user-1');

        expect(redisCache.get).toHaveBeenCalledWith('pinned_recipes:user-1');
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
        expect(result).toEqual(mockRecipes);
    });

    it('should return empty list when user is not found in database', async () => {
        vi.mocked(redisCache.get).mockResolvedValue(null);
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        const result = await getPinnedRecipesByUserId('user-1');
        expect(result).toEqual([]);
    });

    it('should return empty list when user has no pinned recipe IDs', async () => {
        vi.mocked(redisCache.get).mockResolvedValue(null);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'user-1',
            pinnedRecipeIds: [],
        } as any);

        const result = await getPinnedRecipesByUserId('user-1');
        expect(result).toEqual([]);
    });

    it('should query DB, sort, return, and set cache on cache miss', async () => {
        vi.mocked(redisCache.get).mockResolvedValue(null);
        const pinnedIds = ['recipe-3', 'recipe-1', 'recipe-2'];
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'user-1',
            pinnedRecipeIds: pinnedIds,
        } as any);

        const dbRecipes = [
            {
                id: 'recipe-1',
                title: 'Recipe One',
                createdAt: new Date('2026-05-20T12:00:00.000Z'),
            },
            {
                id: 'recipe-2',
                title: 'Recipe Two',
                createdAt: new Date('2026-05-21T12:00:00.000Z'),
            },
            {
                id: 'recipe-3',
                title: 'Recipe Three',
                createdAt: new Date('2026-05-22T12:00:00.000Z'),
            },
        ];

        vi.mocked(prisma.recipe.findMany).mockResolvedValue(dbRecipes as any);

        const result = await getPinnedRecipesByUserId('user-1');

        expect(redisCache.get).toHaveBeenCalledWith('pinned_recipes:user-1');
        expect(prisma.recipe.findMany).toHaveBeenCalledWith({
            where: {
                id: {
                    in: pinnedIds,
                },
            },
        });

        expect(result.length).toBe(3);
        // Ordering check: recipe-3, recipe-1, recipe-2
        expect(result[0].id).toBe('recipe-3');
        expect(result[1].id).toBe('recipe-1');
        expect(result[2].id).toBe('recipe-2');

        // Date formatting check
        expect(typeof result[0].createdAt).toBe('string');
        expect(result[0].createdAt).toBe(
            new Date('2026-05-22T12:00:00.000Z').toString()
        );

        // Redis cache set check
        expect(redisCache.set).toHaveBeenCalledWith(
            'pinned_recipes:user-1',
            JSON.stringify(result),
            'EX',
            86400
        );
    });
});
