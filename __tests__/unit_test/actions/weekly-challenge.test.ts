import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentChallenge } from '@/app/actions/weekly-challenge';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { getCurrentChallenge as getCurrentChallengeLib } from '@/app/lib/weekly-challenge';
import { headers } from 'next/headers';

vi.mock('@/app/actions/getCurrentUser');
vi.mock('@/app/lib/weekly-challenge');
vi.mock('next/headers');

describe('getCurrentChallenge', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(headers).mockResolvedValue({
            get: vi.fn().mockReturnValue(null),
        } as any);
    });

    it('should throw an error if user is not authenticated and no valid cron token', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);
        vi.stubEnv('CRON_SECRET', 'test-secret');

        await expect(getCurrentChallenge()).rejects.toThrow('Unauthorized');
        expect(getCurrentChallengeLib).not.toHaveBeenCalled();
    });

    it('should return the challenge if user is authenticated', async () => {
        const mockUser = { id: 'user-1' } as any;
        const mockChallenge = { id: 'challenge-1', title: 'Test' } as any;

        vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
        vi.mocked(getCurrentChallengeLib).mockResolvedValue(mockChallenge);

        const result = await getCurrentChallenge();

        expect(result).toEqual(mockChallenge);
        expect(getCurrentChallengeLib).toHaveBeenCalledTimes(1);
    });

    it('should return the challenge if CRON_SECRET matches', async () => {
        const mockChallenge = { id: 'challenge-1', title: 'Test' } as any;
        const cronSecret = 'valid-token';

        vi.mocked(getCurrentUser).mockResolvedValue(null);
        vi.mocked(getCurrentChallengeLib).mockResolvedValue(mockChallenge);
        vi.stubEnv('CRON_SECRET', cronSecret);
        vi.mocked(headers).mockResolvedValue({
            get: vi.fn().mockReturnValue(`Bearer ${cronSecret}`),
        } as any);

        const result = await getCurrentChallenge();

        expect(result).toEqual(mockChallenge);
        expect(getCurrentChallengeLib).toHaveBeenCalledTimes(1);
    });

    it('should throw Unauthorized if CRON_SECRET is provided but token is invalid', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);
        vi.stubEnv('CRON_SECRET', 'valid-token');
        vi.mocked(headers).mockResolvedValue({
            get: vi.fn().mockReturnValue('Bearer invalid-token'),
        } as any);

        await expect(getCurrentChallenge()).rejects.toThrow('Unauthorized');
        expect(getCurrentChallengeLib).not.toHaveBeenCalled();
    });
});
