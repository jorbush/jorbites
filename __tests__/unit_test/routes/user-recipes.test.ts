import { expect } from '@jest/globals';
import { GET } from '@/app/api/user/[userId]/recipes/route';

// Mock prisma
jest.mock('@/app/lib/prismadb', () => ({
    recipe: {
        findMany: jest.fn(),
    },
}));

// Mock getCurrentUser
jest.mock('@/app/actions/getCurrentUser');

// Mock recipeBookRatelimit
jest.mock('@/app/lib/ratelimit', () => ({
    recipeBookRatelimit: {
        limit: jest.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { recipeBookRatelimit } from '@/app/lib/ratelimit';

describe('User Recipes API Route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default to logged-in user to keep existing tests passing
        (getCurrentUser as jest.Mock).mockResolvedValue({
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
        });
    });

    it('should return all recipes for a user successfully', async () => {
        const mockRecipes = [
            {
                id: 'recipe-1',
                title: 'Scrambled Eggs',
                description: 'Simple and fluffy eggs',
                imageSrc: '/eggs.jpg',
                createdAt: new Date('2026-01-01T12:00:00Z'),
                categories: ['Breakfast'],
                method: 'Pan',
                minutes: 5,
                ingredients: ['2 eggs', '1 tbsp butter'],
                steps: ['Whisk eggs', 'Cook in pan'],
                userId: 'user-123',
            },
            {
                id: 'recipe-2',
                title: 'Fruit Salad',
                description: 'Refreshing summer salad',
                imageSrc: '/fruits.jpg',
                createdAt: new Date('2026-01-02T12:00:00Z'),
                categories: ['Desserts', 'Salad'],
                method: 'No-cook',
                minutes: 10,
                ingredients: ['1 apple', '1 banana', 'berries'],
                steps: ['Chop fruits', 'Mix in bowl'],
                userId: 'user-123',
            },
        ];

        (prisma.recipe.findMany as jest.Mock).mockResolvedValueOnce(
            mockRecipes
        );

        const response = await GET({} as Request, {
            params: Promise.resolve({ userId: 'user-123' }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(prisma.recipe.findMany).toHaveBeenCalledWith({
            where: { userId: 'user-123' },
            orderBy: { createdAt: 'asc' },
        });
        expect(data).toHaveLength(2);
        expect(data[0].id).toBe('recipe-1');
        expect(data[0].createdAt).toBe('2026-01-01T12:00:00.000Z');
        expect(data[1].id).toBe('recipe-2');
    });

    it('should return 400 bad request if userId is missing or invalid', async () => {
        const response = await GET({} as Request, {
            params: Promise.resolve({ userId: undefined }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'User ID is required and must be a valid string'
        );
        expect(data.code).toBe('INVALID_INPUT');
        expect(data.timestamp).toBeDefined();
        expect(prisma.recipe.findMany).not.toHaveBeenCalled();
    });

    it('should return 500 internal server error when database operation fails', async () => {
        (prisma.recipe.findMany as jest.Mock).mockRejectedValueOnce(
            new Error('Database disconnect error')
        );

        const response = await GET({} as Request, {
            params: Promise.resolve({ userId: 'user-123' }),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch recipes');
        expect(data.code).toBe('INTERNAL_SERVER_ERROR');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 401 unauthorized when user is not logged in', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValueOnce(null);

        const response = await GET({} as Request, {
            params: Promise.resolve({ userId: 'user-123' }),
        });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'You must be logged in to view all the recipes of a user (yours)'
        );
        expect(data.code).toBe('UNAUTHORIZED');
        expect(data.timestamp).toBeDefined();
        expect(prisma.recipe.findMany).not.toHaveBeenCalled();
    });

    it('should return 401 unauthorized when current user tries to access recipes of a different user account', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValueOnce({
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
        });

        const response = await GET({} as Request, {
            params: Promise.resolve({ userId: 'user-999' }),
        });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'You can only view all the recipes of your own account'
        );
        expect(data.code).toBe('UNAUTHORIZED');
        expect(data.timestamp).toBeDefined();
        expect(prisma.recipe.findMany).not.toHaveBeenCalled();
    });

    describe('Rate Limiting', () => {
        let originalEnv: string | undefined;

        beforeAll(() => {
            originalEnv = process.env.ENV;
        });

        afterAll(() => {
            process.env.ENV = originalEnv;
        });

        beforeEach(() => {
            process.env.ENV = 'production';
        });

        it('should allow the request when rate limit is not exceeded', async () => {
            (recipeBookRatelimit.limit as jest.Mock).mockResolvedValueOnce({
                success: true,
                reset: Date.now() + 60000,
            });

            const mockRecipes = [
                {
                    id: 'recipe-1',
                    title: 'Scrambled Eggs',
                    description: 'Simple and fluffy eggs',
                    imageSrc: '/eggs.jpg',
                    createdAt: new Date('2026-01-01T12:00:00Z'),
                    categories: ['Breakfast'],
                    method: 'Pan',
                    minutes: 5,
                    ingredients: ['2 eggs', '1 tbsp butter'],
                    steps: ['Whisk eggs', 'Cook in pan'],
                    userId: 'user-123',
                },
            ];

            (prisma.recipe.findMany as jest.Mock).mockResolvedValueOnce(
                mockRecipes
            );

            const response = await GET({} as Request, {
                params: Promise.resolve({ userId: 'user-123' }),
            });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(recipeBookRatelimit.limit).toHaveBeenCalledWith('user-123');
            expect(data).toHaveLength(1);
        });

        it('should return 429 rate limit exceeded when rate limit is exceeded', async () => {
            const resetTime = Date.now() + 30000; // 30 seconds from now
            (recipeBookRatelimit.limit as jest.Mock).mockResolvedValueOnce({
                success: false,
                reset: resetTime,
            });

            const response = await GET({} as Request, {
                params: Promise.resolve({ userId: 'user-123' }),
            });
            const data = await response.json();

            expect(response.status).toBe(429);
            expect(response.headers.get('Retry-After')).toBeDefined();
            expect(data.error).toContain(
                'Too many requests. Please try again in'
            );
            expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
            expect(prisma.recipe.findMany).not.toHaveBeenCalled();
        });
    });
});
