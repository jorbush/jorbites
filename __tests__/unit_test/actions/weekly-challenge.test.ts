import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentChallenge } from '@/app/actions/weekly-challenge';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { getCurrentChallenge as getCurrentChallengeLib } from '@/app/lib/weekly-challenge';

vi.mock('@/app/actions/getCurrentUser');
vi.mock('@/app/lib/weekly-challenge');

describe('getCurrentChallenge', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should throw an error if user is not authenticated', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);

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
});
