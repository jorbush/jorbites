import getProfileCollections from '@/app/actions/getProfileCollections';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        list: {
            findMany: jest.fn(),
        },
        quest: {
            findMany: jest.fn(),
        },
        planning: {
            findMany: jest.fn(),
        },
    },
}));

describe('getProfileCollections', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty collections when userId is empty', async () => {
        const result = await getProfileCollections({ userId: '' });

        expect(result).toEqual({ lists: [], quests: [], plannings: [] });
        expect(prisma.list.findMany).not.toHaveBeenCalled();
        expect(prisma.quest.findMany).not.toHaveBeenCalled();
        expect(prisma.planning.findMany).not.toHaveBeenCalled();
    });

    it('filters lists and plannings by isPrivate: false when includePrivate is false', async () => {
        const now = new Date('2026-06-01T10:00:00.000Z');

        jest.mocked(prisma.list.findMany).mockResolvedValue([
            {
                id: 'list-1',
                name: 'Public List',
                isPrivate: false,
                isDefault: false,
                userId: 'user-1',
                recipeIds: ['r-1'],
                createdAt: now,
                updatedAt: now,
                user: {
                    id: 'user-1',
                    name: 'Chef',
                    createdAt: now,
                    updatedAt: now,
                    emailVerified: null,
                },
                recipes: [
                    { id: 'r-1', title: 'Pasta', imageSrc: '/pasta.jpg' },
                ],
            },
        ] as any);

        jest.mocked(prisma.quest.findMany).mockResolvedValue([
            {
                id: 'quest-1',
                title: 'Need Ramen Recipe',
                description: 'Looking for tonkotsu',
                status: 'open',
                userId: 'user-1',
                acceptedRecipeId: null,
                acceptedSolverId: null,
                badgeEvaluated: false,
                createdAt: now,
                updatedAt: now,
                user: {
                    id: 'user-1',
                    name: 'Chef',
                    createdAt: now,
                    updatedAt: now,
                    emailVerified: null,
                },
                recipes: [],
            },
        ] as any);

        jest.mocked(prisma.planning.findMany).mockResolvedValue([
            {
                id: 'plan-1',
                name: 'Summer Plan',
                description: 'Light meals',
                isPrivate: false,
                userId: 'user-1',
                createdAt: now,
                updatedAt: now,
                user: {
                    id: 'user-1',
                    name: 'Chef',
                    createdAt: now,
                    updatedAt: now,
                    emailVerified: null,
                },
                meals: [],
            },
        ] as any);

        const result = await getProfileCollections({
            userId: 'user-1',
            includePrivate: false,
        });

        expect(prisma.list.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 'user-1', isPrivate: false },
                select: expect.objectContaining({
                    user: { select: { id: true, name: true, image: true } },
                    recipes: {
                        select: { id: true, title: true, imageSrc: true },
                        take: 4,
                    },
                }),
            })
        );
        expect(prisma.planning.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 'user-1', isPrivate: false },
                select: expect.objectContaining({
                    user: { select: { id: true, name: true, image: true } },
                    meals: {
                        select: expect.objectContaining({
                            recipe: {
                                select: {
                                    id: true,
                                    title: true,
                                    imageSrc: true,
                                },
                            },
                        }),
                    },
                }),
            })
        );
        expect(prisma.quest.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 'user-1' },
                select: expect.objectContaining({
                    user: { select: { id: true, name: true, image: true } },
                    recipes: expect.objectContaining({
                        select: { id: true, title: true, imageSrc: true },
                    }),
                }),
            })
        );

        expect(result.lists).toHaveLength(1);
        expect(result.lists[0].createdAt).toBe(now.toISOString());
        expect(result.quests).toHaveLength(1);
        expect(result.quests[0].createdAt).toBe(now.toISOString());
        expect(result.plannings).toHaveLength(1);
        expect(result.plannings[0].createdAt).toBe(now.toISOString());
    });

    it('includes private lists and plannings when includePrivate is true', async () => {
        jest.mocked(prisma.list.findMany).mockResolvedValue([]);
        jest.mocked(prisma.quest.findMany).mockResolvedValue([]);
        jest.mocked(prisma.planning.findMany).mockResolvedValue([]);

        await getProfileCollections({
            userId: 'user-1',
            includePrivate: true,
        });

        expect(prisma.list.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 'user-1' },
            })
        );
        expect(prisma.planning.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 'user-1' },
            })
        );
    });

    it('skips querying disabled collection categories', async () => {
        const result = await getProfileCollections({
            userId: 'user-1',
            includeLists: false,
            includeQuests: false,
            includePlannings: false,
        });

        expect(result).toEqual({ lists: [], quests: [], plannings: [] });
        expect(prisma.list.findMany).not.toHaveBeenCalled();
        expect(prisma.quest.findMany).not.toHaveBeenCalled();
        expect(prisma.planning.findMany).not.toHaveBeenCalled();
    });

    it('returns empty collections if Prisma throws an error', async () => {
        jest.mocked(prisma.list.findMany).mockRejectedValue(
            new Error('DB failure')
        );

        const result = await getProfileCollections({ userId: 'user-1' });

        expect(result).toEqual({ lists: [], quests: [], plannings: [] });
    });
});
