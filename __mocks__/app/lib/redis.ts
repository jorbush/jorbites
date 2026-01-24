const redisMock = {
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
};

export default redisMock;
export const redis = redisMock.redis;
export const redisCache = redisMock.redisCache;
