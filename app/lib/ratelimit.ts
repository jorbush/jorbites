import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '@/app/lib/axiom/server';

const createMockRatelimit = (name: string) => {
    return {
        limit: async (identifier: string) => {
            if (process.env.NODE_ENV !== 'production') {
                logger.info(
                    `[Ratelimit Disabled] Mock limit on ${name} for ${identifier}`
                );
            }
            return {
                success: true,
                limit: 100,
                remaining: 99,
                reset: 0,
                pending: Promise.resolve(),
            };
        },
    } as unknown as Ratelimit;
};

const hasUpstashConfig =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

if (
    !hasUpstashConfig &&
    process.env.NODE_ENV === 'production' &&
    process.env.SKIP_ENV_VALIDATION !== 'true'
) {
    throw new Error(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production for rate limiting'
    );
}

// Rate limiting for authenticated users - higher limits to support search functionality
// 30 requests per 10 seconds allows for frequent search queries (debounced at 1s) + normal browsing
export const authenticatedRatelimit = hasUpstashConfig
    ? new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(30, '10 s'),
          analytics: true,
          prefix: '@upstash/ratelimit/authenticated',
      })
    : createMockRatelimit('authenticatedRatelimit');

// Rate limiting for unauthenticated users - moderate limits
// 15 requests per 10 seconds still allows search functionality while preventing abuse
export const unauthenticatedRatelimit = hasUpstashConfig
    ? new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(15, '10 s'),
          analytics: true,
          prefix: '@upstash/ratelimit/unauthenticated',
      })
    : createMockRatelimit('unauthenticatedRatelimit');

// Strict rate limiting for sensitive operations like registration
// 5 requests per hour per IP - prevents mass account creation
export const registrationRatelimit = hasUpstashConfig
    ? new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(5, '1 h'),
          analytics: true,
          prefix: '@upstash/ratelimit/registration',
      })
    : createMockRatelimit('registrationRatelimit');

// Strict rate limiting for password reset requests
// 3 requests per 15 minutes per IP - prevents email bombing while allowing retries
export const passwordResetRatelimit = hasUpstashConfig
    ? new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(3, '15 m'),
          analytics: true,
          prefix: '@upstash/ratelimit/password-reset',
      })
    : createMockRatelimit('passwordResetRatelimit');

// Rate limiting for content creation (comments, recipes)
// 10 requests per minute per user - prevents spam while allowing normal usage
export const contentCreationRatelimit = hasUpstashConfig
    ? new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(10, '1 m'),
          analytics: true,
          prefix: '@upstash/ratelimit/content-creation',
      })
    : createMockRatelimit('contentCreationRatelimit');
