import {
    GET as WeeklyChallengeGET,
    POST as WeeklyChallengePOST,
} from '@/app/api/weekly-challenge/route';

// Mock the weekly challenge lib
jest.mock('@/app/lib/weekly-challenge', () => ({
    getCurrentChallenge: jest.fn(),
    rotateWeeklyChallenge: jest.fn(),
}));

// Mock the logger
jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

import {
    getCurrentChallenge,
    rotateWeeklyChallenge,
} from '@/app/lib/weekly-challenge';
import { logger } from '@/app/lib/axiom/server';

describe('Weekly Challenge API', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, CRON_SECRET: 'test-secret' };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('GET /api/weekly-challenge', () => {
        it('should return weekly challenge successfully', async () => {
            const mockChallenge = {
                id: 'challenge-123',
                title: 'Test Challenge',
                description: 'Test Description',
                type: 'ingredient',
                value: 'tomato',
                startDate: new Date('2026-05-11T00:00:00.000Z'),
                endDate: new Date('2026-05-17T23:59:59.999Z'),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            (getCurrentChallenge as jest.Mock).mockResolvedValueOnce(
                mockChallenge
            );

            const response = await WeeklyChallengeGET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(JSON.parse(JSON.stringify(mockChallenge)));
            expect(getCurrentChallenge).toHaveBeenCalledTimes(1);
            expect(logger.info).toHaveBeenCalledWith(
                'api/weekly-challenge GET - start'
            );
            expect(logger.info).toHaveBeenCalledWith(
                'api/weekly-challenge GET - success',
                { challengeId: 'challenge-123' }
            );
        });

        it('should return 404 when no challenge is found', async () => {
            (getCurrentChallenge as jest.Mock).mockResolvedValueOnce(null);

            const response = await WeeklyChallengeGET();
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toMatchObject({
                error: 'No active weekly challenge found',
                code: 'NOT_FOUND',
            });
            expect(logger.info).toHaveBeenCalledWith(
                'api/weekly-challenge GET - no active challenge found'
            );
        });

        it('should return 500 when getCurrentChallenge throws an error', async () => {
            const error = new Error('Database error');
            (getCurrentChallenge as jest.Mock).mockRejectedValueOnce(error);

            const response = await WeeklyChallengeGET();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toMatchObject({
                error: 'Failed to fetch weekly challenge',
                code: 'INTERNAL_SERVER_ERROR',
            });
            expect(logger.error).toHaveBeenCalledWith(
                'api/weekly-challenge GET - error',
                { error: 'Database error' }
            );
        });
    });

    describe('POST /api/weekly-challenge', () => {
        it('should rotate weekly challenge successfully with valid CRON_SECRET (case-insensitive)', async () => {
            const mockChallenge = {
                id: 'challenge-456',
                title: 'New Challenge',
                description: 'New Description',
                type: 'cuisine',
                value: 'italian',
                startDate: new Date(),
                endDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            (rotateWeeklyChallenge as jest.Mock).mockResolvedValueOnce(
                mockChallenge
            );

            const request = new Request(
                'http://localhost/api/weekly-challenge',
                {
                    method: 'POST',
                    headers: {
                        Authorization: 'bearer test-secret ',
                    },
                }
            );

            const response = await WeeklyChallengePOST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(JSON.parse(JSON.stringify(mockChallenge)));
            expect(rotateWeeklyChallenge).toHaveBeenCalledTimes(1);
            expect(logger.info).toHaveBeenCalledWith(
                'api/weekly-challenge POST - success',
                { challengeId: 'challenge-456' }
            );
        });

        it('should return 401 when CRON_SECRET is invalid', async () => {
            const request = new Request(
                'http://localhost/api/weekly-challenge',
                {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer wrong-secret',
                    },
                }
            );

            const response = await WeeklyChallengePOST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toBeDefined();
            expect(data).toMatchObject({
                error: 'Invalid token or scheme',
                code: 'UNAUTHORIZED',
            });
            expect(logger.error).toHaveBeenCalledWith(
                'api/weekly-challenge POST - invalid token or scheme'
            );
        });

        it('should return 401 when Authorization header is missing', async () => {
            const request = new Request(
                'http://localhost/api/weekly-challenge',
                {
                    method: 'POST',
                }
            );

            const response = await WeeklyChallengePOST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toMatchObject({
                error: 'Missing Authorization header',
                code: 'UNAUTHORIZED',
            });
            expect(logger.error).toHaveBeenCalledWith(
                'api/weekly-challenge POST - missing Authorization header'
            );
        });

        it('should return 500 when rotateWeeklyChallenge throws an error', async () => {
            const error = new Error('Database error');
            (rotateWeeklyChallenge as jest.Mock).mockRejectedValueOnce(error);

            const request = new Request(
                'http://localhost/api/weekly-challenge',
                {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer test-secret',
                    },
                }
            );

            const response = await WeeklyChallengePOST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toMatchObject({
                error: 'Failed to rotate weekly challenge',
                code: 'INTERNAL_SERVER_ERROR',
            });
        });
    });
});
