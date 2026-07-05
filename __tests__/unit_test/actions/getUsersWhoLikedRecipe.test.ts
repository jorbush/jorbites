import { describe, it, expect, vi, beforeEach } from 'vitest';
import getUsersWhoLikedRecipe from '@/app/actions/getUsersWhoLikedRecipe';
import prisma from '@/app/lib/prismadb';

vi.mock('@/app/lib/prismadb', () => ({
    default: {
        user: {
            findMany: vi.fn(),
        },
    },
}));

describe('getUsersWhoLikedRecipe Server Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return empty list when recipeId is missing', async () => {
        const result = await getUsersWhoLikedRecipe({});
        expect(result).toEqual([]);
        expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should query DB and return safe users', async () => {
        const mockDbUsers = [
            {
                id: 'user-1',
                name: 'Alice',
                image: 'alice.jpg',
                level: 3,
                verified: true,
                createdAt: new Date('2026-01-01T12:00:00.000Z'),
                updatedAt: new Date('2026-01-02T12:00:00.000Z'),
                badges: ['badge1'],
            },
            {
                id: 'user-2',
                name: 'Bob',
                image: 'bob.jpg',
                level: 1,
                verified: false,
                createdAt: new Date('2026-02-01T12:00:00.000Z'),
                updatedAt: new Date('2026-02-02T12:00:00.000Z'),
                badges: [],
            },
        ];

        vi.mocked(prisma.user.findMany).mockResolvedValue(mockDbUsers as any);

        const result = await getUsersWhoLikedRecipe({ recipeId: 'recipe-123' });

        expect(prisma.user.findMany).toHaveBeenCalledWith({
            where: {
                favoriteIds: {
                    has: 'recipe-123',
                },
            },
            select: {
                id: true,
                name: true,
                image: true,
                level: true,
                verified: true,
                createdAt: true,
                updatedAt: true,
                badges: true,
            },
        });

        expect(result).toEqual([
            {
                id: 'user-1',
                name: 'Alice',
                image: 'alice.jpg',
                level: 3,
                verified: true,
                createdAt: '2026-01-01T12:00:00.000Z',
                updatedAt: '2026-01-02T12:00:00.000Z',
                badges: ['badge1'],
            },
            {
                id: 'user-2',
                name: 'Bob',
                image: 'bob.jpg',
                level: 1,
                verified: false,
                createdAt: '2026-02-01T12:00:00.000Z',
                updatedAt: '2026-02-02T12:00:00.000Z',
                badges: [],
            },
        ]);
    });

    it('should return empty list and log error when Prisma query throws', async () => {
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        vi.mocked(prisma.user.findMany).mockRejectedValue(
            new Error('DB connection error')
        );

        const result = await getUsersWhoLikedRecipe({ recipeId: 'recipe-123' });

        expect(result).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});
