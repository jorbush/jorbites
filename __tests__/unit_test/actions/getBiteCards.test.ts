import { describe, it, expect, vi, beforeEach } from 'vitest';
import getBiteCards from '@/app/actions/getBiteCards';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

vi.mock('@/app/lib/prismadb', () => ({
    default: {
        recipe: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock('@/app/actions/getCurrentUser', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('getBiteCards Server Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches candidate recipes excluding favorited and custom excluded IDs', async () => {
        const mockUser = {
            id: 'user-1',
            favoriteIds: ['fav-1'],
        };
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);

        const mockCandidateRecipes = [
            {
                id: 'recipe-10',
                title: 'Paella Valeciana',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
            },
        ];
        vi.mocked(prisma.recipe.findMany).mockResolvedValue(
            mockCandidateRecipes as any
        );

        const result = await getBiteCards({
            limit: 10,
            excludeIds: ['exclude-1'],
        });

        expect(prisma.recipe.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: {
                        notIn: expect.arrayContaining(['fav-1', 'exclude-1']),
                    },
                },
            })
        );
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('recipe-10');
        expect(result[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
    });

    it('re-throws when database query fails', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);
        vi.mocked(prisma.recipe.findMany).mockRejectedValue(
            new Error('DB Failure')
        );

        await expect(getBiteCards()).rejects.toThrow('DB Failure');
    });
});
