import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
    MockInstance,
} from 'vitest';
import { logger } from '@/app/lib/axiom/server';

vi.mock('next/navigation', () => ({
    unauthorized: vi.fn(() => {
        throw new Error('UNAUTHORIZED');
    }),
}));

vi.mock('@/app/actions/getCurrentUser', async (importOriginal) => {
    const original =
        await importOriginal<typeof import('@/app/actions/getCurrentUser')>();
    return {
        ...original,
        default: vi.fn(),
        auth: vi.fn(() =>
            Promise.resolve({
                user: { id: 'user-1', email: 'user-1@test.com' },
            })
        ),
    };
});

// ---------------------------------------------------------------------------
// Helpers to build a mock producer
// ---------------------------------------------------------------------------
function makeMockProducer({
    connectDelay = 0,
    sendDelay = 0,
    connectShouldFail = false,
    sendShouldFail = false,
}: {
    connectDelay?: number;
    sendDelay?: number;
    connectShouldFail?: boolean;
    sendShouldFail?: boolean;
} = {}) {
    const connect = vi.fn(() =>
        connectShouldFail
            ? new Promise<void>((_, reject) =>
                  setTimeout(
                      () => reject(new Error('Kafka connect failed')),
                      connectDelay
                  )
              )
            : new Promise<void>((resolve) => setTimeout(resolve, connectDelay))
    );
    const send = vi.fn(() =>
        sendShouldFail
            ? new Promise<void>((_, reject) =>
                  setTimeout(
                      () => reject(new Error('Kafka send failed')),
                      sendDelay
                  )
              )
            : new Promise<void>((resolve) => setTimeout(resolve, sendDelay))
    );
    return { connect, send };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('trackUserInteraction', () => {
    // We reload the module between tests to reset `isConnected` state.
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('is a no-op (with a warning) when Kafka producer is null', async () => {
        vi.doMock('@/app/lib/kafka', () => ({
            default: null,
            kafkaStatus: { isConnected: false },
        }));
        const { trackRecipeView } = await import('@/app/actions/tracking');

        vi.stubEnv('NODE_ENV', 'production');

        await trackRecipeView('recipe-1');

        expect(
            (logger.warn as unknown as MockInstance).mock.calls.length
        ).toBeGreaterThan(0);
        expect(logger.error).not.toHaveBeenCalled();

        vi.unstubAllEnvs();
    });

    it('connects once and sends successfully on the happy path', async () => {
        const mockProducer = makeMockProducer();
        vi.doMock('@/app/lib/kafka', () => ({
            default: mockProducer,
            kafkaStatus: { isConnected: false },
        }));
        const { trackRecipeView, trackRecipeLike } =
            await import('@/app/actions/tracking');

        // First event – should connect + send
        const p1 = trackRecipeView('recipe-1');
        vi.runAllTimersAsync();
        await p1;

        // Second event – should NOT call connect again (already connected)
        const p2 = trackRecipeLike('recipe-1');
        vi.runAllTimersAsync();
        await p2;

        expect(mockProducer.connect).toHaveBeenCalledTimes(1);
        expect(mockProducer.send).toHaveBeenCalledTimes(2);
        expect(logger.error).not.toHaveBeenCalled();
    });

    it('times out and logs an error when connect exceeds KAFKA_TIMEOUT_MS', async () => {
        // connect takes 10 seconds – well above the 3-second timeout
        const mockProducer = makeMockProducer({ connectDelay: 10_000 });
        vi.doMock('@/app/lib/kafka', () => ({
            default: mockProducer,
            kafkaStatus: { isConnected: false },
        }));
        const { trackRecipeView } = await import('@/app/actions/tracking');

        const promise = trackRecipeView('recipe-1');
        // Advance time past the 3 s timeout
        await vi.advanceTimersByTimeAsync(3_001);
        await promise;

        expect(logger.error).toHaveBeenCalledWith(
            'Failed to track user interaction',
            expect.objectContaining({
                error: expect.stringContaining('timed out'),
            })
        );
    });

    it('times out and logs an error when send exceeds KAFKA_TIMEOUT_MS', async () => {
        // connect is fast, but send takes 10 seconds
        const mockProducer = makeMockProducer({
            connectDelay: 0,
            sendDelay: 10_000,
        });
        vi.doMock('@/app/lib/kafka', () => ({
            default: mockProducer,
            kafkaStatus: { isConnected: false },
        }));
        const { trackRecipeView } = await import('@/app/actions/tracking');

        const promise = trackRecipeView('recipe-1');
        await vi.advanceTimersByTimeAsync(3_001);
        await promise;

        expect(logger.error).toHaveBeenCalledWith(
            'Failed to track user interaction',
            expect.objectContaining({
                error: expect.stringContaining('timed out'),
            })
        );
    });

    it('does NOT propagate the error to the caller when Kafka times out', async () => {
        const mockProducer = makeMockProducer({ connectDelay: 10_000 });
        vi.doMock('@/app/lib/kafka', () => ({
            default: mockProducer,
            kafkaStatus: { isConnected: false },
        }));
        const { trackRecipeView } = await import('@/app/actions/tracking');

        const promise = trackRecipeView('recipe-1');
        await vi.advanceTimersByTimeAsync(3_001);

        // Must resolve, not reject
        await expect(promise).resolves.toBeUndefined();
    });

    it('resets isConnected and retries connect on the next event after a failure', async () => {
        // First connect: hangs (times out). Second connect: succeeds immediately.
        let callCount = 0;
        const connect = vi.fn(() => {
            callCount++;
            if (callCount === 1) {
                return new Promise<void>((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 10_000)
                );
            }
            return Promise.resolve();
        });
        const send = vi.fn().mockResolvedValue(undefined);
        vi.doMock('@/app/lib/kafka', () => ({
            default: { connect, send },
            kafkaStatus: { isConnected: false },
        }));
        const { trackRecipeView } = await import('@/app/actions/tracking');

        // First call – times out, isConnected remains false
        const p1 = trackRecipeView('recipe-1');
        await vi.advanceTimersByTimeAsync(3_001);
        await p1;

        vi.clearAllMocks(); // reset spy call counts before the second assertion

        // Second call – should attempt connect again (not skip it)
        const p2 = trackRecipeView('recipe-1');
        vi.runAllTimersAsync();
        await p2;

        expect(connect).toHaveBeenCalledTimes(1); // 2nd overall, 1st since clearAllMocks
        expect(send).toHaveBeenCalledTimes(1);
    });

    it('enforces session.user.id and ignores spoofed client-supplied userId', async () => {
        const mockProducer = makeMockProducer();
        vi.doMock('@/app/lib/kafka', () => ({
            default: mockProducer,
            kafkaStatus: { isConnected: true },
        }));
        const { trackUserInteraction, trackRecipeView } =
            await import('@/app/actions/tracking');
        const { UserEventType } = await import('@/app/types/tracking');

        // Client passes a spoofed userId ('spoofed-victim-id')
        const p1 = trackUserInteraction(UserEventType.RECIPE_VIEW, {
            recipeId: 'recipe-100',
            userId: 'spoofed-victim-id',
        });
        vi.runAllTimersAsync();
        await p1;

        expect(mockProducer.send).toHaveBeenCalledTimes(1);
        const sendCallArg = mockProducer.send.mock.calls[0][0];
        expect(sendCallArg.messages[0].key).toBe('user-1');
        const payload = JSON.parse(sendCallArg.messages[0].value);
        expect(payload.userId).toBe('user-1');
        expect(payload.userId).not.toBe('spoofed-victim-id');

        // Check helper function binds session.user.id
        const p2 = trackRecipeView('recipe-100');
        vi.runAllTimersAsync();
        await p2;

        expect(mockProducer.send).toHaveBeenCalledTimes(2);
        const secondPayload = JSON.parse(
            mockProducer.send.mock.calls[1][0].messages[0].value
        );
        expect(secondPayload.userId).toBe('user-1');
    });

    it('triggers unauthorized when session or session.user.id is missing', async () => {
        const { auth } = await import('@/app/actions/getCurrentUser');
        (auth as any).mockResolvedValueOnce(null);

        const { trackRecipeView } = await import('@/app/actions/tracking');

        await expect(trackRecipeView('recipe-1')).rejects.toThrow(
            'UNAUTHORIZED'
        );
    });
});
