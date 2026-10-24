import { POST } from '@/app/api/cooksnaps/route';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendNotification from '@/app/actions/sendNotification';
import { NotificationType } from '@/app/types/notification';
import { triggerBadgeForgeEvaluation } from '@/app/lib/badgeForge';
import { redisCache } from '@/app/lib/redis';
import { recomputeRecipeRating } from '@/app/utils/recipeRating';

jest.mock('@/app/lib/prismadb', () => ({
    recipe: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    cooksnap: {
        create: jest.fn(),
    },
}));

jest.mock('@/app/actions/getCurrentUser');
jest.mock('@/app/actions/sendNotification');
jest.mock('@/app/lib/badgeForge', () => ({
    triggerBadgeForgeEvaluation: jest.fn().mockResolvedValue({}),
}));
jest.mock('@/app/utils/recipeRating', () => ({
    recomputeRecipeRating: jest.fn().mockResolvedValue({
        averageRating: 4.5,
        ratingCount: 2,
    }),
}));
jest.mock('@/app/lib/redis', () => ({
    redisCache: {
        del: jest.fn().mockResolvedValue(1),
    },
}));
jest.mock('@/app/lib/ratelimit', () => ({
    contentCreationRatelimit: {
        limit: jest
            .fn()
            .mockResolvedValue({ success: true, reset: Date.now() }),
    },
}));

describe('POST /api/cooksnaps', () => {
    const mockUser = {
        id: 'user-123',
        name: 'Cooker',
        email: 'cooker@example.com',
    };

    const mockRecipe = {
        id: 'recipe-123',
        title: 'Tacos',
        userId: 'author-456',
        averageRating: 4.0,
        ratingCount: 1,
        user: {
            email: 'author@example.com',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    });

    it('returns 401 when user is not authenticated', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue(null);

        const request = new Request('http://localhost/api/cooksnaps', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
    });

    it('returns 400 when recipeId is missing', async () => {
        const request = new Request('http://localhost/api/cooksnaps', {
            method: 'POST',
            body: JSON.stringify({
                imageSrc: 'https://images.jorbites.com/photo.webp',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Recipe ID is required');
    });

    it('returns 400 when imageSrc is missing', async () => {
        const request = new Request('http://localhost/api/cooksnaps', {
            method: 'POST',
            body: JSON.stringify({
                recipeId: 'recipe-123',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Dish photo is required to share a Cooksnap');
    });

    it('returns 400 when imageSrc is from an untrusted domain', async () => {
        const request = new Request('http://localhost/api/cooksnaps', {
            method: 'POST',
            body: JSON.stringify({
                recipeId: 'recipe-123',
                imageSrc: 'https://malicious.site.com/photo.jpg',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid image URL format or domain');
    });

    it('returns 400 when recipe does not exist', async () => {
        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null);

        const request = new Request('http://localhost/api/cooksnaps', {
            method: 'POST',
            body: JSON.stringify({
                recipeId: 'nonexistent-recipe',
                imageSrc: 'https://images.jorbites.com/photo.webp',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Recipe not found');
    });

    it('returns 400 when rating is not an integer between 1 and 5', async () => {
        const request = new Request('http://localhost/api/cooksnaps', {
            method: 'POST',
            body: JSON.stringify({
                recipeId: 'recipe-123',
                imageSrc: 'https://images.jorbites.com/photo.webp',
                rating: 6,
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Rating must be an integer between 1 and 5');
    });

    it('creates a cooksnap, updates recipe rating, and dispatches notification', async () => {
        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(mockRecipe);

        const createdCooksnap = {
            id: 'cooksnap-789',
            userId: 'user-123',
            recipeId: 'recipe-123',
            imageSrc: 'https://images.jorbites.com/photo.webp',
            comment: 'Delicious tacos!',
            rating: 5,
            user: {
                id: 'user-123',
                name: 'Cooker',
            },
        };

        (prisma.cooksnap.create as jest.Mock).mockResolvedValue(
            createdCooksnap
        );
        (prisma.recipe.update as jest.Mock).mockResolvedValue({
            ...mockRecipe,
            averageRating: 4.5,
            ratingCount: 2,
        });

        const request = new Request('http://localhost/api/cooksnaps', {
            method: 'POST',
            body: JSON.stringify({
                recipeId: 'recipe-123',
                imageSrc: 'https://images.jorbites.com/photo.webp',
                comment: 'Delicious tacos!',
                rating: 5,
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data).toEqual(createdCooksnap);

        expect(prisma.cooksnap.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-123',
                recipeId: 'recipe-123',
                imageSrc: 'https://images.jorbites.com/photo.webp',
                comment: 'Delicious tacos!',
                rating: 5,
            },
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
        });

        expect(recomputeRecipeRating).toHaveBeenCalledWith('recipe-123');

        expect(sendNotification).toHaveBeenCalledWith({
            type: NotificationType.NEW_COOKSNAP,
            userEmail: 'author@example.com',
            params: {
                userName: 'Cooker',
                recipeId: 'recipe-123',
                recipeName: 'Tacos',
            },
        });

        expect(triggerBadgeForgeEvaluation).toHaveBeenCalledWith(
            'user-123',
            'COOKSNAP_POSTED'
        );

        expect(redisCache.del).toHaveBeenCalledWith(
            'recipe:cooksnaps:recipe-123'
        );
        expect(redisCache.del).toHaveBeenCalledWith('recipe:recipe-123');
    });

    it('does not send notification if the cook is the recipe author', async () => {
        const recipeByAuthor = {
            ...mockRecipe,
            userId: 'user-123', // same as current user
        };
        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(
            recipeByAuthor
        );
        (prisma.cooksnap.create as jest.Mock).mockResolvedValue({ id: 'cs-1' });
        (prisma.recipe.update as jest.Mock).mockResolvedValue(recipeByAuthor);

        const request = new Request('http://localhost/api/cooksnaps', {
            method: 'POST',
            body: JSON.stringify({
                recipeId: 'recipe-123',
                imageSrc: 'https://images.jorbites.com/photo.webp',
            }),
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
        expect(sendNotification).not.toHaveBeenCalled();
    });
});
