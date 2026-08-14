import { expect } from '@jest/globals';
import { PATCH as QuestPatch } from '@/app/api/quest/[questId]/route';
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

describe('Quest PATCH API Route Tests', () => {
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

    it('should complete quest via PATCH and evaluate Badge Forge immediately', async () => {
        (prisma.quest.findUnique as jest.Mock).mockResolvedValue({
            id: 'quest-123',
            userId: 'quest-owner-id',
            status: 'open',
            recipes: [
                {
                    id: 'recipe-789',
                    userId: 'solver-user-456',
                },
            ],
        });

        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'success' }),
        });
        global.fetch = mockFetch as any;

        const mockParams = Promise.resolve({ questId: 'quest-123' });
        const request = new NextRequest(
            'http://localhost:3000/api/quest/quest-123',
            {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' }),
            }
        );

        const response = await QuestPatch(request, { params: mockParams });
        expect(response.status).toBe(200);
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

    it('should allow editing title and description on an already completed quest without re-evaluating', async () => {
        (prisma.quest.findUnique as jest.Mock).mockResolvedValue({
            id: 'quest-123',
            userId: 'quest-owner-id',
            status: 'completed',
            title: 'Old Title',
            description: 'Old Description',
            acceptedRecipeId: 'recipe-789',
            acceptedSolverId: 'solver-user-456',
            badgeEvaluated: true,
            recipes: [],
        });

        (prisma.quest.update as jest.Mock).mockResolvedValue({
            id: 'quest-123',
            userId: 'quest-owner-id',
            status: 'completed',
            title: 'Updated Title',
            description: 'Updated Description',
            acceptedRecipeId: 'recipe-789',
            acceptedSolverId: 'solver-user-456',
            badgeEvaluated: true,
            recipes: [],
        });

        const mockParams = Promise.resolve({ questId: 'quest-123' });
        const request = new NextRequest(
            'http://localhost:3000/api/quest/quest-123',
            {
                method: 'PATCH',
                body: JSON.stringify({
                    title: 'Updated Title',
                    description: 'Updated Description',
                }),
            }
        );

        const response = await QuestPatch(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.title).toBe('Updated Title');
        expect(prisma.quest.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'quest-123' },
                data: expect.objectContaining({
                    title: 'Updated Title',
                    description: 'Updated Description',
                }),
            })
        );
    });

    it('should prevent reopening a completed quest', async () => {
        (prisma.quest.findUnique as jest.Mock).mockResolvedValue({
            id: 'quest-123',
            userId: 'quest-owner-id',
            status: 'completed',
            acceptedRecipeId: 'recipe-789',
            acceptedSolverId: 'solver-user-456',
            badgeEvaluated: true,
            recipes: [],
        });

        const mockParams = Promise.resolve({ questId: 'quest-123' });
        const request = new NextRequest(
            'http://localhost:3000/api/quest/quest-123',
            {
                method: 'PATCH',
                body: JSON.stringify({ status: 'open' }),
            }
        );

        const response = await QuestPatch(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Completed quests cannot be reopened');
    });

    it('should require specifying recipeId if multiple submissions exist', async () => {
        (prisma.quest.findUnique as jest.Mock).mockResolvedValue({
            id: 'quest-123',
            userId: 'quest-owner-id',
            status: 'open',
            recipes: [
                { id: 'recipe-1', userId: 'user-1' },
                { id: 'recipe-2', userId: 'user-2' },
            ],
        });

        const mockParams = Promise.resolve({ questId: 'quest-123' });
        const request = new NextRequest(
            'http://localhost:3000/api/quest/quest-123',
            {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' }),
            }
        );

        const response = await QuestPatch(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'Multiple recipe submissions exist. Please specify which recipe is accepted.'
        );
    });
});
