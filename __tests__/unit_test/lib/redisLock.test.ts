jest.unmock('@/app/lib/redisLock');

import {
    acquireLock,
    releaseLock,
    getActiveLocks,
    releaseAllLocks,
    getLockKey,
    isLockHeldByUser,
    renewLockIfHeld,
} from '@/app/lib/redisLock';

jest.mock('@/app/lib/redis', () => {
    const store: Record<string, string> = {};
    return {
        redis: {
            get: jest.fn(async (key: string) => store[key] || null),
            set: jest.fn(async (key: string, val: string, ...args: any[]) => {
                const isNx = args.includes('NX');
                if (isNx && store[key]) {
                    return null;
                }
                store[key] = val;
                return 'OK';
            }),
            del: jest.fn(async (...keys: string[]) => {
                let deleted = 0;
                for (const k of keys) {
                    if (store[k]) {
                        delete store[k];
                        deleted++;
                    }
                }
                return deleted;
            }),
            mget: jest.fn(async (...keys: string[]) => {
                return keys.map((k) => store[k] || null);
            }),
            keys: jest.fn(async (pattern: string) => {
                const regexStr = '^' + pattern.replace(/\*/g, '.*') + '$';
                const regex = new RegExp(regexStr);
                return Object.keys(store).filter((k) => regex.test(k));
            }),
            scan: jest.fn(
                async (
                    _cursor: string,
                    _matchFlag: string,
                    pattern: string
                ) => {
                    const regexStr = '^' + pattern.replace(/\*/g, '.*') + '$';
                    const regex = new RegExp(regexStr);
                    const matched = Object.keys(store).filter((k) =>
                        regex.test(k)
                    );
                    return ['0', matched];
                }
            ),
            _store: store,
        },
    };
});

import { redis } from '@/app/lib/redis';

