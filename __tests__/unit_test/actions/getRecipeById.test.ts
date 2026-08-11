import getRecipeById from '@/app/actions/getRecipeById';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        recipe: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('@/app/lib/redis', () => ({
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
    },
}));

describe('getRecipeById Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return cached recipe on redis hit', async () => {
        const mockSafeRecipe = { id: 'r1', title: 'Cached Paella' };
        jest.mocked(redisCache.get).mockResolvedValue(
            JSON.stringify(mockSafeRecipe)
        );

        const result = await getRecipeById({ recipeId: 'r1' });

        expect(redisCache.get).toHaveBeenCalledWith('recipe:r1');
        expect(prisma.recipe.findUnique).not.toHaveBeenCalled();
        expect(result).toEqual(mockSafeRecipe);
    });

    it('should return null when recipe is not found in database', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null);
        jest.mocked(prisma.recipe.findUnique).mockResolvedValue(null);

        const result = await getRecipeById({ recipeId: 'missing' });

        expect(result).toBeNull();
    });

    it('should query DB, convert to safe recipe, and cache result on miss', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null);
        const mockDbRecipe = {
            id: 'r1',
            title: 'Fresh Tacos',
            createdAt: new Date('2026-06-01T12:00:00.000Z'),
            user: { id: 'u1', name: 'Chef' },
        };
        jest.mocked(prisma.recipe.findUnique).mockResolvedValue(
            mockDbRecipe as any
        );

        const result = await getRecipeById({ recipeId: 'r1' });

        expect(result).not.toBeNull();
        expect(result.id).toBe('r1');
        expect(result.createdAt).toBe('2026-06-01T12:00:00.000Z');
        expect(redisCache.set).toHaveBeenCalledWith(
            'recipe:r1',
            JSON.stringify(result),
            'EX',
            86400
        );
    });

    it('should rethrow error when database query fails', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null);
        jest.mocked(prisma.recipe.findUnique).mockRejectedValue(
            new Error('DB failure')
        );

        await expect(getRecipeById({ recipeId: 'r1' })).rejects.toThrow();
    });
});
