import { expect } from '@jest/globals';
import {
    POST as SavesPOST,
    DELETE as SavesDELETE,
} from '@/app/api/saves/[planningId]/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

const mockUser = {
    id: 'test-user-id',
    name: 'test',
    email: 'test@a.com',
    savedPlanningIds: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
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

describe('Saves API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        if (mockedSession?.user?.email) {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        } else {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        }
    });

    describe('POST /api/saves/[planningId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const mockParams = {
                params: Promise.resolve({ planningId: 'test-planning-id' }),
            };

            const response = await SavesPOST({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to save plan'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when planning ID is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockParams = {
                params: Promise.resolve({ planningId: '' }),
            };

            const response = await SavesPOST({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Planning ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when planning ID is not a string', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockParams = {
                params: Promise.resolve({ planningId: undefined }),
            };

            const response = await SavesPOST({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Planning ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('DELETE /api/saves/[planningId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const mockParams = {
                params: Promise.resolve({ planningId: 'test-planning-id' }),
            };

            const response = await SavesDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to unsave plan'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when planning ID is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockParams = {
                params: Promise.resolve({ planningId: '' }),
            };

            const response = await SavesDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Planning ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });
    });
});
