import { expect } from '@jest/globals';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getUserById from '@/app/actions/getUserById';
import { Session } from 'next-auth';
import { POST } from '@/app/api/register/route';
import { NextRequest } from 'next/server';

let mockedSession: Session | null = null;

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    recipe: {
        findMany: jest.fn().mockResolvedValue([]),
    },
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
