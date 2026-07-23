import { expect } from '@jest/globals';
import { GET as BiteCardsGET } from '@/app/api/recipes/bite-cards/route';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

jest.mock('@/app/lib/redis', () => ({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    },
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    },
}));

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
    __esModule: true,
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Bite Cards API Route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/recipes/bite-cards', () => {
        it('fetches un-favorited recipes when user is authenticated with favorites', async () => {
            const mockUser = {
                id: 'user-1',
                favoriteIds: ['fav-recipe-1', 'fav-recipe-2'],
            };
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

            const mockRecipes = [
                {
                    id: 'recipe-3',
                    title: 'Delicious Tacos',
                    description: 'Tasty homemade tacos',
                    imageSrc: '/images/tacos.jpg',
                    createdAt: new Date('2026-01-01'),
                    categories: ['Mexican'],
                    method: 'Grill',
                    minutes: 20,
                    numLikes: 15,
                    averageRating: 4.8,
                    ingredients: ['Tortilla', 'Beef'],
                    steps: ['Cook beef', 'Assemble'],
                    extraImages: [],
                    userId: 'user-2',
                    user: { id: 'user-2', name: 'Chef John', image: null },
                },
            ];

            (prisma.recipe.findMany as jest.Mock).mockResolvedValue(
                mockRecipes
            );

            const request = new Request(
                'http://localhost:3000/api/recipes/bite-cards'
            );
            const response = await BiteCardsGET(request);

            expect(response.status).toBe(200);
            const data = await response.json();

            expect(data).toHaveLength(1);
            expect(data[0].id).toBe('recipe-3');
            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        id: {
                            notIn: ['fav-recipe-1', 'fav-recipe-2'],
                        },
                    },
                    orderBy: [
                        { averageRating: 'desc' },
                        { numLikes: 'desc' },
                        { createdAt: 'desc' },
                    ],
                })
            );
        });

        it('fetches high rating recipes when user is not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            const mockRecipes = [
                {
                    id: 'recipe-1',
                    title: 'Paella',
                    description: 'Traditional Spanish Paella',
                    imageSrc: '/images/paella.jpg',
                    createdAt: new Date('2026-01-01'),
                    categories: ['Spanish'],
                    method: 'Stove',
                    minutes: 45,
                    numLikes: 50,
                    averageRating: 4.9,
                    ingredients: ['Rice', 'Saffron'],
                    steps: ['Cook rice'],
                    extraImages: [],
                    userId: 'user-3',
                    user: { id: 'user-3', name: 'Chef Maria', image: null },
                },
            ];

            (prisma.recipe.findMany as jest.Mock).mockResolvedValue(
                mockRecipes
            );

            const request = new Request(
                'http://localhost:3000/api/recipes/bite-cards?limit=10'
            );
            const response = await BiteCardsGET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toHaveLength(1);
            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                })
            );
        });

        it('handles internal errors gracefully', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);
            (prisma.recipe.findMany as jest.Mock).mockRejectedValue(
                new Error('DB failure')
            );

            const request = new Request(
                'http://localhost:3000/api/recipes/bite-cards'
            );
            const response = await BiteCardsGET(request);

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.error).toBe('Failed to fetch bite cards');
        });
    });
});
