import { expect } from '@jest/globals';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getUserById from '@/app/actions/getUserById';
import { Session } from 'next-auth';
import { POST } from '@/app/api/register/route';
import {
    GET as UserGET,
    DELETE as UserDELETE,
} from '@/app/api/user/[userId]/route';
import { NextRequest } from 'next/server';

let mockedSession: Session | null = null;

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
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
});
