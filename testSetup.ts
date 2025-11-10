import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);
(globalThis as { [key: string]: any }).IS_REACT_ACT_ENVIRONMENT = true;

// Mock Axiom modules to prevent import errors in tests
import { vi } from 'vitest';

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