describe('Redis Soft-Locking Service (redisLock)', () => {
    beforeEach(() => {
        const store = (redis as any)._store;
        if (store) {
            for (const key of Object.keys(store)) {
                delete store[key];
            }
        }
        jest.clearAllMocks();
    });

    describe('getLockKey', () => {
        it('should format lock key correctly', () => {
            const key = getLockKey('recipe-123', 'step:1');
            expect(key).toBe('lock:recipe:recipe-123:field:step:1');
        });
    });

    describe('isLockHeldByUser', () => {
        it('should return true if lock is currently held by the user', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a', 'User A');
            const isHeld = await isLockHeldByUser(
                'recipe-123',
                'step:1',
                'user-a'
            );
            expect(isHeld).toBe(true);
        });

        it('should return false if lock is held by a different user', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a', 'User A');
            const isHeld = await isLockHeldByUser(
                'recipe-123',
                'step:1',
                'user-b'
            );
            expect(isHeld).toBe(false);
        });

        it('should return false if lock does not exist', async () => {
            const isHeld = await isLockHeldByUser(
                'recipe-123',
                'step:1',
                'user-a'
            );
            expect(isHeld).toBe(false);
        });
    });

    describe('renewLockIfHeld', () => {
        it('should renew lock atomically if held by the caller', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a', 'User A');
            const res = await renewLockIfHeld(
                'recipe-123',
                'step:1',
                'user-a',
                'User A Renewer'
            );
            expect(res.renewed).toBe(true);
            expect(res.lockResult?.success).toBe(true);
            expect(res.lockResult?.userName).toBe('User A Renewer');
        });

        it('should return renewed: false if lock is held by another user', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a', 'User A');
            const res = await renewLockIfHeld(
                'recipe-123',
                'step:1',
                'user-b',
                'User B'
            );
            expect(res.renewed).toBe(false);
        });

        it('should return renewed: false if lock does not exist', async () => {
            const res = await renewLockIfHeld('recipe-123', 'step:1', 'user-a');
            expect(res.renewed).toBe(false);
        });
    });

    describe('acquireLock', () => {
        it('should successfully acquire lock when field is not locked', async () => {
            const result = await acquireLock(
                'recipe-123',
                'step:1',
                'user-a',
                'User A',
                'https://avatar.com/a.png'
            );

            expect(result.success).toBe(true);
            expect(result.lockedBy).toBe('user-a');
            expect(result.userName).toBe('User A');
            expect(result.userAvatar).toBe('https://avatar.com/a.png');
            expect(redis.set).toHaveBeenCalled();
        });

        it('should renew lock when requested by the same lock owner', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a', 'User A');
            const renewResult = await acquireLock(
                'recipe-123',
                'step:1',
                'user-a',
                'User A Updated'
            );

            expect(renewResult.success).toBe(true);
            expect(renewResult.lockedBy).toBe('user-a');
            expect(renewResult.userName).toBe('User A Updated');
        });

        it('should reject lock acquisition when field is locked by another user', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a', 'User A');
            const result = await acquireLock(
                'recipe-123',
                'step:1',
                'user-b',
                'User B'
            );

            expect(result.success).toBe(false);
            expect(result.lockedBy).toBe('user-a');
            expect(result.userName).toBe('User A');
        });
    });

    describe('releaseLock', () => {
        it('should release lock when requested by the lock owner', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a');
            const released = await releaseLock(
                'recipe-123',
                'step:1',
                'user-a'
            );

            expect(released).toBe(true);
            expect(redis.del).toHaveBeenCalled();

            const checkResult = await acquireLock(
                'recipe-123',
                'step:1',
                'user-b'
            );
            expect(checkResult.success).toBe(true);
            expect(checkResult.lockedBy).toBe('user-b');
        });

        it('should not release lock when requested by a non-owner user', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a');
            const released = await releaseLock(
                'recipe-123',
                'step:1',
                'user-b'
            );

            expect(released).toBe(false);
        });

        it('should return true if lock does not exist', async () => {
            const released = await releaseLock(
                'recipe-123',
                'step:1',
                'user-a'
            );
            expect(released).toBe(true);
        });
    });

    describe('getActiveLocks', () => {
        it('should return all active locks for a target recipe/draft ID using batch mget', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a', 'User A');
            await acquireLock('recipe-123', 'step:3', 'user-b', 'User B');

            const activeLocks = await getActiveLocks('recipe-123');

            expect(activeLocks).toHaveProperty('step:1');
            expect(activeLocks).toHaveProperty('step:3');
            expect(activeLocks['step:1'].userId).toBe('user-a');
            expect(activeLocks['step:3'].userId).toBe('user-b');
            expect(redis.mget).toHaveBeenCalled();
        });

        it('should return empty object if no locks exist', async () => {
            const activeLocks = await getActiveLocks('recipe-999');
            expect(activeLocks).toEqual({});
        });
    });

    describe('releaseAllLocks', () => {
        it('should release all locks for a recipe/draft ID', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a');
            await acquireLock('recipe-123', 'step:2', 'user-b');

            await releaseAllLocks('recipe-123');

            const activeLocks = await getActiveLocks('recipe-123');
            expect(activeLocks).toEqual({});
        });

        it('should properly escape glob wildcard characters to prevent accidental key deletion (M2)', async () => {
            await acquireLock('recipe-123', 'step:1', 'user-a');
            await acquireLock('other-456', 'step:1', 'user-b');

            // Trying to delete using glob pattern '*'
            await releaseAllLocks('*');

            // Existing locks should NOT be deleted
            const active123 = await getActiveLocks('recipe-123');
            const active456 = await getActiveLocks('other-456');
            expect(active123).toHaveProperty('step:1');
            expect(active456).toHaveProperty('step:1');
        });

        it('should do nothing if targetId is empty or not a string', async () => {
            await releaseAllLocks('' as any);
            await releaseAllLocks(null as any);
        });
    });
});
