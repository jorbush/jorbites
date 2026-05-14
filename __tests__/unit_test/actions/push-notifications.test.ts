import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscribeUser, unsubscribeUser } from '@/app/actions/push-notifications';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import { getServerSession } from 'next-auth/next';

vi.mock('@/app/actions/getCurrentUser');
vi.mock('next-auth/next', () => ({
    getServerSession: vi.fn(),
}));
vi.mock('@/pages/api/auth/[...nextauth]', () => ({
    authOptions: {},
}));
vi.mock('@/app/lib/prismadb', () => ({
    default: {
        pushSubscription: {
            create: vi.fn(),
            deleteMany: vi.fn(),
        },
    },
}));

describe('push-notifications actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('subscribeUser', () => {
        const mockSub = {
            endpoint: 'https://example.com',
            keys: {
                p256dh: 'p256dh',
                auth: 'auth',
            },
        } as any;

        it('throws Unauthorized error when session is missing', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            await expect(subscribeUser(mockSub)).rejects.toThrow('Unauthorized');
        });

        it('throws Unauthorized error when user is not found', async () => {
            vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);
            vi.mocked(getCurrentUser).mockResolvedValue(null);

            await expect(subscribeUser(mockSub)).rejects.toThrow('Unauthorized');
        });

        it('saves subscription and returns success when authenticated', async () => {
            const mockUser = { id: 'user-123' } as any;
            vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);
            vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
            vi.mocked(prisma.pushSubscription.create).mockResolvedValue({} as any);

            const result = await subscribeUser(mockSub);

            expect(prisma.pushSubscription.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-123',
                    endpoint: mockSub.endpoint,
                    p256dh: mockSub.keys.p256dh,
                    auth: mockSub.keys.auth,
                },
            });
            expect(result).toEqual({ success: true });
        });
    });

    describe('unsubscribeUser', () => {
        const mockSub = {
            endpoint: 'https://example.com',
        } as any;

        it('throws Unauthorized error when session is missing', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            await expect(unsubscribeUser(mockSub)).rejects.toThrow('Unauthorized');
        });

        it('throws Unauthorized error when user is not found', async () => {
            vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);
            vi.mocked(getCurrentUser).mockResolvedValue(null);

            await expect(unsubscribeUser(mockSub)).rejects.toThrow('Unauthorized');
        });

        it('deletes subscription and returns success when authenticated', async () => {
            const mockUser = { id: 'user-123' } as any;
            vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);
            vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
            vi.mocked(prisma.pushSubscription.deleteMany).mockResolvedValue({ count: 1 } as any);

            const result = await unsubscribeUser(mockSub);

            expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
                where: {
                    userId: 'user-123',
                    endpoint: mockSub.endpoint,
                },
            });
            expect(result).toEqual({ success: true });
        });
    });
});
