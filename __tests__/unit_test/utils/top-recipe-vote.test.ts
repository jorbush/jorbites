import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getPeriodKey,
    getVotingWindow,
    getCandidates,
    openVoteSession,
    closeVoteSession,
} from '@/app/lib/top-recipe-vote';

// Mock Prisma
vi.mock('@/app/lib/prismadb', () => {
    const mockPrisma = {
        recipe: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
        },
        recipeVoteSession: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        recipeVote: {
            findUnique: vi.fn(),
            upsert: vi.fn(),
            groupBy: vi.fn(),
        },
    };
    return {
        default: mockPrisma,
        ...mockPrisma,
    };
});

// Mock sendNotification
vi.mock('@/app/actions/sendNotification', () => ({
    default: vi.fn(),
}));

// Mock Axiom logger
vi.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';

describe('Top Recipe Vote Business Logic', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = {
            ...originalEnv,
            BADGE_FORGE_URL: 'http://badgeforge',
            BADGE_FORGE_API_KEY: 'test-api-key',
        };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: 'success' }),
        }) as any;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('getPeriodKey', () => {
        it('should return correct format for week category', () => {
            const date = new Date('2026-06-22T12:00:00.000Z'); // A Monday in ISO week 26
            expect(getPeriodKey('week', date)).toBe('2026-W26');
        });

        it('should return correct format for month category', () => {
            const date = new Date('2026-06-22T12:00:00.000Z');
            expect(getPeriodKey('month', date)).toBe('2026-06');
        });

        it('should return correct format for year category', () => {
            const date = new Date('2026-06-22T12:00:00.000Z');
            expect(getPeriodKey('year', date)).toBe('2026');
        });
    });

    describe('getVotingWindow', () => {
        it('should return correct week start and end dates', () => {
            const targetDate = new Date('2026-06-22T12:00:00.000Z');
            const window = getVotingWindow('week', targetDate);

            expect(window.start.getDay()).toBe(1); // Monday
            expect(window.end.getDay()).toBe(0); // Sunday
        });

        it('should return correct month start and end dates', () => {
            const targetDate = new Date('2026-06-22T12:00:00.000Z');
            const window = getVotingWindow('month', targetDate);

            expect(window.start.getDate()).toBe(1); // 1st
            expect(window.end.getDate()).toBe(30); // 30th of June
        });
    });

    describe('getCandidates', () => {
        it('should query recipes within the correct window ordered by likes', async () => {
            const mockRecipes = [{ id: '1' }, { id: '2' }];
            vi.mocked(prisma.recipe.findMany).mockResolvedValueOnce(
                mockRecipes as any
            );

            const refDate = new Date('2026-06-22T12:00:00.000Z'); // Monday
            const candidates = await getCandidates('week', refDate);

            expect(candidates).toEqual(mockRecipes as any);
            expect(prisma.recipe.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { numLikes: 'desc' },
                    take: 10,
                })
            );
        });
    });

    describe('openVoteSession', () => {
        it('should return existing session if already opened', async () => {
            const mockSession = { id: 'existing-123' };
            vi.mocked(
                prisma.recipeVoteSession.findUnique
            ).mockResolvedValueOnce(mockSession as any);

            const session = await openVoteSession(
                'week',
                new Date('2026-06-22T12:00:00.000Z')
            );
            expect(session).toEqual(mockSession as any);
            expect(prisma.recipeVoteSession.create).not.toHaveBeenCalled();
        });

        it('should return null if there are fewer than 4 candidates', async () => {
            vi.mocked(
                prisma.recipeVoteSession.findUnique
            ).mockResolvedValueOnce(null);
            vi.mocked(prisma.recipe.findMany).mockResolvedValueOnce([
                { id: '1' },
                { id: '2' },
            ] as any);

            const session = await openVoteSession(
                'week',
                new Date('2026-06-22T12:00:00.000Z')
            );
            expect(session).toBeNull();
            expect(prisma.recipeVoteSession.create).not.toHaveBeenCalled();
        });

        it('should create new session if 4 or more candidates exist', async () => {
            vi.mocked(
                prisma.recipeVoteSession.findUnique
            ).mockResolvedValueOnce(null);
            vi.mocked(prisma.recipe.findMany).mockResolvedValueOnce([
                { id: '1' },
                { id: '2' },
                { id: '3' },
                { id: '4' },
            ] as any);
            const mockSession = { id: 'new-123' };
            vi.mocked(prisma.recipeVoteSession.create).mockResolvedValueOnce(
                mockSession as any
            );

            const session = await openVoteSession(
                'week',
                new Date('2026-06-22T12:00:00.000Z')
            );
            expect(session).toEqual(mockSession as any);
            expect(prisma.recipeVoteSession.create).toHaveBeenCalled();
        });
    });

    describe('closeVoteSession', () => {
        it('should count votes, tie-break by likes, close session and award badge', async () => {
            const mockSession = {
                id: 'session-123',
                category: 'week',
                periodKey: '2026-W25',
                candidates: ['r1', 'r2', 'r3', 'r4'],
                status: 'voting',
            };
            vi.mocked(
                prisma.recipeVoteSession.findUnique
            ).mockResolvedValueOnce(mockSession as any);

            // Votes count: r1 has 2 votes, r2 has 2 votes, r3 has 1 vote, r4 has 0
            vi.mocked(prisma.recipeVote.groupBy).mockResolvedValueOnce([
                { recipeId: 'r1', _count: { recipeId: 2 } },
                { recipeId: 'r2', _count: { recipeId: 2 } },
                { recipeId: 'r3', _count: { recipeId: 1 } },
            ] as any);

            // Candidate details: r2 has more likes than r1 (tie breaker winner)
            vi.mocked(prisma.recipe.findMany).mockResolvedValueOnce([
                { id: 'r1', numLikes: 10, userId: 'user-a' },
                { id: 'r2', numLikes: 15, userId: 'user-b' },
                { id: 'r3', numLikes: 5, userId: 'user-c' },
                { id: 'r4', numLikes: 2, userId: 'user-d' },
            ] as any);

            const mockUpdatedSession = {
                ...mockSession,
                status: 'closed',
                winnerId: 'r2',
            };
            vi.mocked(prisma.recipeVoteSession.update).mockResolvedValueOnce(
                mockUpdatedSession as any
            );

            const result = await closeVoteSession(
                'week',
                new Date('2026-06-22T12:00:00.000Z')
            );

            expect(result).toEqual(mockUpdatedSession as any);
            expect(prisma.recipeVoteSession.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'session-123' },
                    data: expect.objectContaining({
                        status: 'closed',
                        winnerId: 'r2',
                    }),
                })
            );
            expect(global.fetch).toHaveBeenCalledWith(
                'http://badgeforge/award-top-recipe',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        category: 'week',
                        user_id: 'user-b',
                        recipe_id: 'r2',
                    }),
                })
            );
        });
    });
});
