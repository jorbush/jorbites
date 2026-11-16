import getQuests from '@/app/actions/getQuests';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        quest: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

describe('getQuests Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('filters quests by search query across title and description', async () => {
        const now = new Date('2026-01-01T00:00:00.000Z');
        jest.mocked(prisma.quest.findMany).mockResolvedValue([
            {
                id: 'quest-1',
                title: 'Sourdough Bread',
                description: 'Need a recipe',
                status: 'open',
                createdAt: now,
                updatedAt: now,
                user: { id: 'u1', name: 'Chef', image: null, verified: false },
                recipes: [],
            },
        ] as any);
        jest.mocked(prisma.quest.count).mockResolvedValue(1);

        const result = await getQuests({
            status: 'open',
            search: '  sourdough ',
            page: 1,
            limit: 10,
        });

        expect(prisma.quest.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    status: 'open',
                    OR: [
                        {
                            title: {
                                contains: 'sourdough',
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: 'sourdough',
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            })
        );
        expect(prisma.quest.count).toHaveBeenCalledWith({
            where: {
                status: 'open',
                OR: [
                    {
                        title: {
                            contains: 'sourdough',
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: 'sourdough',
                            mode: 'insensitive',
                        },
                    },
                ],
            },
        });
        expect(result.error).toBeNull();
        expect(result.data?.totalQuests).toBe(1);
    });

    it('does not add OR search filter when search is blank', async () => {
        jest.mocked(prisma.quest.findMany).mockResolvedValue([]);
        jest.mocked(prisma.quest.count).mockResolvedValue(0);

        await getQuests({
            search: '   ',
            page: 1,
            limit: 10,
        });

        expect(prisma.quest.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {},
            })
        );
    });
});
