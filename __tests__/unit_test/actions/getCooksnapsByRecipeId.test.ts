import getCooksnapsByRecipeId from '@/app/actions/getCooksnapsByRecipeId';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        cooksnap: {
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

describe('getCooksnapsByRecipeId Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns cached cooksnaps on redis hit', async () => {
        const mockSafeCooksnaps = [
            {
                id: 'cs1',
                recipeId: 'r1',
                imageSrc: 'https://images.jorbites.com/photo.webp',
                comment: 'Tasty!',
                createdAt: '2026-06-01T12:00:00.000Z',
            },
        ];
        jest.mocked(redisCache.get).mockResolvedValue(
            JSON.stringify(mockSafeCooksnaps)
        );

        const result = await getCooksnapsByRecipeId({ recipeId: 'r1' });

        expect(redisCache.get).toHaveBeenCalledWith('recipe:cooksnaps:r1');
        expect(prisma.cooksnap.findMany).not.toHaveBeenCalled();
        expect(result).toEqual(mockSafeCooksnaps);
    });

    it('queries DB, converts dates to ISO string, and caches on redis miss', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null);
        const mockDbCooksnap = {
            id: 'cs1',
            recipeId: 'r1',
            userId: 'u1',
            imageSrc: 'https://images.jorbites.com/photo.webp',
            comment: 'Tasty!',
            rating: 5,
            likedIds: [],
            createdAt: new Date('2026-06-01T12:00:00.000Z'),
            updatedAt: new Date('2026-06-01T12:00:00.000Z'),
            user: {
                id: 'u1',
                name: 'Chef',
                image: null,
                verified: false,
                level: 2,
                badges: [],
            },
        };

        jest.mocked(prisma.cooksnap.findMany).mockResolvedValue([
            mockDbCooksnap as any,
        ]);

        const result = await getCooksnapsByRecipeId({ recipeId: 'r1' });

        expect(prisma.cooksnap.findMany).toHaveBeenCalledWith({
            where: { recipeId: 'r1' },
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

        expect(result).toEqual([
            {
                ...mockDbCooksnap,
                createdAt: '2026-06-01T12:00:00.000Z',
                updatedAt: '2026-06-01T12:00:00.000Z',
            },
        ]);

        expect(redisCache.set).toHaveBeenCalledWith(
            'recipe:cooksnaps:r1',
            expect.any(String),
            'EX',
            86400
        );
    });

    it('gracefully returns empty array when prisma query fails', async () => {
        jest.mocked(redisCache.get).mockResolvedValue(null);
        jest.mocked(prisma.cooksnap.findMany).mockRejectedValue(
            new Error('DB failure')
        );

        const result = await getCooksnapsByRecipeId({ recipeId: 'r1' });
        expect(result).toEqual([]);
    });
});
