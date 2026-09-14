import { describe, it, expect, vi, beforeEach } from 'vitest';
import getTopJorbiters from '@/app/actions/getTopJorbiters';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';

vi.mock('@/app/lib/prismadb', () => ({
    default: {
        user: {
            findMany: vi.fn(),
        },
        recipe: {
            findMany: vi.fn(),
        },
        levelSnapshot: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}));

vi.mock('@/app/lib/redis', () => ({
    redisCache: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

vi.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('getTopJorbiters action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns cached data if available', async () => {
        const cached = [{ id: 'user1', name: 'Cached User' }];
        (redisCache.get as any).mockResolvedValue(JSON.stringify(cached));

        const result = await getTopJorbiters('all');

        expect(redisCache.get).toHaveBeenCalledWith('top_jorbiters');
        expect(result).toEqual(cached);
    });

    it('fetches all time top jorbiters when timeframe is "all"', async () => {
        (redisCache.get as any).mockResolvedValue(null);

        const mockUsers = [
            {
                id: 'user1',
                name: 'User 1',
                image: null,
                level: 10,
                verified: true,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01'),
                badges: [],
            },
        ];

        (prisma.user.findMany as any).mockResolvedValue(mockUsers);
        (prisma.recipe.findMany as any).mockResolvedValue([{ numLikes: 5 }]);

        const result = await getTopJorbiters('all');

        expect(prisma.user.findMany).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('user1');
        expect(result[0].levelDelta).toBe(0);
        expect(redisCache.set).toHaveBeenCalled();
    });

    it('calculates levelDelta correctly for time-scoped timeframe', async () => {
        (redisCache.get as any).mockResolvedValue(null);

        const mockUsers = [
            {
                id: 'user1',
                name: 'User 1',
                image: null,
                level: 15,
                verified: true,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2026-01-01'),
                badges: [],
            },
        ];

        (prisma.levelSnapshot.findMany as any).mockImplementation((args: any) => {
            if (args?.distinct) {
                return Promise.resolve([{ userId: 'user1' }]);
            }
            if (args?.where?.createdAt?.lte) {
                return Promise.resolve([{ userId: 'user1', level: 10 }]);
            }
            return Promise.resolve([]);
        });

        (prisma.user.findMany as any).mockImplementation((args: any) => {
            if (args?.where?.createdAt?.gte) {
                return Promise.resolve([]);
            }
            if (args?.orderBy?.level) {
                return Promise.resolve([{ id: 'user1' }]);
            }
            if (args?.where?.id?.in) {
                return Promise.resolve(mockUsers);
            }
            return Promise.resolve([]);
        });
        (prisma.recipe.findMany as any).mockResolvedValue([]);

        const result = await getTopJorbiters('week');

        expect(redisCache.get).toHaveBeenCalledWith('top_jorbiters_week');
        expect(result[0].levelDelta).toBe(5);
    });
});
