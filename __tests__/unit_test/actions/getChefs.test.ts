import getChefs, { ChefOrderByType } from '@/app/actions/getChefs';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
        recipe: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('@/app/lib/redis', () => ({
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
    },
}));

describe('getChefs Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return cached data on redis hit', async () => {
        const cachedResponse = {
            data: {
                chefs: [{ id: 'chef-1', name: 'Cache Chef' }],
                totalChefs: 1,
                totalPages: 1,
                currentPage: 1,
            },
        };
        jest.mocked(redisCache.get).mockResolvedValue(
            JSON.stringify(cachedResponse)
        );

        const result = await getChefs({});

        expect(redisCache.get).toHaveBeenCalled();
        expect(prisma.user.findMany).not.toHaveBeenCalled();
        expect(result).toEqual(cachedResponse);
    });

    it('should query DB, enrich chef stats, sort, and cache on redis miss', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null);

        const mockUsers = [
            {
                id: 'chef-1',
                name: 'Chef One',
                image: 'chef1.jpg',
                level: 5,
                verified: true,
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                updatedAt: new Date('2026-01-01T00:00:00.000Z'),
                badges: ['badge1'],
            },
        ];

        const mockRecipes = [
            {
                userId: 'chef-1',
                numLikes: 10,
                createdAt: new Date('2026-08-01T00:00:00.000Z'),
                minutes: 30,
                categories: ['Italian', 'Pasta'],
            },
        ];

        jest.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
        jest.mocked(prisma.user.count).mockResolvedValue(1);
        jest.mocked(prisma.recipe.findMany).mockResolvedValue(
            mockRecipes as any
        );

        const result = await getChefs({
            search: 'One',
            orderBy: ChefOrderByType.MOST_LIKED,
        });

        expect(prisma.user.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { name: { contains: 'One', mode: 'insensitive' } },
            })
        );

        expect(result.data).not.toBeNull();
        expect(result.data?.chefs[0].likesReceived).toBe(10);
        expect(result.data?.chefs[0].recipeCount).toBe(1);
        expect(redisCache.set).toHaveBeenCalled();
    });

    it('should return error response when DB query fails', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null);
        jest.mocked(prisma.user.findMany).mockRejectedValue(
            new Error('DB failure')
        );

        const result = await getChefs({});

        expect(result.data).toBeNull();
        expect(result.error?.message).toBe('Failed to fetch chefs');
    });
});
