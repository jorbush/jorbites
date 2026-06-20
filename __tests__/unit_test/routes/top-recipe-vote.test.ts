import {
    GET as topRecipeVoteGET,
    POST as topRecipeVotePOST,
} from '@/app/api/top-recipe-vote/route';

// Mock the top recipe vote lib
jest.mock('@/app/lib/top-recipe-vote', () => ({
    getActiveSession: jest.fn(),
    getSessionDetails: jest.fn(),
    openVoteSession: jest.fn(),
    closeVoteSession: jest.fn(),
    castVote: jest.fn(),
}));

// Mock current user actions
jest.mock('@/app/actions/getCurrentUser', () => jest.fn());

// Mock Prisma
jest.mock('@/app/lib/prismadb', () => ({
    recipeVote: {
        findUnique: jest.fn(),
    },
}));

// Mock Axiom logger
jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

import {
    getActiveSession,
    getSessionDetails,
    openVoteSession,
    closeVoteSession,
    castVote,
} from '@/app/lib/top-recipe-vote';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';

describe('Top Recipe Vote API Route', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, CRON_SECRET: 'test-secret' };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('GET /api/top-recipe-vote', () => {
        it('should return 400 if category is missing or invalid', async () => {
            const req = new Request(
                'http://localhost:3000/api/top-recipe-vote'
            );
            const res = await topRecipeVoteGET(req);
            expect(res.status).toBe(400);

            const req2 = new Request(
                'http://localhost:3000/api/top-recipe-vote?category=invalid'
            );
            const res2 = await topRecipeVoteGET(req2);
            expect(res2.status).toBe(400);
        });

        it('should return session: null if no active session exists', async () => {
            const req = new Request(
                'http://localhost:3000/api/top-recipe-vote?category=week'
            );
            (getActiveSession as jest.Mock).mockResolvedValueOnce(null);

            const res = await topRecipeVoteGET(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data).toEqual({ session: null });
            expect(getActiveSession).toHaveBeenCalledWith('week');
        });

        it('should return enriched session and user vote successfully', async () => {
            const req = new Request(
                'http://localhost:3000/api/top-recipe-vote?category=week'
            );
            const mockSession = {
                id: 'session-123',
                category: 'week',
                periodKey: '2026-W25',
            };
            const enrichedSession = {
                ...mockSession,
                candidates: [],
                winner: null,
            };
            const mockUser = { id: 'user-123', email: 'test@test.com' };
            const mockVote = { id: 'vote-123', recipeId: 'recipe-123' };

            (getActiveSession as jest.Mock).mockResolvedValueOnce(mockSession);
            (getSessionDetails as jest.Mock).mockResolvedValueOnce(
                enrichedSession
            );
            (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
            (prisma.recipeVote.findUnique as jest.Mock).mockResolvedValueOnce(
                mockVote
            );

            const res = await topRecipeVoteGET(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data).toEqual({
                session: enrichedSession,
                userVote: mockVote,
            });
            expect(getActiveSession).toHaveBeenCalledWith('week');
            expect(getSessionDetails).toHaveBeenCalledWith(mockSession);
            expect(prisma.recipeVote.findUnique).toHaveBeenCalled();
        });
    });

    describe('POST /api/top-recipe-vote', () => {
        describe('Cron Job Flow', () => {
            it('should return 401 if token is invalid', async () => {
                const req = new Request(
                    'http://localhost:3000/api/top-recipe-vote',
                    {
                        method: 'POST',
                        headers: { Authorization: 'Bearer wrong-secret' },
                        body: JSON.stringify({
                            action: 'open',
                            category: 'week',
                        }),
                    }
                );

                const res = await topRecipeVotePOST(req);
                expect(res.status).toBe(401);
            });

            it('should open voting session successfully', async () => {
                const req = new Request(
                    'http://localhost:3000/api/top-recipe-vote',
                    {
                        method: 'POST',
                        headers: { Authorization: 'Bearer test-secret' },
                        body: JSON.stringify({
                            action: 'open',
                            category: 'week',
                        }),
                    }
                );

                const mockSession = { id: 'session-123', category: 'week' };
                (openVoteSession as jest.Mock).mockResolvedValueOnce(
                    mockSession
                );

                const res = await topRecipeVotePOST(req);
                const data = await res.json();

                expect(res.status).toBe(200);
                expect(data).toEqual({
                    status: 'success',
                    session: mockSession,
                });
                expect(openVoteSession).toHaveBeenCalledWith('week');
            });

            it('should return skipped status if openVoteSession returns null', async () => {
                const req = new Request(
                    'http://localhost:3000/api/top-recipe-vote',
                    {
                        method: 'POST',
                        headers: { Authorization: 'Bearer test-secret' },
                        body: JSON.stringify({
                            action: 'open',
                            category: 'week',
                        }),
                    }
                );

                (openVoteSession as jest.Mock).mockResolvedValueOnce(null);

                const res = await topRecipeVotePOST(req);
                const data = await res.json();

                expect(res.status).toBe(200);
                expect(data.status).toBe('skipped');
                expect(openVoteSession).toHaveBeenCalledWith('week');
            });

            it('should close voting session successfully', async () => {
                const req = new Request(
                    'http://localhost:3000/api/top-recipe-vote',
                    {
                        method: 'POST',
                        headers: { Authorization: 'Bearer test-secret' },
                        body: JSON.stringify({
                            action: 'close',
                            category: 'week',
                        }),
                    }
                );

                const mockSession = { id: 'session-123', status: 'closed' };
                (closeVoteSession as jest.Mock).mockResolvedValueOnce(
                    mockSession
                );

                const res = await topRecipeVotePOST(req);
                const data = await res.json();

                expect(res.status).toBe(200);
                expect(data).toEqual({
                    status: 'success',
                    session: mockSession,
                });
                expect(closeVoteSession).toHaveBeenCalledWith('week');
            });
        });

        describe('User Voting Flow', () => {
            it('should return 401 if user is not logged in', async () => {
                const req = new Request(
                    'http://localhost:3000/api/top-recipe-vote',
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            sessionId: 'session-123',
                            recipeId: 'recipe-123',
                        }),
                    }
                );

                (getCurrentUser as jest.Mock).mockResolvedValueOnce(null);

                const res = await topRecipeVotePOST(req);
                expect(res.status).toBe(401);
            });

            it('should register vote successfully', async () => {
                const req = new Request(
                    'http://localhost:3000/api/top-recipe-vote',
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            sessionId: 'session-123',
                            recipeId: 'recipe-123',
                        }),
                    }
                );

                const mockUser = { id: 'user-123' };
                const mockVote = { id: 'vote-123' };

                (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
                (castVote as jest.Mock).mockResolvedValueOnce(mockVote);

                const res = await topRecipeVotePOST(req);
                const data = await res.json();

                expect(res.status).toBe(200);
                expect(data).toEqual({ status: 'success', vote: mockVote });
                expect(castVote).toHaveBeenCalledWith(
                    'user-123',
                    'session-123',
                    'recipe-123'
                );
            });
        });
    });
});
