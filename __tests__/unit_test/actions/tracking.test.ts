import { trackRecipeView, trackRecipeLike } from '@/app/actions/tracking';
import { logger } from '@/app/lib/axiom/server';

jest.unmock('@/app/actions/tracking');

jest.mock('next/navigation', () => ({
    unauthorized: jest.fn(),
}));

jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('@/app/lib/kafka', () => ({
    __esModule: true,
    get default() {
        return (global as any).__mockProducer;
    },
    get kafkaStatus() {
        if (!(global as any).__mockKafkaStatus) {
            (global as any).__mockKafkaStatus = { isConnected: false };
        }
        return (global as any).__mockKafkaStatus;
    },
}));

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
    auth: jest.fn(() =>
        Promise.resolve({ user: { email: 'user-1@test.com' } })
    ),
}));

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
    const connect = jest.fn(() =>
        connectShouldFail
            ? new Promise<void>((_, reject) =>
                  setTimeout(
                      () => reject(new Error('Kafka connect failed')),
                      connectDelay
                  )
              )
            : new Promise<void>((resolve) => setTimeout(resolve, connectDelay))
    );
    const send = jest.fn(() =>
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

describe('trackUserInteraction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (global as any).__mockKafkaStatus = { isConnected: false };
        (global as any).__mockProducer = null;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('is a no-op (with a warning) when Kafka producer is null', async () => {
        (global as any).__mockProducer = null;
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        await trackRecipeView('recipe-1', 'user-1');

        expect((logger.warn as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        expect(logger.error).not.toHaveBeenCalled();

        process.env.NODE_ENV = originalEnv;
    });

    it('connects once and sends successfully on the happy path', async () => {
        const mockProducer = makeMockProducer();
        (global as any).__mockProducer = mockProducer;

        // First event – should connect + send
        const p1 = trackRecipeView('recipe-1', 'user-1');
        await jest.runAllTimersAsync();
        await p1;

        // Second event – should NOT call connect again (already connected)
        const p2 = trackRecipeLike('recipe-1', 'user-1');
        await jest.runAllTimersAsync();
        await p2;

        expect(mockProducer.connect).toHaveBeenCalledTimes(1);
        expect(mockProducer.send).toHaveBeenCalledTimes(2);
        expect(logger.error).not.toHaveBeenCalled();
    });

    it('times out and logs an error when connect exceeds KAFKA_TIMEOUT_MS', async () => {
        (global as any).__mockProducer = makeMockProducer({
            connectDelay: 10_000,
        });

        const promise = trackRecipeView('recipe-1', 'user-1');
        await jest.advanceTimersByTimeAsync(3_001);
        await promise;

        expect(logger.error).toHaveBeenCalledWith(
            'Failed to track user interaction',
            expect.objectContaining({
                error: expect.stringContaining('timed out'),
            })
        );
    });

    it('times out and logs an error when send exceeds KAFKA_TIMEOUT_MS', async () => {
        (global as any).__mockProducer = makeMockProducer({
            connectDelay: 0,
            sendDelay: 10_000,
        });

        const promise = trackRecipeView('recipe-1', 'user-1');
        await jest.advanceTimersByTimeAsync(3_001);
        await promise;

        expect(logger.error).toHaveBeenCalledWith(
            'Failed to track user interaction',
            expect.objectContaining({
                error: expect.stringContaining('timed out'),
            })
        );
    });

    it('does NOT propagate the error to the caller when Kafka times out', async () => {
        (global as any).__mockProducer = makeMockProducer({
            connectDelay: 10_000,
        });

        const promise = trackRecipeView('recipe-1', 'user-1');
        await jest.advanceTimersByTimeAsync(3_001);

        await expect(promise).resolves.toBeUndefined();
    });

    it('resets isConnected and retries connect on the next event after a failure', async () => {
        let callCount = 0;
        const connect = jest.fn(() => {
            callCount++;
            if (callCount === 1) {
                return new Promise<void>((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 10_000)
                );
            }
            return Promise.resolve();
        });
        const send = jest.fn().mockResolvedValue(undefined);
        (global as any).__mockProducer = { connect, send };

        // First call – times out, isConnected remains false
        const p1 = trackRecipeView('recipe-1', 'user-1');
        await jest.advanceTimersByTimeAsync(3_001);
        await p1;

        jest.clearAllMocks();

        // Second call – should attempt connect again (not skip it)
        const p2 = trackRecipeView('recipe-1', 'user-1');
        await jest.runAllTimersAsync();
        await p2;

        expect(connect).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledTimes(1);
    });
});
