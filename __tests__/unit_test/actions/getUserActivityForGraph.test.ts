import getUserActivityForGraph, {
    invalidateUserActivityCache,
} from '@/app/actions/getUserActivityForGraph';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        recipe: {
            findMany: jest.fn(),
        },
        comment: {
            findMany: jest.fn(),
        },
        cooksnap: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('@/app/lib/redis', () => ({
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    },
}));

describe('getUserActivityForGraph Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty lists when userId is not provided', async () => {
        const result = await getUserActivityForGraph({});
        expect(result).toEqual({
            recipes: [],
            comments: [],
            challengeSubmissions: [],
        });
    });

    it('returns cached data if available in redis', async () => {
        const cached = {
            recipes: [{ id: 'r1', createdAt: '2026-01-01T00:00:00.000Z' }],
            comments: [
                {
                    id: 'c1',
                    createdAt: '2026-01-02T00:00:00.000Z',
                    isCooked: true,
                    rating: 5,
                },
            ],
            challengeSubmissions: [],
        };

        jest.mocked(redisCache.get).mockResolvedValue(
            JSON.stringify(cached) as any
        );

        const result = await getUserActivityForGraph({ userId: 'user-1' });

        expect(result).toEqual(cached);
        expect(prisma.recipe.findMany).not.toHaveBeenCalled();
    });

    it('queries prisma with 1-year date filter and formats data when cache misses', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null as any);

        const date1 = new Date('2026-03-01T12:00:00.000Z');
        const date2 = new Date('2026-03-02T15:00:00.000Z');
        const date3 = new Date('2026-03-03T10:00:00.000Z');
        const date4 = new Date('2026-03-04T11:00:00.000Z');

        jest.mocked(prisma.recipe.findMany).mockResolvedValueOnce([
            { id: 'rec-1', createdAt: date1, questId: null },
            { id: 'cs-1', createdAt: date3, questId: 'quest-123' },
        ] as any);

        jest.mocked(prisma.comment.findMany).mockResolvedValueOnce([
            {
                id: 'com-1',
                createdAt: date2,
                isCooked: false,
                rating: 4,
            },
        ] as any);

        jest.mocked(prisma.cooksnap.findMany).mockResolvedValueOnce([
            {
                id: 'cooksnap-1',
                createdAt: date4,
                rating: 5,
            },
        ] as any);

        const result = await getUserActivityForGraph({ userId: 'user-1' });

        expect(result.recipes).toEqual([
            { id: 'rec-1', createdAt: date1.toISOString(), questId: null },
            {
                id: 'cs-1',
                createdAt: date3.toISOString(),
                questId: 'quest-123',
            },
        ]);
        expect(result.comments).toEqual([
            {
                id: 'com-1',
                createdAt: date2.toISOString(),
                isCooked: false,
                rating: 4,
            },
            {
                id: 'cooksnap-1',
                createdAt: date4.toISOString(),
                isCooked: true,
                rating: 5,
            },
        ]);
        // Derived from recipes with questId
        expect(result.challengeSubmissions).toEqual([
            { id: 'cs-1', createdAt: date3.toISOString() },
        ]);
        expect(redisCache.set).toHaveBeenCalled();
    });

    it('handles database errors gracefully and returns empty arrays', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null as any);
        jest.mocked(prisma.recipe.findMany).mockRejectedValue(
            new Error('DB failure')
        );

        const result = await getUserActivityForGraph({ userId: 'user-error' });
        expect(result).toEqual({
            recipes: [],
            comments: [],
            challengeSubmissions: [],
        });
    });

    it('invalidates both activity and graph recipe redis keys', async () => {
        await invalidateUserActivityCache('user-1');

        expect(redisCache.del).toHaveBeenCalledWith(
            'user:activity:graph:user-1'
        );
        expect(redisCache.del).toHaveBeenCalledWith('recipes:graph:user-1');
    });
});
