import getRecipes from '@/app/actions/getRecipes';
import getFavoriteRecipes from '@/app/actions/getFavoriteRecipes';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        recipe: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

describe('getRecipes and getFavoriteRecipes Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getRecipes search and cuisine filtering', () => {
        it('should use exact match (equals) instead of contains for recipeCuisine', async () => {
            jest.mocked(prisma.recipe.findMany).mockResolvedValue([]);
            jest.mocked(prisma.recipe.count).mockResolvedValue(0);

            await getRecipes({ recipeCuisine: 'American' });

            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        recipeCuisine: {
                            equals: 'American',
                            mode: 'insensitive',
                        },
                    }),
                })
            );
        });

        it('should search across title, description, and ingredients using OR clause', async () => {
            jest.mocked(prisma.recipe.findMany).mockResolvedValue([]);
            jest.mocked(prisma.recipe.count).mockResolvedValue(0);

            await getRecipes({ search: 'pasta' });

            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: [
                            {
                                title: {
                                    contains: 'pasta',
                                    mode: 'insensitive',
                                },
                            },
                            {
                                description: {
                                    contains: 'pasta',
                                    mode: 'insensitive',
                                },
                            },
                            {
                                ingredients: {
                                    has: 'pasta',
                                },
                            },
                        ],
                    }),
                })
            );
        });
    });

    describe('getFavoriteRecipes search and cuisine filtering', () => {
        it('should use exact match (equals) instead of contains for recipeCuisine', async () => {
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
                favoriteIds: ['recipe-1'],
            } as any);
            jest.mocked(prisma.recipe.findMany).mockResolvedValue([]);
            jest.mocked(prisma.recipe.count).mockResolvedValue(0);

            await getFavoriteRecipes({ recipeCuisine: 'American' });

            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        recipeCuisine: {
                            equals: 'American',
                            mode: 'insensitive',
                        },
                    }),
                })
            );
        });

        it('should search across title, description, and ingredients using OR clause', async () => {
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
                favoriteIds: ['recipe-1'],
            } as any);
            jest.mocked(prisma.recipe.findMany).mockResolvedValue([]);
            jest.mocked(prisma.recipe.count).mockResolvedValue(0);

            await getFavoriteRecipes({ search: 'pasta' });

            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: [
                            {
                                title: {
                                    contains: 'pasta',
                                    mode: 'insensitive',
                                },
                            },
                            {
                                description: {
                                    contains: 'pasta',
                                    mode: 'insensitive',
                                },
                            },
                            {
                                ingredients: {
                                    has: 'pasta',
                                },
                            },
                        ],
                    }),
                })
            );
        });
    });
});
