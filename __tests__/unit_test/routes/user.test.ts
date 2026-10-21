import { expect } from '@jest/globals';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getUserById from '@/app/actions/getUserById';
import { Session } from 'next-auth';
import { POST } from '@/app/api/register/route';
import {
    GET as UserGET,
    DELETE as UserDELETE,
    PATCH as UserPATCH,
} from '@/app/api/user/[userId]/route';
import { NextRequest } from 'next/server';

let mockedSession: Session | null = null;

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    },
    recipe: {
        findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn((cb: any) =>
        cb({
            user: { delete: jest.fn() },
        })
    ),
}));

import prisma from '@/app/lib/prismadb';

// This mocks our custom helper function to avoid passing authOptions around
jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

// This mocks calls to getServerSession
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(() => Promise.resolve('hashedpassword')),
}));

jest.mock('@/app/lib/ratelimit', () => ({
    authenticatedRatelimit: {
        limit: jest.fn().mockResolvedValue({ success: true, reset: 0 }),
    },
}));

import { authenticatedRatelimit } from '@/app/lib/ratelimit';

describe('User API Routes and Server Actions', () => {
    let currentUser: any = null;
    afterEach(async () => {
        mockedSession = null;
        jest.clearAllMocks();
    });

    it('should return empty user', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        const response = await getCurrentUser();
        expect(response).toStrictEqual(null);
    });

    it('should return current user', async () => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };
        const mockDbUser = {
            id: 'user-123',
            name: 'test',
            email: 'test@a.com',
            emailVerified: null,
            image: null,
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
            favoriteIds: [],
            savedPlanningIds: [],
            pinnedRecipeIds: [],
            emailNotifications: false,
            level: 1,
            verified: false,
            language: 'en',
            badges: [],
            notificationPreferences: null,
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

        const response = await getCurrentUser();
        expect(response).toMatchObject({
            id: 'user-123',
            name: 'test',
            email: 'test@a.com',
        });
        currentUser = response;
    });

    it('should return the user with the id', async () => {
        const mockDbUser = {
            id: 'user-123',
            name: 'test',
            image: null,
            emailVerified: null,
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
            level: 1,
            verified: false,
            language: 'en',
            badges: [],
            pinnedRecipeIds: [],
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

        const response = await getUserById({ userId: currentUser.id });
        expect(response).toMatchObject({
            id: 'user-123',
            name: 'test',
        });
    });

    it('GET /api/user/[userId] should return user public profile', async () => {
        const mockDbUser = {
            id: 'user-123',
            name: 'Jordi',
            image: 'avatar.jpg',
            level: 3,
            verified: true,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

        const req = new NextRequest('http://localhost/api/user/user-123');
        const res = await UserGET(req, {
            params: Promise.resolve({ userId: 'user-123' }),
        });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({
            id: 'user-123',
            name: 'Jordi',
            image: 'avatar.jpg',
            level: 3,
            verified: true,
            createdAt: '2026-01-01T00:00:00.000Z',
        });
    });

    it('DELETE /api/user/[userId] should require authentication', async () => {
        mockedSession = null;
        const req = new NextRequest('http://localhost/api/user/user-123', {
            method: 'DELETE',
        });
        const res = await UserDELETE(req, {
            params: Promise.resolve({ userId: 'user-123' }),
        });
        expect(res.status).toBe(401);
    });

    it('DELETE /api/user/[userId] should delete user account when authenticated', async () => {
        mockedSession = {
            expires: 'expires',
            user: { name: 'test', email: 'test@a.com' },
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: 'user-123',
            email: 'test@a.com',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const req = new NextRequest('http://localhost/api/user/user-123', {
            method: 'DELETE',
        });
        const res = await UserDELETE(req, {
            params: Promise.resolve({ userId: 'user-123' }),
        });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
    });

    it('should return error 409 when email already exists', async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue({
            id: 'user-123',
            email: 'test@a.com',
        });

        const request = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@a.com',
                name: 'New User',
                password: 'password123',
            }),
        });

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(409);
        expect(responseData).toEqual({
            error: 'Email already exists',
            code: 'CONFLICT',
            timestamp: expect.any(String),
        });
    });

    describe('PATCH /api/user/[userId]', () => {
        it('should return 401 when unauthorized', async () => {
            mockedSession = null;
            const request = new NextRequest(
                'http://localhost/api/user/user-123',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ bio: 'Hello world' }),
                }
            );
            const response = await UserPATCH(request, {
                params: Promise.resolve({ userId: 'user-123' }),
            });
            expect(response.status).toBe(401);
        });

        it('should return 403 when updating another user profile', async () => {
            mockedSession = {
                expires: 'expires',
                user: { email: 'current@example.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'my-user-id',
                email: 'current@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const request = new NextRequest(
                'http://localhost/api/user/other-user-id',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ bio: 'Hacking other profile' }),
                }
            );
            const response = await UserPATCH(request, {
                params: Promise.resolve({ userId: 'other-user-id' }),
            });
            expect(response.status).toBe(403);
        });

        it('should return 400 when bio exceeds 250 characters', async () => {
            mockedSession = {
                expires: 'expires',
                user: { email: 'current@example.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'current@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const longBio = 'a'.repeat(251);
            const request = new NextRequest(
                'http://localhost/api/user/user-123',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ bio: longBio }),
                }
            );
            const response = await UserPATCH(request, {
                params: Promise.resolve({ userId: 'user-123' }),
            });
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Bio must be 250 characters or less');
        });

        it('should return 400 when websiteUrl has an invalid scheme', async () => {
            mockedSession = {
                expires: 'expires',
                user: { email: 'current@example.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'current@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const request = new NextRequest(
                'http://localhost/api/user/user-123',
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        websiteUrl: 'javascript:alert(1)',
                    }),
                }
            );
            const response = await UserPATCH(request, {
                params: Promise.resolve({ userId: 'user-123' }),
            });
            expect(response.status).toBe(400);
        });

        it('should normalize social handles and update profile successfully', async () => {
            mockedSession = {
                expires: 'expires',
                user: { email: 'current@example.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'current@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const updatedUser = {
                id: 'user-123',
                name: 'Chef Alice',
                bio: 'Passionate pastry chef.',
                websiteUrl: 'https://pastrychef.com',
                instagram: 'alice_pastry',
                twitter: 'alice_pastry',
                youtube: 'alice_pastry',
                tiktok: 'alice_pastry',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
            };

            (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

            const request = new NextRequest(
                'http://localhost/api/user/user-123',
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        bio: 'Passionate pastry chef.',
                        websiteUrl: 'pastrychef.com',
                        instagram: '@alice_pastry',
                        twitter: 'https://x.com/alice_pastry',
                        youtube: '@alice_pastry',
                        tiktok: 'https://tiktok.com/@alice_pastry',
                    }),
                }
            );

            const response = await UserPATCH(request, {
                params: Promise.resolve({ userId: 'user-123' }),
            });
            expect(response.status).toBe(200);

            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'user-123' },
                    data: expect.objectContaining({
                        bio: 'Passionate pastry chef.',
                        websiteUrl: 'https://pastrychef.com',
                        instagram: 'alice_pastry',
                        twitter: 'alice_pastry',
                        youtube: 'alice_pastry',
                        tiktok: 'alice_pastry',
                    }),
                })
            );
        });

        it('should return 400 when social handle has invalid characters', async () => {
            mockedSession = {
                expires: 'expires',
                user: { email: 'current@example.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'current@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const request = new NextRequest(
                'http://localhost/api/user/user-123',
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        instagram: 'alice pastry<script>',
                    }),
                }
            );
            const response = await UserPATCH(request, {
                params: Promise.resolve({ userId: 'user-123' }),
            });
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Invalid Instagram handle format');
        });

        it('should enforce rate limit in production mode', async () => {
            const originalEnv = process.env.ENV;
            try {
                process.env.ENV = 'production';
                mockedSession = {
                    expires: 'expires',
                    user: { email: 'current@example.com' },
                };
                (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                    id: 'user-123',
                    email: 'current@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                (
                    authenticatedRatelimit.limit as jest.Mock
                ).mockResolvedValueOnce({
                    success: false,
                    reset: Date.now() + 10000,
                });

                const request = new NextRequest(
                    'http://localhost/api/user/user-123',
                    {
                        method: 'PATCH',
                        body: JSON.stringify({ bio: 'New bio' }),
                    }
                );
                const response = await UserPATCH(request, {
                    params: Promise.resolve({ userId: 'user-123' }),
                });

                expect(response.status).toBe(429);
                const data = await response.json();
                expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
                expect(authenticatedRatelimit.limit).toHaveBeenCalledWith(
                    'user-123'
                );
            } finally {
                process.env.ENV = originalEnv;
            }
        });
    });
});
