import { expect } from '@jest/globals';
import { GET as WeeklyChallengeGET } from '@/app/api/weekly-challenge/route';

// Mock the weekly challenge action
jest.mock('@/app/actions/weekly-challenge', () => ({
    getCurrentChallenge: jest.fn(),
}));

// Mock the logger
jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

import { getCurrentChallenge } from '@/app/actions/weekly-challenge';
import { logger } from '@/app/lib/axiom/server';

describe('Weekly Challenge API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
            expect(data.timestamp).toBeDefined();
            expect(logger.error).toHaveBeenCalledWith(
                'api/weekly-challenge GET - error',
                { error: 'Database error' }
            );
        });
    });
});
