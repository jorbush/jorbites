(globalThis as { [key: string]: any }).IS_REACT_ACT_ENVIRONMENT = true;

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { vi, afterEach } from 'vitest';

afterEach(() => {
    cleanup();
});

// Mock next/server 'after' callback so tests outside request scope do not throw
vi.mock('next/server', async (importOriginal) => {
    const actual = await importOriginal<typeof import('next/server')>();
    return {
        ...actual,
        after: vi.fn((fn: () => unknown) => {
            try {
                const res = fn();
                if (
                    res &&
                    typeof (res as Promise<unknown>).catch === 'function'
                ) {
                    (res as Promise<unknown>).catch(() => {});
                }
            } catch {}
        }),
    };
});

vi.mock('@axiomhq/nextjs', () => ({
    withAxiom: (handler: any) => handler,
    nextJsFormatters: [],
    transformMiddlewareRequest: () => ['middleware request'],
    createProxyRouteHandler: () => () => ({ status: 200 }),
}));

vi.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        flush: vi.fn().mockResolvedValue(undefined),
    },
}));

vi.mock('@/app/lib/axiom/client', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
    WebVitals: () => null,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: vi.fn(),
            language: 'en',
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
    },
    Trans: ({ children }: any) => children,
}));

// Mock Redis
vi.mock('@/app/lib/redis', () => ({
    redis: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        incr: vi.fn(),
    },
    redisCache: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        incr: vi.fn(),
    },
}));
