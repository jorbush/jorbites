import { expect } from '@jest/globals';
import { POST as CompleteQuestPOST } from '@/app/api/quests/[id]/complete/route';
import { NextRequest } from 'next/server';

let mockedUser: any = null;

jest.mock('@/app/lib/prismadb', () => ({
    quest: {
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn(),
    },
    recipe: {
        findUnique: jest.fn(),
    },
}));

jest.mock('@/app/actions/getCurrentUser', () =>
    jest.fn(() => Promise.resolve(mockedUser))
);

import prisma from '@/app/lib/prismadb';

describe('Quest Complete API & Badge Forge Trigger (routes copy)', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUser = {
            id: 'quest-owner-id',
            name: 'Quest Owner',
            email: 'owner@example.com',
        };
        process.env.BADGE_FORGE_URL = 'http://localhost:4000';
        process.env.BADGE_FORGE_API_KEY = 'test-key';
        (prisma.quest.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
        (prisma.quest.findMany as jest.Mock).mockResolvedValue([]);
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('should return 401 if user is not authenticated', async () => {
        mockedUser = null;
        const mockParams = { params: Promise.resolve({ id: 'quest-123' }) };

        const request = new NextRequest(
            'http://localhost:3000/api/quests/quest-123/complete',
            {
                method: 'POST',
                body: JSON.stringify({ solverId: 'solver-456' }),
            }
        );

        const response = await CompleteQuestPOST(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'User authentication required to complete quest'
        );
    });

    it('should return 404 if quest does not exist', async () => {
        (prisma.quest.findUnique as jest.Mock).mockResolvedValue(null);
        const mockParams = { params: Promise.resolve({ id: 'non-existent' }) };

        const request = new NextRequest(
            'http://localhost:3000/api/quests/non-existent/complete',
            {
                method: 'POST',
                body: JSON.stringify({ solverId: 'solver-456' }),
            }
        );

        const response = await CompleteQuestPOST(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Quest not found');
    });

    it('should return 403 if user is not quest owner', async () => {
        (prisma.quest.findUnique as jest.Mock).mockResolvedValue({
            id: 'quest-123',
            userId: 'other-user-id',
            status: 'open',
            recipes: [],
        });
        const mockParams = { params: Promise.resolve({ id: 'quest-123' }) };

        const request = new NextRequest(
            'http://localhost:3000/api/quests/quest-123/complete',
            {
                method: 'POST',
                body: JSON.stringify({ solverId: 'solver-456' }),
            }
        );

        const response = await CompleteQuestPOST(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('You can only complete your own quests');
    });

    it('should mark quest completed, perform CAS update, and trigger Badge Forge evaluation', async () => {
        (prisma.quest.findUnique as jest.Mock)
            .mockResolvedValueOnce({
                id: 'quest-123',
                userId: 'quest-owner-id',
                status: 'open',
                recipes: [
                    {
                        id: 'recipe-789',
                        userId: 'solver-user-456',
                    },
                ],
            })
            .mockResolvedValueOnce({
                id: 'quest-123',
                userId: 'quest-owner-id',
                status: 'completed',
                acceptedRecipeId: 'recipe-789',
                acceptedSolverId: 'solver-user-456',
                badgeEvaluated: false,
                recipes: [],
            });

        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                status: 'success',
                granted_badges: ['quest_solver_1.webp'],
            }),
        });
        global.fetch = mockFetch as any;

        const mockParams = { params: Promise.resolve({ id: 'quest-123' }) };
        const request = new NextRequest(
            'http://localhost:3000/api/quests/quest-123/complete',
            {
                method: 'POST',
                body: JSON.stringify({ solverId: 'solver-user-456' }),
            }
        );

        const response = await CompleteQuestPOST(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('completed');
        expect(prisma.quest.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ id: 'quest-123' }),
                data: expect.objectContaining({
                    status: 'completed',
                    acceptedRecipeId: 'recipe-789',
                    acceptedSolverId: 'solver-user-456',
                }),
            })
        );
        expect(mockFetch).toHaveBeenCalledWith(
            'http://localhost:4000/api/evaluate',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    userId: 'solver-user-456',
                    event: 'QUEST_FULFILLED',
                }),
            })
        );
        expect(prisma.quest.update).toHaveBeenCalledWith({
            where: { id: 'quest-123' },
            data: { badgeEvaluated: true },
        });
    });

    it('should return 400 if solverId is spoofed / not linked to quest recipes', async () => {
        (prisma.quest.findUnique as jest.Mock).mockResolvedValue({
            id: 'quest-123',
            userId: 'quest-owner-id',
            status: 'open',
            recipes: [
                {
                    id: 'recipe-789',
                    userId: 'legit-solver-id',
                },
            ],
        });

        const mockParams = { params: Promise.resolve({ id: 'quest-123' }) };
        const request = new NextRequest(
            'http://localhost:3000/api/quests/quest-123/complete',
            {
                method: 'POST',
                body: JSON.stringify({ solverId: 'unrelated-friend-id' }),
            }
        );

        const response = await CompleteQuestPOST(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'Solver must have a submitted recipe for this quest'
        );
    });

    it('should return 400 if quest is already completed', async () => {
        (prisma.quest.findUnique as jest.Mock).mockResolvedValue({
            id: 'quest-123',
            userId: 'quest-owner-id',
            status: 'completed',
            recipes: [
                {
                    id: 'recipe-789',
                    userId: 'solver-user-456',
                },
            ],
        });

        const mockParams = { params: Promise.resolve({ id: 'quest-123' }) };
        const request = new NextRequest(
            'http://localhost:3000/api/quests/quest-123/complete',
            {
                method: 'POST',
                body: JSON.stringify({ solverId: 'solver-user-456' }),
            }
        );

        const response = await CompleteQuestPOST(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Quest is already completed');
    });
});
