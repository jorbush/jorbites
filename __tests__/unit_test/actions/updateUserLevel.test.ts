import updateUserLevel from '@/app/actions/updateUserLevel';

jest.unmock('@/app/actions/updateUserLevel');

describe('updateUserLevel Server Action', () => {
    const originalUrl = process.env.BADGE_FORGE_URL;
    const originalKey = process.env.BADGE_FORGE_API_KEY;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.BADGE_FORGE_URL = 'http://badge-forge.example.com';
        process.env.BADGE_FORGE_API_KEY = 'test-badge-key';
        (global as any).fetch = jest.fn();
    });

    afterEach(() => {
        process.env.BADGE_FORGE_URL = originalUrl;
        process.env.BADGE_FORGE_API_KEY = originalKey;
    });

    it('should post userId to badge forge service', async () => {
        jest.mocked(fetch).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ success: true }),
        } as any);

        await updateUserLevel({ userId: 'u123' });

        expect(fetch).toHaveBeenCalledWith(
            'http://badge-forge.example.com/update',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'test-badge-key',
                },
                body: JSON.stringify({ user_id: 'u123' }),
            })
        );
    });

    it('should catch badge forge response error gracefully', async () => {
        jest.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: jest.fn().mockResolvedValue({ error: 'Service Unavailable' }),
        } as any);

        await expect(
            updateUserLevel({ userId: 'u123' })
        ).resolves.toBeUndefined();
    });
});
