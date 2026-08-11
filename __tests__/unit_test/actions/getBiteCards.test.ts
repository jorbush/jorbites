import getBiteCards from '@/app/actions/getBiteCards';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        recipe: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe('getBiteCards Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches candidate recipes excluding favorited and custom excluded IDs', async () => {
        const mockUser = {
            id: 'user-1',
            favoriteIds: ['fav-1'],
        };
        jest.mocked(getCurrentUser).mockResolvedValue(mockUser as any);

        const mockCandidateRecipes = [
            {
                id: 'recipe-10',
                title: 'Paella Valeciana',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
            },
        ];
        jest.mocked(prisma.recipe.findMany).mockResolvedValue(
            mockCandidateRecipes as any
        );

        const result = await getBiteCards({
            limit: 10,
            excludeIds: ['exclude-1'],
        });

        expect(prisma.recipe.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: {
                        notIn: expect.arrayContaining(['fav-1', 'exclude-1']),
                    },
                },
            })
        );
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('recipe-10');
        expect(result[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
    });

    it('re-throws when database query fails', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue(null);
        jest.mocked(prisma.recipe.findMany).mockRejectedValue(
            new Error('DB Failure')
        );

        await expect(getBiteCards()).rejects.toThrow('DB Failure');
    });
});
