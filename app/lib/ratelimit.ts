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

// Default export for backward compatibility
export default authenticatedRatelimit;
