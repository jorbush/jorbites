import getRecipes from '@/app/actions/getRecipes';
import getFavoriteRecipes from '@/app/actions/getFavoriteRecipes';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { OrderByType } from '@/app/utils/filter';

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
        jest.mocked(prisma.recipe.findMany).mockResolvedValue([]);
        jest.mocked(prisma.recipe.count).mockResolvedValue(0);
    });

    describe('getRecipes filtering and sorting', () => {
        it('should use exact match (equals) instead of contains for recipeCuisine', async () => {
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

        it('should filter by difficulty, dietaryTags, excluded allergens, and macros', async () => {
            await getRecipes({
                difficulty: 'Easy',
                dietaryTags: 'vegan,one-pot',
                excludeAllergens: 'gluten,milk',
                minProtein: '25',
                maxCarbohydrates: '45',
                maxFat: '20',
                orderBy: OrderByType.HIGHEST_PROTEIN,
            });

            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        difficulty: {
                            equals: 'Easy',
                            mode: 'insensitive',
                        },
                        dietaryTags: {
                            hasEvery: ['vegan', 'one-pot'],
                        },
                        NOT: {
                            allergens: {
                                hasSome: ['gluten', 'milk'],
                            },
                        },
                        protein: { gte: 25 },
                        carbohydrates: { lte: 45 },
                        fat: { lte: 20 },
                    }),
                    orderBy: [{ protein: 'desc' }, { id: 'asc' }],
                })
            );
        });

        it('should exclude null calories when sorting by LOWEST_CALORIES', async () => {
            await getRecipes({
                orderBy: OrderByType.LOWEST_CALORIES,
            });

            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        calories: { not: null, isSet: true },
                    }),
                    orderBy: [{ calories: 'asc' }, { id: 'asc' }],
                })
            );
        });
    });

    describe('getFavoriteRecipes filtering and sorting', () => {
        beforeEach(() => {
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
                favoriteIds: ['recipe-1', 'recipe-2'],
            } as any);
        });

        it('should use exact match (equals) instead of contains for recipeCuisine', async () => {
            await getFavoriteRecipes({ recipeCuisine: 'American' });

            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        id: { in: ['recipe-1', 'recipe-2'] },
                        recipeCuisine: {
                            equals: 'American',
                            mode: 'insensitive',
                        },
                    }),
                })
            );
        });

        it('should filter favorite recipes by difficulty, dietaryTags, excluded allergens, and macros', async () => {
            await getFavoriteRecipes({
                difficulty: 'Medium',
                dietaryTags: 'mediterranean,spicy',
                excludeAllergens: 'peanuts,soy',
                minProtein: 30,
                orderBy: OrderByType.LOWEST_CALORIES,
            });

            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        id: { in: ['recipe-1', 'recipe-2'] },
                        difficulty: {
                            equals: 'Medium',
                            mode: 'insensitive',
                        },
                        dietaryTags: {
                            hasEvery: ['mediterranean', 'spicy'],
                        },
                        NOT: {
                            allergens: {
                                hasSome: ['peanuts', 'soy'],
                            },
                        },
                        protein: { gte: 30 },
                        calories: { not: null, isSet: true },
                    }),
                    orderBy: [{ calories: 'asc' }, { id: 'asc' }],
                })
            );
        });
    });
});
