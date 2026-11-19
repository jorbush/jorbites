import {
    subscribeUser,
    unsubscribeUser,
} from '@/app/actions/push-notifications';
import getCurrentUser, { auth } from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
    auth: jest.fn(),
}));

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        pushSubscription: {
            create: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));

describe('Push Notifications Server Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('subscribeUser', () => {
        it('should throw when user is not authenticated', async () => {
            jest.mocked(auth).mockResolvedValue(null as any);

            await expect(
                subscribeUser({
                    endpoint: 'http://push.com',
                    keys: { p256dh: 'k', auth: 'a' },
                })
            ).rejects.toThrow();
        });

        it('should create subscription in database when valid', async () => {
            jest.mocked(auth).mockResolvedValue({
                user: { email: 'test@example.com' },
            } as any);
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.pushSubscription.create).mockResolvedValue(
                {} as any
            );

            const result = await subscribeUser({
                endpoint: 'https://fcm.googleapis.com/fcm/send/token123',
                keys: { p256dh: 'key123', auth: 'auth123' },
            });

            expect(result).toEqual({ success: true });
            expect(prisma.pushSubscription.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-1',
                    endpoint: 'https://fcm.googleapis.com/fcm/send/token123',
                    p256dh: 'key123',
                    auth: 'auth123',
                },
            });
        });

        it('should reject untrusted or non-HTTPS push endpoints to prevent SSRF', async () => {
            jest.mocked(auth).mockResolvedValue({
                user: { email: 'test@example.com' },
            } as any);
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);

            const badEndpoints = [
                'http://169.254.169.254/latest/meta-data/',
                'http://localhost:8080/internal',
                'https://attacker.example.com/push',
                'http://fcm.googleapis.com/fcm/send/insecure',
                'https://fcm.googleapis.com:8443/fcm/send/customport',
            ];

            for (const endpoint of badEndpoints) {
                await expect(
                    subscribeUser({
                        endpoint,
                        keys: { p256dh: 'key123', auth: 'auth123' },
                    })
                ).rejects.toThrow('Invalid push subscription endpoint');
            }
            expect(prisma.pushSubscription.create).not.toHaveBeenCalled();
        });

        it('should return success true when duplicate P2002 error occurs', async () => {
            jest.mocked(auth).mockResolvedValue({
                user: { email: 'test@example.com' },
            } as any);
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.pushSubscription.create).mockRejectedValue({
                code: 'P2002',
            });

            const result = await subscribeUser({
                endpoint: 'https://fcm.googleapis.com/fcm/send/token123',
                keys: { p256dh: 'key123', auth: 'auth123' },
            });

            expect(result).toEqual({ success: true });
        });
    });

    describe('unsubscribeUser', () => {
        it('should delete subscription from database', async () => {
            jest.mocked(auth).mockResolvedValue({
                user: { email: 'test@example.com' },
            } as any);
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.pushSubscription.deleteMany).mockResolvedValue({
                count: 1,
            } as any);

            const result = await unsubscribeUser({
                endpoint: 'http://push.com/endpoint',
                keys: { p256dh: 'key123', auth: 'auth123' },
            });

            expect(result).toEqual({ success: true });
            expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
                    endpoint: 'http://push.com/endpoint',
                },
            });
        });

        it('should return error response when no subscription is provided', async () => {
            jest.mocked(auth).mockResolvedValue({
                user: { email: 'test@example.com' },
            } as any);
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);

            const result = await unsubscribeUser(null);
            expect(result).toEqual({
                success: false,
                error: 'No subscription provided',
            });
        });
    });
});
