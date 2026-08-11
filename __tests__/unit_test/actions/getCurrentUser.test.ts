import getCurrentUser, { auth } from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import { getServerSession } from 'next-auth/next';

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/pages/api/auth/[...nextauth]', () => ({
    authOptions: {},
}));

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

describe('getCurrentUser Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return null when session has no email', async () => {
        jest.mocked(getServerSession).mockResolvedValue(null);

        const user = await getCurrentUser();
        expect(user).toBeNull();
    });

    it('should return formatted safe user when session is valid and user exists', async () => {
        jest.mocked(getServerSession).mockResolvedValue({
            user: { email: 'user@example.com' },
        } as any);

        const mockDbUser = {
            id: 'user-123',
            name: 'Jordi',
            email: 'user@example.com',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            emailVerified: null,
        };

        jest.mocked(prisma.user.findUnique).mockResolvedValue(
            mockDbUser as any
        );

        const user = await getCurrentUser();

        expect(user).toEqual({
            ...mockDbUser,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            emailVerified: null,
        });
    });

    it('should return null when user is not found in database', async () => {
        jest.mocked(getServerSession).mockResolvedValue({
            user: { email: 'unknown@example.com' },
        } as any);

        jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const user = await getCurrentUser();
        expect(user).toBeNull();
    });

    it('auth helper should return server session', async () => {
        const mockSession = { user: { email: 'test@example.com' } };
        jest.mocked(getServerSession).mockResolvedValue(mockSession as any);

        const session = await auth();
        expect(session).toEqual(mockSession);
    });
});
