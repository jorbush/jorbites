import { expect } from '@jest/globals';
import { triggerBadgeForgeEvaluation } from '@/app/lib/badgeForge';

describe('Badge Forge Client Library Tests', () => {
    const originalFetch = global.fetch;
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.BADGE_FORGE_URL = 'http://localhost:4000';
        process.env.BADGE_FORGE_API_KEY = 'test-key';
    });

    afterEach(() => {
        global.fetch = originalFetch;
        process.env = originalEnv;
    });

    it('should successfully trigger evaluation and return true', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'success' }),
        });
        global.fetch = mockFetch as any;

        const result = await triggerBadgeForgeEvaluation('solver-123');

        expect(result).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
            'http://localhost:4000/api/evaluate',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'test-key',
                },
                body: JSON.stringify({
                    userId: 'solver-123',
                    event: 'QUEST_FULFILLED',
                }),
                signal: expect.any(Object),
            })
        );
    });

    it('should handle non-200 responses and return false', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal server error' }),
        });
        global.fetch = mockFetch as any;

        const result = await triggerBadgeForgeEvaluation('solver-123');
        expect(result).toBe(false);
    });

    it('should handle network timeouts/exceptions and return false safely without throwing', async () => {
        const mockFetch = jest
            .fn()
            .mockRejectedValue(
                new Error('The operation was aborted due to timeout')
            );
        global.fetch = mockFetch as any;

        const result = await triggerBadgeForgeEvaluation('solver-123');
        expect(result).toBe(false);
    });
});
