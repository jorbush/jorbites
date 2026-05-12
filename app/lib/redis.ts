import { Redis } from 'ioredis';
import { logger } from '@/app/lib/axiom/server';

const createMockRedis = (name: string) => {
    return {
        get: async (key: string) => {
            if (process.env.NODE_ENV !== 'production')
                logger.info(`[Redis Disabled] Mock get on ${name} for ${key}`);
            return null;
        },
        set: async (key: string, _value: string) => {
            if (process.env.NODE_ENV !== 'production')
                logger.info(`[Redis Disabled] Mock set on ${name} for ${key}`);
            return 'OK';
        },
        del: async (...keys: string[]) => {
            if (process.env.NODE_ENV !== 'production')
                logger.info(
                    `[Redis Disabled] Mock del on ${name} for ${keys.join(', ')}`
                );
            return 1;
        },
        incr: async (key: string) => {
            if (process.env.NODE_ENV !== 'production')
                logger.info(`[Redis Disabled] Mock incr on ${name} for ${key}`);
            return 1;
        },
    } as unknown as Redis;
};

if (
    !process.env.REDIS_URL &&
    process.env.NODE_ENV === 'production' &&
    process.env.SKIP_ENV_VALIDATION !== 'true'
) {
    throw new Error('REDIS_URL is required in production');
}

export const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : createMockRedis('redis');

if (!process.env.REDIS_URL_CACHING && process.env.NODE_ENV === 'production') {
    logger.warn(
        'REDIS_URL_CACHING is not set in production. Caching is disabled.'
    );
}

export const redisCache = process.env.REDIS_URL_CACHING
    ? new Redis(process.env.REDIS_URL_CACHING)
    : createMockRedis('redisCache');
