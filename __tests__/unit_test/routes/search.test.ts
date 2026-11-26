import { expect } from '@jest/globals';
import { GET as SearchGET } from '@/app/api/search/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

const mockUser = {
    id: 'test-user-id',
    name: 'test',
    email: 'test@a.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
    },
    recipe: {
        findMany: jest.fn().mockResolvedValue([]),
    },
}));

import prisma from '@/app/lib/prismadb';

// This mocks our custom helper function to avoid passing authOptions around
jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

// This mocks calls to getServerSession
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

describe('Search API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        if (mockedSession?.user?.email) {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        } else {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        }
    });

    describe('GET /api/search', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const mockRequest = {
                url: 'http://localhost:3000/api/search?q=test',
            } as Request;

            const response = await SearchGET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('User authentication required to search');
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return empty results when query is too short', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                url: 'http://localhost:3000/api/search?q=a',
            } as Request;

            const response = await SearchGET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ users: [], recipes: [] });
        });

        it('should return empty results when no query provided', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                url: 'http://localhost:3000/api/search',
            } as Request;

            const response = await SearchGET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ users: [], recipes: [] });
        });

        it('should search successfully when user is authenticated and query is valid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                url: 'http://localhost:3000/api/search?q=test%20query',
            } as Request;

            const response = await SearchGET(mockRequest);

            expect(response.status).toBe(200);
        });

        it('should filter recipes by difficulty, dietaryTags, and excludeAllergens without a text query', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                url: 'http://localhost:3000/api/search?type=recipes&difficulty=Easy&dietaryTags=meal-prep,one-pot&excludeAllergens=gluten,milk',
            } as Request;

            const response = await SearchGET(mockRequest);

            expect(response.status).toBe(200);
            expect(prisma.user.findMany).not.toHaveBeenCalled();
            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        difficulty: { equals: 'Easy', mode: 'insensitive' },
                        dietaryTags: { hasEvery: ['meal-prep', 'one-pot'] },
                        NOT: { allergens: { hasSome: ['gluten', 'milk'] } },
                    },
                    select: expect.objectContaining({
                        calories: true,
                        protein: true,
                        carbohydrates: true,
                        fat: true,
                        fiber: true,
                        allergens: true,
                        dietaryTags: true,
                        difficulty: true,
                    }),
                    take: 12,
                })
            );
        });

        it('should combine search query and quick filters for recipes', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                url: 'http://localhost:3000/api/search?q=Soup&type=recipes&dietaryTags=budget-friendly',
            } as Request;

            const response = await SearchGET(mockRequest);

            expect(response.status).toBe(200);
            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        title: { contains: 'Soup', mode: 'insensitive' },
                        dietaryTags: { hasEvery: ['budget-friendly'] },
                    },
                })
            );
        });

        it('should filter recipes by remaining macro budget params and apply orderBy without a text query', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                url: 'http://localhost:3000/api/search?type=recipes&maxCalories=500&minProtein=35&maxCarbohydrates=40&maxFat=20&orderBy=highest_protein',
            } as Request;

            const response = await SearchGET(mockRequest);

            expect(response.status).toBe(200);
            expect(prisma.user.findMany).not.toHaveBeenCalled();
            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        calories: { lte: 500 },
                        protein: { gte: 35 },
                        carbohydrates: { lte: 40 },
                        fat: { lte: 20 },
                    },
                    orderBy: [{ protein: 'desc' }, { id: 'asc' }],
                    take: 12,
                })
            );
        });
    });
});
