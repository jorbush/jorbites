(globalThis as { [key: string]: any }).IS_REACT_ACT_ENVIRONMENT = true;

// Mock Axiom modules to prevent external network calls in tests
jest.mock('@axiomhq/nextjs', () => ({
    withAxiom: (handler: any) => handler,
    nextJsFormatters: [],
    transformMiddlewareRequest: () => ['middleware request'],
    createProxyRouteHandler: () => () => ({ status: 200 }),
}));

jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        flush: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/app/lib/axiom/client', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
    WebVitals: () => null,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: jest.fn(),
            language: 'en',
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
    Trans: ({ children }: any) => children,
}));

// Mock Redis
jest.mock('@/app/lib/redis', () => ({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        incr: jest.fn(),
    },
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        incr: jest.fn(),
    },
}));

// Mock Ratelimit
jest.mock('@/app/lib/ratelimit', () => ({
    authenticatedRatelimit: { limit: jest.fn().mockResolvedValue({ success: true, reset: 0 }) },
    unauthenticatedRatelimit: { limit: jest.fn().mockResolvedValue({ success: true, reset: 0 }) },
    registrationRatelimit: { limit: jest.fn().mockResolvedValue({ success: true, reset: 0 }) },
    passwordResetRatelimit: { limit: jest.fn().mockResolvedValue({ success: true, reset: 0 }) },
    contentCreationRatelimit: { limit: jest.fn().mockResolvedValue({ success: true, reset: 0 }) },
    recipeBookRatelimit: { limit: jest.fn().mockResolvedValue({ success: true, reset: 0 }) },
}));

// Mock Cloudinary
jest.mock('@/app/utils/cloudinary', () => ({
    deleteFromCloudinary: jest.fn().mockResolvedValue(true),
    deleteMultipleFromCloudinary: jest.fn().mockResolvedValue({ successful: [], failed: [] }),
    extractPublicId: jest.fn((url: string) => url),
}));

// Mock web-push
jest.mock('web-push', () => ({
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn().mockResolvedValue({}),
}));

// Mock external notification and tracking actions that may be called asynchronously
jest.mock('@/app/actions/sendNotification', () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/app/actions/updateUserLevel', () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/app/actions/tracking', () => ({
    trackRecipeLike: jest.fn().mockResolvedValue(undefined),
    trackRecipeUnlike: jest.fn().mockResolvedValue(undefined),
}));
