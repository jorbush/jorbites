'use client';

import {
    AnalyticsEventCategory,
    AnalyticsEventName,
    AnalyticsProps,
    ClientAnalyticsInput,
    normalizeAnalyticsLocale,
    normalizeAnalyticsPath,
} from '@/app/types/analytics';

const ANALYTICS_ENDPOINT = '/api/analytics';
const FLUSH_THRESHOLD = 10;
const FLUSH_INTERVAL_MS = 8000;
const MAX_QUEUE_SIZE = 50;

let eventQueue: ClientAnalyticsInput[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let lifecycleListenersAttached = false;

function isAnalyticsEnabled(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const dnt =
        navigator.doNotTrack ||
        (window as unknown as { doNotTrack?: string }).doNotTrack;
    if (dnt === '1' || dnt === 'yes') {
        return false;
    }

    return (
        process.env.NODE_ENV === 'production' ||
        process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'
    );
}

function getCurrentLocale(): string {
    if (typeof document !== 'undefined' && document.documentElement.lang) {
        return normalizeAnalyticsLocale(document.documentElement.lang);
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
        return normalizeAnalyticsLocale(navigator.language);
    }
    return 'unknown';
}

function scheduleFlush() {
    if (flushTimer !== null) {
        return;
    }
    flushTimer = setTimeout(() => {
        flushTimer = null;
        flushAnalyticsQueue(false);
    }, FLUSH_INTERVAL_MS);
}

function clearScheduledFlush() {
    if (flushTimer !== null) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }
}

export function flushAnalyticsQueue(useBeacon = false): void {
    clearScheduledFlush();

    if (eventQueue.length === 0) {
        return;
    }

    const batch = eventQueue.splice(0, 25);
    const body = JSON.stringify({ events: batch });

    try {
        if (
            useBeacon &&
            typeof navigator !== 'undefined' &&
            typeof navigator.sendBeacon === 'function'
        ) {
            const blob = new Blob([body], { type: 'application/json' });
            const queued = navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
            if (queued) {
                return;
            }
        }

        if (typeof fetch === 'function') {
            void fetch(ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
                keepalive: true,
                credentials: 'omit',
            }).catch(() => {
                // Non-blocking: never disrupt UX if analytics transport fails
            });
        }
    } catch {
        // Ignore transport errors
    }
}

function attachLifecycleListeners() {
    if (lifecycleListenersAttached || typeof window === 'undefined') {
        return;
    }
    lifecycleListenersAttached = true;

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            flushAnalyticsQueue(true);
        }
    };

    const handlePageHide = () => {
        flushAnalyticsQueue(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
}

/**
 * Queues a strictly cookieless, anonymous interaction event.
 * Never reads or writes cookies, localStorage, or sessionStorage.
 */
export function trackAnalyticsEvent(
    category: AnalyticsEventCategory,
    name: AnalyticsEventName,
    props?: AnalyticsProps,
    options?: { path?: string; forceEnabled?: boolean }
): void {
    if (!options?.forceEnabled && !isAnalyticsEnabled()) {
        return;
    }

    attachLifecycleListeners();

    const path = normalizeAnalyticsPath(
        options?.path ??
            (typeof window !== 'undefined' ? window.location.pathname : '/')
    );

    const referrer =
        typeof document !== 'undefined' && document.referrer
            ? document.referrer
            : undefined;

    if (eventQueue.length >= MAX_QUEUE_SIZE) {
        eventQueue.shift();
    }

    eventQueue.push({
        category,
        name,
        path,
        locale: getCurrentLocale(),
        referrer,
        props,
        ts: new Date().toISOString(),
    });

    if (eventQueue.length >= FLUSH_THRESHOLD) {
        flushAnalyticsQueue(false);
    } else {
        scheduleFlush();
    }
}

/**
 * Test helper to reset in-memory queue state.
 */
export function __resetAnalyticsQueueForTests(): void {
    clearScheduledFlush();
    eventQueue = [];
}
