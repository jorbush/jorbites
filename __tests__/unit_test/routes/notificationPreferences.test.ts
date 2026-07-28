import { expect } from '@jest/globals';
import { GET, PATCH } from '@/app/api/notificationPreferences/route';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('@/app/actions/getCurrentUser', () => jest.fn());

describe('Notification Preferences API (/api/notificationPreferences)', () => {
    const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/notificationPreferences', () => {
        it('should return 401 if user is not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to fetch notification preferences'
            );
        });

        it('should return default preferences if user has no saved preferences', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                notificationPreferences: null,
            });

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                social: true,
                newContent: true,
                eventsAndChallenges: true,
                quests: true,
                voting: true,
                achievements: true,
            });
        });

        it('should return saved user preferences merged with defaults', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                notificationPreferences: {
                    social: false,
                    voting: false,
                },
            });

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                social: false,
                newContent: true,
                eventsAndChallenges: true,
                quests: true,
                voting: false,
                achievements: true,
            });
        });

        it('should handle internal errors gracefully', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockRejectedValue(
                new Error('Database connection failed')
            );

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch notification preferences');
        });
    });

    describe('PATCH /api/notificationPreferences', () => {
        it('should return 401 if user is not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            const request = new Request(
                'http://localhost/api/notificationPreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ social: false }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to update notification preferences'
            );
        });

        it('should return 400 if request body is invalid or empty', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

            const request = new Request(
                'http://localhost/api/notificationPreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify('not-an-object'),
                }
            );

            const response = await PATCH(request);
            expect(response.status).toBe(400);
        });

        it('should return 400 if unknown preference key is provided', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

            const request = new Request(
                'http://localhost/api/notificationPreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ invalidKey: true }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('Unknown preference key: invalidKey');
        });

        it('should return 400 if non-boolean value is provided', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

            const request = new Request(
                'http://localhost/api/notificationPreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ social: 'yes' }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain(
                'Preference value for social must be a boolean'
            );
        });

        it('should update single category preference and preserve existing values', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                notificationPreferences: {
                    social: true,
                    newContent: true,
                    eventsAndChallenges: true,
                    quests: true,
                    voting: true,
                    achievements: true,
                },
            });
            (prisma.user.update as jest.Mock).mockResolvedValue({
                id: 'user-123',
                notificationPreferences: {
                    social: false,
                    newContent: true,
                    eventsAndChallenges: true,
                    quests: true,
                    voting: true,
                    achievements: true,
                },
            });

            const request = new Request(
                'http://localhost/api/notificationPreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ social: false }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.social).toBe(false);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                data: {
                    notificationPreferences: {
                        social: false,
                        newContent: true,
                        eventsAndChallenges: true,
                        quests: true,
                        voting: true,
                        achievements: true,
                    },
                },
                select: {
                    id: true,
                    notificationPreferences: true,
                },
            });
        });

        it('should update multiple categories at once', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                notificationPreferences: null,
            });
            (prisma.user.update as jest.Mock).mockResolvedValue({
                id: 'user-123',
                notificationPreferences: {
                    social: false,
                    newContent: true,
                    eventsAndChallenges: true,
                    quests: true,
                    voting: false,
                    achievements: true,
                },
            });

            const request = new Request(
                'http://localhost/api/notificationPreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ social: false, voting: false }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.social).toBe(false);
            expect(data.voting).toBe(false);
        });

        it('should handle errors when update fails', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.update as jest.Mock).mockRejectedValue(
                new Error('Prisma error')
            );

            const request = new Request(
                'http://localhost/api/notificationPreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ social: false }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe(
                'Failed to update notification preferences'
            );
        });
    });
});
