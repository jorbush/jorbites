import getUserById from '@/app/actions/getUserById';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
        },
        recipe: {
            findMany: jest.fn(),
        },
    },
}));

describe('getUserById Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return null when user is not found', async () => {
        jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const result = await getUserById({ userId: 'non-existent' });
        expect(result).toBeNull();
    });

    it('should return basic formatted user info when withStats is false or omitted', async () => {
        const mockUser = {
            id: 'u1',
            name: 'Alice',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            emailVerified: null,
        };

        jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

        const result = await getUserById({ userId: 'u1' });

        expect(result).toEqual({
            ...mockUser,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            emailVerified: null,
        });
    });

    it('should return user with calculated stats when withStats is true', async () => {
        const mockUser = {
            id: 'u1',
            name: 'Alice',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            emailVerified: null,
        };

        const mockRecipes = [
            {
                userId: 'u1',
                numLikes: 5,
                createdAt: new Date('2026-05-01T00:00:00.000Z'),
                minutes: 20,
                categories: ['Mexican'],
                method: 'Stovetop',
            },
        ];

        jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        jest.mocked(prisma.recipe.findMany).mockResolvedValue(
            mockRecipes as any
        );

        const result = await getUserById({ userId: 'u1', withStats: true });

        expect(result?.recipeCount).toBe(1);
        expect(result?.likesReceived).toBe(5);
        expect(result?.totalCookingTime).toBe(20);
        expect(result?.mostUsedCategory).toBe('Mexican');
        expect(result?.mostUsedMethod).toBe('Stovetop');
    });

    it('should return null when database exception occurs', async () => {
        jest.mocked(prisma.user.findUnique).mockRejectedValue(
            new Error('DB failure')
        );

        const result = await getUserById({ userId: 'u1' });
        expect(result).toBeNull();
    });
});
