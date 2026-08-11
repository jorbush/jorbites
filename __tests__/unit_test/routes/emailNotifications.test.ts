import { PUT as EmailNotificationsPUT } from '@/app/api/emailNotifications/[userId]/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import sendNotification from '@/app/actions/sendNotification';
import { NotificationType } from '@/app/types/notification';

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            update: jest.fn(),
        },
    },
}));

jest.mock('@/app/actions/sendNotification', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('PUT /api/emailNotifications/[userId]', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 when user is not authenticated', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue(null);

        const request = new Request(
            'http://localhost/api/emailNotifications/user-1',
            {
                method: 'PUT',
            }
        );

        const response = await EmailNotificationsPUT(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'User authentication required to update email notifications'
        );
    });

    it('should toggle emailNotifications to true and trigger notification', async () => {
        const mockCurrentUser = {
            id: 'user-1',
            email: 'test@example.com',
            emailNotifications: false,
        };
        jest.mocked(getCurrentUser).mockResolvedValue(mockCurrentUser as any);
        jest.mocked(prisma.user.update).mockResolvedValue({
            id: 'user-1',
            email: 'test@example.com',
            emailNotifications: true,
        } as any);

        const request = new Request(
            'http://localhost/api/emailNotifications/user-1',
            {
                method: 'PUT',
            }
        );

        const response = await EmailNotificationsPUT(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            id: 'user-1',
            emailNotifications: true,
        });

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { emailNotifications: true },
            select: { id: true, email: true, emailNotifications: true },
        });

        expect(sendNotification).toHaveBeenCalledWith({
            type: NotificationType.NOTIFICATIONS_ACTIVATED,
            userEmail: 'test@example.com',
        });
    });

    it('should toggle emailNotifications to false without notification', async () => {
        const mockCurrentUser = {
            id: 'user-1',
            email: 'test@example.com',
            emailNotifications: true,
        };
        jest.mocked(getCurrentUser).mockResolvedValue(mockCurrentUser as any);
        jest.mocked(prisma.user.update).mockResolvedValue({
            id: 'user-1',
            email: 'test@example.com',
            emailNotifications: false,
        } as any);

        const request = new Request(
            'http://localhost/api/emailNotifications/user-1',
            {
                method: 'PUT',
            }
        );

        const response = await EmailNotificationsPUT(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            id: 'user-1',
            emailNotifications: false,
        });

        expect(sendNotification).not.toHaveBeenCalled();
    });

    it('should return 500 when database update fails', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({
            id: 'user-1',
            emailNotifications: false,
        } as any);
        jest.mocked(prisma.user.update).mockRejectedValue(
            new Error('Database error')
        );

        const request = new Request(
            'http://localhost/api/emailNotifications/user-1',
            {
                method: 'PUT',
            }
        );

        const response = await EmailNotificationsPUT(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to update email notifications');
    });
});
