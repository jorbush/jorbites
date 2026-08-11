import { getCurrentChallenge } from '@/app/actions/weekly-challenge';
import { getCurrentChallenge as getCurrentChallengeLib } from '@/app/lib/weekly-challenge';

jest.mock('@/app/lib/weekly-challenge', () => ({
    getCurrentChallenge: jest.fn(),
}));

describe('weekly-challenge Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return null when no current challenge is active', async () => {
        jest.mocked(getCurrentChallengeLib).mockResolvedValue(null);

        const result = await getCurrentChallenge();
        expect(result).toBeNull();
    });

    it('should return formatted safe weekly challenge when active', async () => {
        const mockChallenge = {
            id: 'wc-1',
            title: 'Summer Salad',
            startDate: new Date('2026-08-01T00:00:00.000Z'),
            endDate: new Date('2026-08-07T00:00:00.000Z'),
            createdAt: new Date('2026-07-30T00:00:00.000Z'),
            updatedAt: new Date('2026-07-30T00:00:00.000Z'),
        };

        jest.mocked(getCurrentChallengeLib).mockResolvedValue(
            mockChallenge as any
        );

        const result = await getCurrentChallenge();

        expect(result).toEqual({
            ...mockChallenge,
            startDate: '2026-08-01T00:00:00.000Z',
            endDate: '2026-08-07T00:00:00.000Z',
            createdAt: '2026-07-30T00:00:00.000Z',
            updatedAt: '2026-07-30T00:00:00.000Z',
        });
    });
});
