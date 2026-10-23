import { expect } from '@jest/globals';
import { GET, PATCH } from '@/app/api/profilePreferences/route';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('@/app/actions/getCurrentUser', () => jest.fn());

describe('Profile Preferences API (/api/profilePreferences)', () => {
    const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/profilePreferences', () => {
        it('should return 401 if user is not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to fetch profile preferences'
            );
        });

        it('should return default preferences if user has no saved preferences', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                profilePreferences: null,
            });

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                showStats: true,
                showActivityGraph: true,
                showArticles: true,
            });
        });

        it('should return saved user preferences merged with defaults', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                profilePreferences: {
                    showStats: false,
                    showArticles: false,
                },
            });

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                showStats: false,
                showActivityGraph: true,
                showArticles: false,
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
            expect(data.error).toBe('Failed to fetch profile preferences');
        });
    });

    describe('PATCH /api/profilePreferences', () => {
        it('should return 401 if user is not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            const request = new Request(
                'http://localhost:3000/api/profilePreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ showStats: false }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to update profile preferences'
            );
        });

        it('should return 400 for invalid JSON body', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

            const request = {
                json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
            } as unknown as Request;

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Invalid JSON body');
        });

        it('should return 400 if body is null or not an object', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

            const request = new Request(
                'http://localhost:3000/api/profilePreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify(null),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Invalid request body');
        });

        it('should return 400 if body is an array', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

            const request = new Request(
                'http://localhost:3000/api/profilePreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify([{ showStats: false }]),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Invalid request body');
        });

        it('should return 400 for unknown preference key', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

            const request = new Request(
                'http://localhost:3000/api/profilePreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ unknownSetting: true }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Unknown preference key: unknownSetting');
        });

        it('should return 400 if a preference value is not boolean', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

            const request = new Request(
                'http://localhost:3000/api/profilePreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ showStats: 'true' }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Preference value for showStats must be a boolean'
            );
        });

        it('should successfully update valid preferences', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                profilePreferences: {
                    showStats: true,
                    showActivityGraph: true,
                    showArticles: true,
                },
            });
            (prisma.user.update as jest.Mock).mockResolvedValue({
                id: 'user-123',
                profilePreferences: {
                    showStats: false,
                    showActivityGraph: true,
                    showArticles: true,
                },
            });

            const request = new Request(
                'http://localhost:3000/api/profilePreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ showStats: false }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                showStats: false,
                showActivityGraph: true,
                showArticles: true,
            });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                data: {
                    profilePreferences: {
                        showStats: false,
                        showActivityGraph: true,
                        showArticles: true,
                    },
                },
                select: {
                    id: true,
                    profilePreferences: true,
                },
            });
        });

        it('should handle internal errors gracefully during PATCH', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.findUnique as jest.Mock).mockRejectedValue(
                new Error('Database update error')
            );

            const request = new Request(
                'http://localhost:3000/api/profilePreferences',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ showStats: false }),
                }
            );

            const response = await PATCH(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to update profile preferences');
        });
    });
});
