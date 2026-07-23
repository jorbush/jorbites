import { describe, it, expect, vi, beforeEach } from 'vitest';
import getRecipes from '@/app/actions/getRecipes';
import getFavoriteRecipes from '@/app/actions/getFavoriteRecipes';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

vi.mock('@/app/actions/getCurrentUser');
vi.mock('@/app/lib/prismadb', () => ({
    default: {
        recipe: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}));

describe('getRecipes and getFavoriteRecipes Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getRecipes cuisine filtering', () => {
        it('should use exact match (equals) instead of contains for recipeCuisine', async () => {
            vi.mocked(prisma.recipe.findMany).mockResolvedValue([]);
            vi.mocked(prisma.recipe.count).mockResolvedValue(0);

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
    });

    describe('getFavoriteRecipes cuisine filtering', () => {
        it('should use exact match (equals) instead of contains for recipeCuisine', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
                favoriteIds: ['recipe-1'],
            } as any);
            vi.mocked(prisma.recipe.findMany).mockResolvedValue([]);
            vi.mocked(prisma.recipe.count).mockResolvedValue(0);

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
    });
});
