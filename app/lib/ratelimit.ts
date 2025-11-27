import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiting for authenticated users - higher limits to support search functionality
// 30 requests per 10 seconds allows for frequent search queries (debounced at 1s) + normal browsing
export const authenticatedRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/authenticated',
});

// Rate limiting for unauthenticated users - moderate limits
// 15 requests per 10 seconds still allows search functionality while preventing abuse
export const unauthenticatedRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(15, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/unauthenticated',
});

// Strict rate limiting for sensitive operations like registration
// 5 requests per hour per IP - prevents mass account creation
export const registrationRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: '@upstash/ratelimit/registration',
});

// Strict rate limiting for password reset requests
// 3 requests per 15 minutes per IP - prevents email bombing while allowing retries
export const passwordResetRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, '15 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/password-reset',
});

// Rate limiting for content creation (comments, recipes)
// 10 requests per minute per user - prevents spam while allowing normal usage
export const contentCreationRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/content-creation',
});
