import { GET as BadgesGET } from '@/app/api/badges/route';
import fs from 'fs/promises';
import { logger } from '@/app/lib/axiom/server';

// Mock the logger
jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Badges API', () => {
    let readdirSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        readdirSpy = jest.spyOn(fs, 'readdir');
    });

    afterEach(() => {
        readdirSpy.mockRestore();
    });

    it('should scan public/badges directory, return only webp filenames without extension', async () => {
        const mockFiles = [
            'badge_1st_jorbites_contest.webp',
            'level_100.webp',
            'not_a_badge.png',
            'another_file.txt',
            'week_streak.webp',
        ];

        readdirSpy.mockResolvedValueOnce(mockFiles);

        const response = await BadgesGET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([
            'badge_1st_jorbites_contest',
            'level_100',
            'week_streak',
        ]);
        expect(readdirSpy).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith('api/badges GET - start');
        expect(logger.info).toHaveBeenCalledWith(
            'api/badges GET - success, found 3 badges'
        );
    });

    it('should return 500 when fs.readdir throws an error', async () => {
        const dbError = new Error('FS Error: Disk failure');
        readdirSpy.mockRejectedValueOnce(dbError);

        const response = await BadgesGET();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toMatchObject({
            error: 'Failed to fetch available badges',
            code: 'INTERNAL_SERVER_ERROR',
        });
        expect(logger.error).toHaveBeenCalledWith('api/badges GET - error', {
            error: 'FS Error: Disk failure',
        });
    });
});
