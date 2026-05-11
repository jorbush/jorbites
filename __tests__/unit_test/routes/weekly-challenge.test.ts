import { expect } from '@jest/globals';
import { GET as WeeklyChallengeGET, POST as WeeklyChallengePOST } from '@/app/api/weekly-challenge/route';

// Mock the weekly challenge library
jest.mock('@/app/lib/weekly-challenge', () => ({
    fetchCurrentChallenge: jest.fn(),
    generateNewChallenge: jest.fn(),
}));

// Mock the logger
jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

import { fetchCurrentChallenge, generateNewChallenge } from '@/app/lib/weekly-challenge';
import { logger } from '@/app/lib/axiom/server';

describe('Weekly Challenge API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.CRON_SECRET = 'test-secret';
    });

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

    describe('GET /api/weekly-challenge', () => {
        it('should return weekly challenge successfully', async () => {
            (fetchCurrentChallenge as jest.Mock).mockResolvedValueOnce(
                mockChallenge
            );

            const response = await WeeklyChallengeGET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(JSON.parse(JSON.stringify(mockChallenge)));
            expect(fetchCurrentChallenge).toHaveBeenCalledTimes(1);
            expect(logger.info).toHaveBeenCalledWith(
                'api/weekly-challenge GET - start'
            );
            expect(logger.info).toHaveBeenCalledWith(
                'api/weekly-challenge GET - success',
                { challengeId: 'challenge-123' }
            );
        });

        it('should return 404 when no challenge is found', async () => {
            (fetchCurrentChallenge as jest.Mock).mockResolvedValueOnce(null);

            const response = await WeeklyChallengeGET();
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('No active weekly challenge found');
            expect(logger.info).toHaveBeenCalledWith(
                'api/weekly-challenge GET - not found'
            );
        });

        it('should return 500 when fetchCurrentChallenge throws an error', async () => {
            const error = new Error('Database error');
            (fetchCurrentChallenge as jest.Mock).mockRejectedValueOnce(error);

            const response = await WeeklyChallengeGET();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch weekly challenge');
            expect(logger.error).toHaveBeenCalledWith(
                'api/weekly-challenge GET - error',
                { error: 'Database error' }
            );
        });
    });

    describe('POST /api/weekly-challenge', () => {
        it('should generate new challenge successfully with valid auth', async () => {
            (generateNewChallenge as jest.Mock).mockResolvedValueOnce(
                mockChallenge
            );

            const request = new Request('http://localhost/api/weekly-challenge', {
                method: 'POST',
                headers: {
                    'authorization': 'Bearer test-secret',
                },
            });

            const response = await WeeklyChallengePOST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(JSON.parse(JSON.stringify(mockChallenge)));
            expect(generateNewChallenge).toHaveBeenCalledTimes(1);
            expect(logger.info).toHaveBeenCalledWith(
                'api/weekly-challenge POST - start'
            );
            expect(logger.info).toHaveBeenCalledWith(
                'api/weekly-challenge POST - success',
                { challengeId: 'challenge-123' }
            );
        });

        it('should return 401 with missing auth header', async () => {
            const request = new Request('http://localhost/api/weekly-challenge', {
                method: 'POST',
            });

            const response = await WeeklyChallengePOST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Invalid or missing CRON_SECRET');
            expect(logger.error).toHaveBeenCalledWith(
                'api/weekly-challenge POST - unauthorized'
            );
        });

        it('should return 401 with invalid auth header', async () => {
            const request = new Request('http://localhost/api/weekly-challenge', {
                method: 'POST',
                headers: {
                    'authorization': 'Bearer wrong-secret',
                },
            });

            const response = await WeeklyChallengePOST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Invalid or missing CRON_SECRET');
            expect(logger.error).toHaveBeenCalledWith(
                'api/weekly-challenge POST - unauthorized'
            );
        });

        it('should return 500 when generateNewChallenge throws an error', async () => {
            const error = new Error('Generation error');
            (generateNewChallenge as jest.Mock).mockRejectedValueOnce(error);

            const request = new Request('http://localhost/api/weekly-challenge', {
                method: 'POST',
                headers: {
                    'authorization': 'Bearer test-secret',
                },
            });

            const response = await WeeklyChallengePOST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to generate weekly challenge');
            expect(logger.error).toHaveBeenCalledWith(
                'api/weekly-challenge POST - error',
                { error: 'Generation error' }
            );
        });
    });
});
