import getRecipeRemixes from '@/app/actions/getRecipeRemixes';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        recipe: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('@/app/lib/redis', () => ({
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
    },
}));

describe('getRecipeRemixes Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty array when recipeId is missing', async () => {
        const result = await getRecipeRemixes({});
        expect(result).toEqual([]);
        expect(redisCache.get).not.toHaveBeenCalled();
        expect(prisma.recipe.findMany).not.toHaveBeenCalled();
    });

    it('returns cached remixes on redis cache hit', async () => {
        const mockSafeRemixes = [
            {
                id: 'remix-1',
                title: 'Remix of Tacos',
                forkedFromRecipeId: 'parent-1',
                createdAt: '2026-06-01T12:00:00.000Z',
            },
        ];
        jest.mocked(redisCache.get).mockResolvedValue(
            JSON.stringify(mockSafeRemixes)
        );

        const result = await getRecipeRemixes({ recipeId: 'parent-1' });

        expect(redisCache.get).toHaveBeenCalledWith('recipe:remixes:parent-1');
        expect(prisma.recipe.findMany).not.toHaveBeenCalled();
        expect(result).toEqual(mockSafeRemixes);
    });

    it('queries database, serializes via toSafeRecipe, and caches on redis miss', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null);
        const mockDbRemix = {
            id: 'remix-1',
            title: 'Remix of Tacos',
            description: 'Spicier version',
            imageSrc: 'https://img.test/remix.jpg',
            forkedFromRecipeId: 'parent-1',
            createdAt: new Date('2026-06-01T12:00:00.000Z'),
            categories: ['Mexican'],
            method: 'Grill',
            minutes: 20,
            numLikes: 2,
            ingredients: ['Tortilla', 'Salsa'],
            steps: ['Assemble'],
            extraImages: [],
            userId: 'user-2',
            coCooksIds: [],
            linkedRecipeIds: [],
            listIds: [],
            youtubeUrl: null,
            questId: null,
            averageRating: 0,
            ratingCount: 0,
            calories: null,
            recipeCuisine: null,
            recipeYield: null,
            prepTime: null,
            cookTime: null,
            ganttTable: null,
            user: {
                id: 'user-2',
                name: 'TacoLover',
                image: null,
                verified: false,
                level: 2,
                badges: [],
            },
        };

        jest.mocked(prisma.recipe.findMany).mockResolvedValue([
            mockDbRemix,
        ] as any);

        const result = await getRecipeRemixes({ recipeId: 'parent-1' });

        expect(prisma.recipe.findMany).toHaveBeenCalledWith({
            where: {
                forkedFromRecipeId: 'parent-1',
            },
            take: 20,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        verified: true,
                        level: true,
                        badges: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        expect(result[0].id).toBe('remix-1');
        expect(result[0].createdAt).toBe('2026-06-01T12:00:00.000Z');
        expect(redisCache.set).toHaveBeenCalledWith(
            'recipe:remixes:parent-1',
            expect.any(String),
            'EX',
            86400
        );
    });
});
