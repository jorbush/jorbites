import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    trackAnalyticsEvent,
    flushAnalyticsQueue,
    __resetAnalyticsQueueForTests,
} from '@/app/lib/analytics/client';

describe('Cookieless Analytics Client Queue', () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const sendBeaconMock = vi.fn().mockReturnValue(true);

    beforeEach(() => {
        vi.useFakeTimers();
        __resetAnalyticsQueueForTests();
        vi.stubGlobal('fetch', fetchMock);
        Object.defineProperty(navigator, 'sendBeacon', {
            value: sendBeaconMock,
            configurable: true,
            writable: true,
        });
        fetchMock.mockClear();
        sendBeaconMock.mockClear();
    });

    afterEach(() => {
        __resetAnalyticsQueueForTests();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('batches events and flushes after the timer interval with credentials: omit', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

        trackAnalyticsEvent(
            'feature',
            'theme_change',
            { theme: 'dark' },
            { path: '/recipes/abc123', forceEnabled: true }
        );
        expect(fetchMock).not.toHaveBeenCalled();

        vi.advanceTimersByTime(8000);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('/api/analytics');
        expect(init.credentials).toBe('omit');
        expect(init.keepalive).toBe(true);

        const parsed = JSON.parse(init.body);
        expect(parsed.events).toHaveLength(1);
        expect(parsed.events[0].path).toBe('/recipes/[id]');
        expect(parsed.events[0].name).toBe('theme_change');

        // Strictly zero localStorage/sessionStorage usage
        expect(setItemSpy).not.toHaveBeenCalled();
        expect(getItemSpy).not.toHaveBeenCalled();
        setItemSpy.mockRestore();
        getItemSpy.mockRestore();
    });

    it('flushes immediately when queue reaches threshold of 10 events', () => {
        for (let i = 0; i < 10; i++) {
            trackAnalyticsEvent(
                'discovery',
                'bite_card_swipe',
                { direction: 'right' },
                { path: '/bite-cards', forceEnabled: true }
            );
        }

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const parsed = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(parsed.events).toHaveLength(10);
    });

    it('uses navigator.sendBeacon when flushing with useBeacon = true', () => {
        trackAnalyticsEvent(
            'feature',
            'step_guide_open',
            { steps_count: 5 },
            { path: '/recipes/123', forceEnabled: true }
        );

        flushAnalyticsQueue(true);

        expect(sendBeaconMock).toHaveBeenCalledTimes(1);
        expect(sendBeaconMock.mock.calls[0][0]).toBe('/api/analytics');
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
