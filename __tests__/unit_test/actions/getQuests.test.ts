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

describe('getQuests Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('filters quests by status and search query across title and description', async () => {
        jest.mocked(prisma.quest.findMany).mockResolvedValue([]);
        jest.mocked(prisma.quest.count).mockResolvedValue(0);

        const result = await getQuests({
            status: 'open',
            search: '  paella  ',
            page: 1,
            limit: 10,
        });

        expect(result.error).toBeNull();
        expect(prisma.quest.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    status: 'open',
                    OR: [
                        {
                            title: {
                                contains: 'paella',
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: 'paella',
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
                            contains: 'paella',
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: 'paella',
                            mode: 'insensitive',
                        },
                    },
                ],
            },
        });
    });

    it('ignores blank search queries', async () => {
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
