import { expect } from '@jest/globals';
import { GET as SearchGET } from '@/app/api/search/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

const mockUser = {
    id: 'test-user-id',
    name: 'test',
    email: 'test@a.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
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

describe('Search API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        if (mockedSession?.user?.email) {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        } else {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        }
    });

    describe('GET /api/search', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const mockRequest = {
                url: 'http://localhost:3000/api/search?q=test',
            } as Request;

            const response = await SearchGET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('User authentication required to search');
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return empty results when query is too short', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                url: 'http://localhost:3000/api/search?q=a',
            } as Request;

            const response = await SearchGET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ users: [], recipes: [] });
        });

        it('should return empty results when no query provided', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                url: 'http://localhost:3000/api/search',
            } as Request;

            const response = await SearchGET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ users: [], recipes: [] });
        });

        it('should search successfully when user is authenticated and query is valid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                url: 'http://localhost:3000/api/search?q=test%20query',
            } as Request;

            const response = await SearchGET(mockRequest);

            expect(response.status).toBe(200);
        });
    });
});
