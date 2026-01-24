import { Redis } from 'ioredis';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    throw new Error('REDIS_URL is not defined');
};

const getRedisCacheUrl = () => {
    if (process.env.REDIS_URL_CACHING) {
        return process.env.REDIS_URL_CACHING;
    }
    throw new Error('REDIS_URL_CACHING is not defined');
};

export const redis = new Redis(getRedisUrl());
export const redisCache = new Redis(getRedisCacheUrl());
