import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recomputeRecipeRating } from '@/app/utils/recipeRating';

// Mock Prisma
vi.mock('@/app/lib/prismadb', () => {
    const mockPrisma = {
        comment: {
            aggregate: vi.fn(),
        },
        cooksnap: {
            aggregate: vi.fn(),
        },
        recipe: {
            update: vi.fn(),
        },
    };
    return {
        default: mockPrisma,
        ...mockPrisma,
    };
});

import prisma from '@/app/lib/prismadb';

describe('recomputeRecipeRating', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('aggregates ratings across both comments and cooksnaps', async () => {
        (prisma.comment.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: 8 },
            _count: { rating: 2 },
        });
        (prisma.cooksnap.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: 15 },
            _count: { rating: 3 },
        });
        (prisma.recipe.update as any).mockResolvedValueOnce({});

        const result = await recomputeRecipeRating('recipe-123');

        expect(prisma.comment.aggregate).toHaveBeenCalledWith({
            where: {
                recipeId: 'recipe-123',
                rating: { not: null },
            },
            _sum: { rating: true },
            _count: { rating: true },
        });

        expect(prisma.cooksnap.aggregate).toHaveBeenCalledWith({
            where: {
                recipeId: 'recipe-123',
                rating: { not: null },
            },
            _sum: { rating: true },
            _count: { rating: true },
        });

        // 8 + 15 = 23; 2 + 3 = 5; 23 / 5 = 4.6
        expect(prisma.recipe.update).toHaveBeenCalledWith({
            where: { id: 'recipe-123' },
            data: {
                averageRating: 4.6,
                ratingCount: 5,
            },
        });

        expect(result).toEqual({
            averageRating: 4.6,
            ratingCount: 5,
        });
    });

    it('handles only comment ratings correctly', async () => {
        (prisma.comment.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: 9 },
            _count: { rating: 2 },
        });
        (prisma.cooksnap.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: null },
            _count: { rating: 0 },
        });
        (prisma.recipe.update as any).mockResolvedValueOnce({});

        const result = await recomputeRecipeRating('recipe-123');

        expect(prisma.recipe.update).toHaveBeenCalledWith({
            where: { id: 'recipe-123' },
            data: {
                averageRating: 4.5,
                ratingCount: 2,
            },
        });

        expect(result).toEqual({
            averageRating: 4.5,
            ratingCount: 2,
        });
    });

    it('handles only cooksnap ratings correctly', async () => {
        (prisma.comment.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: null },
            _count: { rating: 0 },
        });
        (prisma.cooksnap.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: 10 },
            _count: { rating: 2 },
        });
        (prisma.recipe.update as any).mockResolvedValueOnce({});

        const result = await recomputeRecipeRating('recipe-123');

        expect(prisma.recipe.update).toHaveBeenCalledWith({
            where: { id: 'recipe-123' },
            data: {
                averageRating: 5,
                ratingCount: 2,
            },
        });

        expect(result).toEqual({
            averageRating: 5,
            ratingCount: 2,
        });
    });

    it('handles zero ratings across both comments and cooksnaps', async () => {
        (prisma.comment.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: null },
            _count: { rating: 0 },
        });
        (prisma.cooksnap.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: null },
            _count: { rating: 0 },
        });
        (prisma.recipe.update as any).mockResolvedValueOnce({});

        const result = await recomputeRecipeRating('recipe-empty');

        expect(prisma.recipe.update).toHaveBeenCalledWith({
            where: { id: 'recipe-empty' },
            data: {
                averageRating: 0,
                ratingCount: 0,
            },
        });

        expect(result).toEqual({
            averageRating: 0,
            ratingCount: 0,
        });
    });

    it('correctly rounds decimal average ratings to two decimal places', async () => {
        (prisma.comment.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: 10 },
            _count: { rating: 3 },
        });
        (prisma.cooksnap.aggregate as any).mockResolvedValueOnce({
            _sum: { rating: null },
            _count: { rating: 0 },
        });
        (prisma.recipe.update as any).mockResolvedValueOnce({});

        const result = await recomputeRecipeRating('recipe-123');

        // 10 / 3 = 3.3333... -> 3.33
        expect(prisma.recipe.update).toHaveBeenCalledWith({
            where: { id: 'recipe-123' },
            data: {
                averageRating: 3.33,
                ratingCount: 3,
            },
        });

        expect(result).toEqual({
            averageRating: 3.33,
            ratingCount: 3,
        });
    });
});
