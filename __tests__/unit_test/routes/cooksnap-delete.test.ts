import { DELETE } from '@/app/api/cooksnaps/[cooksnapId]/route';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { deleteFromR2 } from '@/app/utils/r2';
import { recomputeRecipeRating } from '@/app/utils/recipeRating';
import { redisCache } from '@/app/lib/redis';

// Mock dependencies
jest.mock('@/app/actions/getCurrentUser');
jest.mock('@/app/lib/prismadb', () => ({
    cooksnap: {
        findUnique: jest.fn(),
        delete: jest.fn(),
    },
}));
jest.mock('@/app/utils/r2', () => ({
    deleteFromR2: jest.fn().mockResolvedValue(true),
}));
jest.mock('@/app/utils/recipeRating', () => ({
    recomputeRecipeRating: jest.fn().mockResolvedValue({
        averageRating: 4.0,
        ratingCount: 1,
    }),
}));
jest.mock('@/app/lib/redis', () => ({
    redisCache: {
        del: jest.fn().mockResolvedValue(1),
    },
}));
jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('DELETE /api/cooksnaps/[cooksnapId]', () => {
    const mockCookUser = {
        id: 'cook-123',
        email: 'cook@example.com',
        role: 'user',
    };

    const mockRecipeAuthor = {
        id: 'author-456',
        email: 'author@example.com',
        role: 'user',
    };

    const mockOtherUser = {
        id: 'stranger-999',
        email: 'stranger@example.com',
    };

    const mockCooksnap = {
        id: 'cooksnap-001',
        userId: 'cook-123',
        recipeId: 'recipe-100',
        rating: 5,
        imageSrc: 'https://images.jorbites.com/remakes/photo1.webp',
        recipe: {
            id: 'recipe-100',
            userId: 'author-456',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getCurrentUser as jest.Mock).mockResolvedValue(mockCookUser);
        (prisma.cooksnap.findUnique as jest.Mock).mockResolvedValue(
            mockCooksnap
        );
        (prisma.cooksnap.delete as jest.Mock).mockResolvedValue(mockCooksnap);
    });

    it('returns 401 when user is not authenticated', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue(null);

        const props = {
            params: Promise.resolve({ cooksnapId: 'cooksnap-001' }),
        };

        const response = await DELETE(new Request('http://localhost'), props);
        expect(response.status).toBe(401);
    });

    it('returns 404 when cooksnapId is missing', async () => {
        const props = {
            params: Promise.resolve({ cooksnapId: '' }),
        };

        const response = await DELETE(new Request('http://localhost'), props);
        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error).toBe('Cooksnap ID required');
    });

    it('returns 404 when cooksnap does not exist', async () => {
        (prisma.cooksnap.findUnique as jest.Mock).mockResolvedValue(null);

        const props = {
            params: Promise.resolve({ cooksnapId: 'nonexistent-cooksnap' }),
        };

        const response = await DELETE(new Request('http://localhost'), props);
        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error).toBe('Cooksnap not found');
    });

    it('returns 403 when user is not the cook, the recipe author, nor an admin', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue(mockOtherUser);

        const props = {
            params: Promise.resolve({ cooksnapId: 'cooksnap-001' }),
        };

        const response = await DELETE(new Request('http://localhost'), props);
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toBe(
            'You do not have permission to delete this cooksnap'
        );
    });

    it('allows the cook (creator) to delete the cooksnap and triggers side effects', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue(mockCookUser);

        const props = {
            params: Promise.resolve({ cooksnapId: 'cooksnap-001' }),
        };

        const response = await DELETE(new Request('http://localhost'), props);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            id: 'cooksnap-001',
            message: 'Cooksnap deleted successfully',
        });

        expect(prisma.cooksnap.delete).toHaveBeenCalledWith({
            where: { id: 'cooksnap-001' },
        });

        expect(recomputeRecipeRating).toHaveBeenCalledWith('recipe-100');
        expect(deleteFromR2).toHaveBeenCalledWith(
            'https://images.jorbites.com/remakes/photo1.webp'
        );
        expect(redisCache.del).toHaveBeenCalledWith(
            'recipe:cooksnaps:recipe-100'
        );
        expect(redisCache.del).toHaveBeenCalledWith('recipe:recipe-100');
        expect(redisCache.del).toHaveBeenCalledWith(
            'user:activity:graph:cook-123'
        );
    });

    it('allows the recipe author to delete a cooksnap on their recipe', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue(mockRecipeAuthor);

        const props = {
            params: Promise.resolve({ cooksnapId: 'cooksnap-001' }),
        };

        const response = await DELETE(new Request('http://localhost'), props);
        expect(response.status).toBe(200);
        expect(prisma.cooksnap.delete).toHaveBeenCalledWith({
            where: { id: 'cooksnap-001' },
        });
    });

    it('does not recompute recipe rating if cooksnap has no rating', async () => {
        (prisma.cooksnap.findUnique as jest.Mock).mockResolvedValue({
            ...mockCooksnap,
            rating: null,
        });

        const props = {
            params: Promise.resolve({ cooksnapId: 'cooksnap-001' }),
        };

        const response = await DELETE(new Request('http://localhost'), props);
        expect(response.status).toBe(200);
        expect(recomputeRecipeRating).not.toHaveBeenCalled();
    });

    it('gracefully handles R2 deletion failure without failing the deletion', async () => {
        (deleteFromR2 as jest.Mock).mockRejectedValueOnce(
            new Error('R2 unavailable')
        );

        const props = {
            params: Promise.resolve({ cooksnapId: 'cooksnap-001' }),
        };

        const response = await DELETE(new Request('http://localhost'), props);
        expect(response.status).toBe(200);
    });

    it('returns 500 when database deletion fails', async () => {
        (prisma.cooksnap.delete as jest.Mock).mockRejectedValueOnce(
            new Error('Database error')
        );

        const props = {
            params: Promise.resolve({ cooksnapId: 'cooksnap-001' }),
        };

        const response = await DELETE(new Request('http://localhost'), props);
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe('Failed to delete cooksnap');
    });
});
