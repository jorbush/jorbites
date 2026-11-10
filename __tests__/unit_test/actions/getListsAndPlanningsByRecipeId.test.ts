import getListsAndPlanningsByRecipeId from '@/app/actions/getListsAndPlanningsByRecipeId';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { invalidateRecipeInclusionsCache } from '@/app/lib/recipeInclusionsCache';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        list: {
            findMany: jest.fn(),
        },
        planning: {
            findMany: jest.fn(),
        },
        quest: {
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

describe('getListsAndPlanningsByRecipeId Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty lists, plannings, and quests when recipeId is missing', async () => {
        const result = await getListsAndPlanningsByRecipeId({ recipeId: '' });
        expect(result).toEqual({ lists: [], plannings: [], quests: [] });
        expect(redisCache.get).not.toHaveBeenCalled();
        expect(prisma.list.findMany).not.toHaveBeenCalled();
        expect(prisma.planning.findMany).not.toHaveBeenCalled();
        expect(prisma.quest.findMany).not.toHaveBeenCalled();
    });

    it('returns cached public inclusions on Redis public cache hit without querying DB', async () => {
        const mockPublicCached = {
            lists: [
                {
                    id: 'list-1',
                    name: 'Summer Favorites',
                    isPrivate: false,
                    isDefault: false,
                    userId: 'user-1',
                    createdAt: '2026-06-01T12:00:00.000Z',
                    updatedAt: '2026-06-01T12:00:00.000Z',
                    recipes: [
                        {
                            id: 'recipe-1',
                            title: 'Tacos',
                            imageSrc: 'taco.jpg',
                        },
                    ],
                },
            ],
            plannings: [
                {
                    id: 'plan-1',
                    name: 'Healthy Week',
                    isPrivate: false,
                    userId: 'user-1',
                    createdAt: '2026-06-01T12:00:00.000Z',
                    updatedAt: '2026-06-01T12:00:00.000Z',
                    meals: [],
                },
            ],
            quests: [
                {
                    id: 'quest-1',
                    title: 'Best Taco Recipe',
                    description: 'Need a great taco',
                    status: 'completed',
                    userId: 'user-1',
                    createdAt: '2026-06-01T12:00:00.000Z',
                    updatedAt: '2026-06-01T12:00:00.000Z',
                    acceptedRecipeId: 'recipe-1',
                },
            ],
        };

        jest.mocked(redisCache.get).mockResolvedValue(
            JSON.stringify(mockPublicCached)
        );

        const result = await getListsAndPlanningsByRecipeId({
            recipeId: 'recipe-1',
        });

        expect(redisCache.get).toHaveBeenCalledWith(
            'recipe:inclusions:public:recipe-1'
        );
        expect(prisma.list.findMany).not.toHaveBeenCalled();
        expect(prisma.planning.findMany).not.toHaveBeenCalled();
        expect(prisma.quest.findMany).not.toHaveBeenCalled();
        expect(result).toEqual(mockPublicCached);
    });

    it('queries database for public items on cache miss and sets Redis cache', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null);

        const mockDbList = {
            id: 'list-public-1',
            name: 'Quick Dinners',
            isPrivate: false,
            isDefault: false,
            userId: 'user-1',
            createdAt: new Date('2026-06-01T12:00:00.000Z'),
            updatedAt: new Date('2026-06-01T12:00:00.000Z'),
            user: {
                id: 'user-1',
                name: 'Chef Alex',
                image: null,
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                updatedAt: new Date('2026-01-01T00:00:00.000Z'),
                emailVerified: null,
            },
            recipes: [
                {
                    id: 'recipe-1',
                    title: 'Pasta Primavera',
                    imageSrc: 'pasta.jpg',
                },
            ],
        };

        const mockDbPlanning = {
            id: 'plan-public-1',
            name: 'Mediterranean Week',
            description: 'Easy weekday plan',
            isPrivate: false,
            userId: 'user-2',
            createdAt: new Date('2026-06-02T12:00:00.000Z'),
            updatedAt: new Date('2026-06-02T12:00:00.000Z'),
            user: {
                id: 'user-2',
                name: 'Chef Maria',
                image: null,
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                updatedAt: new Date('2026-01-01T00:00:00.000Z'),
                emailVerified: null,
            },
            meals: [],
        };

        const mockDbQuest = {
            id: 'quest-public-1',
            title: 'Need Pasta Ideas',
            description: 'Looking for easy vegetarian pasta',
            status: 'completed',
            acceptedRecipeId: 'recipe-1',
            userId: 'user-3',
            createdAt: new Date('2026-06-03T12:00:00.000Z'),
            updatedAt: new Date('2026-06-03T12:00:00.000Z'),
            user: {
                id: 'user-3',
                name: 'Chef Sam',
                image: null,
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                updatedAt: new Date('2026-01-01T00:00:00.000Z'),
                emailVerified: null,
            },
            recipes: [
                {
                    id: 'recipe-1',
                    title: 'Pasta Primavera',
                    imageSrc: 'pasta.jpg',
                },
            ],
        };

        jest.mocked(prisma.list.findMany).mockResolvedValue([
            mockDbList,
        ] as any);
        jest.mocked(prisma.planning.findMany).mockResolvedValue([
            mockDbPlanning,
        ] as any);
        jest.mocked(prisma.quest.findMany).mockResolvedValue([
            mockDbQuest,
        ] as any);

        const result = await getListsAndPlanningsByRecipeId({
            recipeId: 'recipe-1',
        });

        expect(prisma.list.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    isPrivate: false,
                    recipeIds: { has: 'recipe-1' },
                },
            })
        );
        expect(prisma.planning.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    isPrivate: false,
                    meals: { some: { recipeId: 'recipe-1' } },
                },
            })
        );
        expect(prisma.quest.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    OR: [
                        { acceptedRecipeId: 'recipe-1' },
                        { recipes: { some: { id: 'recipe-1' } } },
                    ],
                },
            })
        );

        expect(result.lists.length).toBe(1);
        expect(result.lists[0].id).toBe('list-public-1');
        expect(result.plannings.length).toBe(1);
        expect(result.plannings[0].id).toBe('plan-public-1');
        expect(result.quests.length).toBe(1);
        expect(result.quests[0].id).toBe('quest-public-1');

        expect(redisCache.set).toHaveBeenCalledWith(
            'recipe:inclusions:public:recipe-1',
            expect.any(String),
            'EX',
            86400
        );
    });

    it('queries and merges user private items when userId is provided', async () => {
        // Cache misses for both public and user
        jest.mocked(redisCache.get).mockResolvedValue(null);

        const mockDbPublicList = {
            id: 'list-pub',
            name: 'Community List',
            isPrivate: false,
            userId: 'other-user',
            createdAt: new Date('2026-06-01T00:00:00.000Z'),
            updatedAt: new Date('2026-06-01T00:00:00.000Z'),
            recipes: [],
        };

        const mockDbPrivateList = {
            id: 'list-priv',
            name: 'My Secret List',
            isPrivate: true,
            userId: 'user-me',
            createdAt: new Date('2026-06-02T00:00:00.000Z'),
            updatedAt: new Date('2026-06-02T00:00:00.000Z'),
            recipes: [],
        };

        // 1st list findMany is public, 2nd is user's private
        jest.mocked(prisma.list.findMany)
            .mockResolvedValueOnce([mockDbPublicList] as any)
            .mockResolvedValueOnce([mockDbPrivateList] as any);

        // Planning calls: both empty for this test
        jest.mocked(prisma.planning.findMany)
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        // Quest call: empty for this test
        jest.mocked(prisma.quest.findMany).mockResolvedValueOnce([]);

        const result = await getListsAndPlanningsByRecipeId({
            recipeId: 'recipe-1',
            userId: 'user-me',
        });

        expect(result.lists.length).toBe(2);
        expect(result.lists.map((l) => l.id)).toEqual([
            'list-pub',
            'list-priv',
        ]);
        expect(redisCache.set).toHaveBeenCalledWith(
            'recipe:inclusions:user:recipe-1:user-me',
            expect.any(String),
            'EX',
            86400
        );
    });

    it('invalidates both public and user-specific caches correctly', async () => {
        await invalidateRecipeInclusionsCache('recipe-1', 'user-123');

        expect(redisCache.del).toHaveBeenCalledWith(
            'recipe:inclusions:public:recipe-1'
        );
        expect(redisCache.del).toHaveBeenCalledWith(
            'recipe:inclusions:user:recipe-1:user-123'
        );
    });
});
