import { expect } from '@jest/globals';
import { GET as ActiveDraftsGET } from '@/app/api/draft/active/route';
import { DraftService } from '@/app/services/draftService';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

const mockUser = {
    id: 'user-active-test',
    name: 'Active Tester',
    email: 'activetest@a.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';

jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

jest.mock('@/app/services/draftService', () => ({
    DraftService: {
        getAllUserDrafts: jest.fn(),
    },
}));

describe('GET /api/draft/active', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedSession = null;
    });

    it('returns 401 Unauthorized when session is missing', async () => {
        mockedSession = null;

        const response = await ActiveDraftsGET();
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toContain('User authentication required');
    });

    it('returns 401 Unauthorized when user is not found in database', async () => {
        mockedSession = {
            user: { email: 'unknown@test.com' },
            expires: '2026-12-31',
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const response = await ActiveDraftsGET();
        expect(response.status).toBe(401);
    });

    it('returns list of drafts retrieved from DraftService.getAllUserDrafts', async () => {
        mockedSession = {
            user: { email: mockUser.email },
            expires: '2026-12-31',
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        const mockDraftList = [
            {
                draftId: 'd-1',
                type: 'solo',
                title: 'Solo Tacos',
                updatedAt: '2026-08-20T10:00:00.000Z',
            },
            {
                draftId: 'd-2',
                type: 'shared',
                title: 'Shared Curry',
                coCooksIds: ['u-2'],
                updatedAt: '2026-08-21T12:00:00.000Z',
            },
        ];

        (DraftService.getAllUserDrafts as jest.Mock).mockResolvedValue(
            mockDraftList
        );

        const response = await ActiveDraftsGET();
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(2);
        expect(data[0].type).toBe('solo');
        expect(data[1].type).toBe('shared');
        expect(DraftService.getAllUserDrafts).toHaveBeenCalledWith(mockUser.id);
    });

    it('returns empty array when user has no active drafts', async () => {
        mockedSession = {
            user: { email: mockUser.email },
            expires: '2026-12-31',
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (DraftService.getAllUserDrafts as jest.Mock).mockResolvedValue([]);

        const response = await ActiveDraftsGET();
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toEqual([]);
    });

    it('returns 500 when DraftService throws an unexpected error', async () => {
        mockedSession = {
            user: { email: mockUser.email },
            expires: '2026-12-31',
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (DraftService.getAllUserDrafts as jest.Mock).mockRejectedValue(
            new Error('Redis connection failure')
        );

        const response = await ActiveDraftsGET();
        expect(response.status).toBe(500);
    });
});
