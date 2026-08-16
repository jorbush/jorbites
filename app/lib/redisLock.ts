import { redis } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';
import { LOCK_TTL_SECONDS } from '@/app/utils/constants';

export interface LockUser {
    userId: string;
    userName?: string;
    userAvatar?: string;
}

export interface LockInfo extends LockUser {
    timestamp: number;
}

/**
 * Generates the Redis key for a section soft-lock.
 * Format: lock:recipe:<targetId>:field:<fieldKey>
 */
export function getLockKey(targetId: string, fieldKey: string): string {
    return `lock:recipe:${targetId}:field:${fieldKey}`;
}

/**
 * Helper to scan keys matching a pattern, avoiding blocking KEYS in production.
 */
async function findMatchingKeys(pattern: string): Promise<string[]> {
    if (typeof (redis as any).scan === 'function') {
        let cursor = '0';
        const matchedKeys: string[] = [];
        do {
            const res = await (redis as any).scan(
                cursor,
                'MATCH',
                pattern,
                'COUNT',
                100
            );
            if (Array.isArray(res) && res.length === 2) {
                cursor = res[0];
                matchedKeys.push(...res[1]);
            } else {
                break;
            }
        } while (cursor !== '0');
        return matchedKeys;
    }
    if (typeof (redis as any).keys === 'function') {
        return (redis as any).keys(pattern);
    }
    return [];
}

/**
 * Fast check to verify if a lock on targetId + fieldKey is currently held by userId.
 * Used by heartbeat endpoints to avoid redundant database lookups.
 */
export async function isLockHeldByUser(
    targetId: string,
    fieldKey: string,
    userId: string
): Promise<boolean> {
    const key = getLockKey(targetId, fieldKey);
    try {
        const raw = await redis.get(key);
        if (!raw) return false;
        try {
            const parsed = JSON.parse(raw);
            return parsed.userId === userId;
        } catch {
            return raw === userId;
        }
    } catch {
        return false;
    }
}

/**
 * Acquires or renews a soft lock on a specific field/step for a recipe or draft.
 */
export async function acquireLock(
    targetId: string,
    fieldKey: string,
    userId: string,
    userName?: string,
    userAvatar?: string
): Promise<{
    success: boolean;
    lockedBy: string;
    userName?: string;
    userAvatar?: string;
}> {
    const key = getLockKey(targetId, fieldKey);

    try {
        const payload: LockInfo = {
            userId,
            userName,
            userAvatar,
            timestamp: Date.now(),
        };

        // Try atomic set-if-not-exists
        const setNxResult = await redis.set(
            key,
            JSON.stringify(payload),
            'EX',
            LOCK_TTL_SECONDS,
            'NX'
        );

        if (setNxResult === 'OK') {
            return {
                success: true,
                lockedBy: userId,
                userName,
                userAvatar,
            };
        }

        // Key already exists: check if held by same user for TTL renewal
        const existingData = await redis.get(key);
        if (existingData) {
            let lockData: LockInfo;
            try {
                lockData = JSON.parse(existingData);
            } catch {
                lockData = { userId: existingData, timestamp: Date.now() };
            }

            if (lockData.userId === userId) {
                // Renew TTL for existing lock owner
                const renewPayload: LockInfo = {
                    userId,
                    userName: userName || lockData.userName,
                    userAvatar: userAvatar || lockData.userAvatar,
                    timestamp: Date.now(),
                };
                await redis.set(
                    key,
                    JSON.stringify(renewPayload),
                    'EX',
                    LOCK_TTL_SECONDS
                );
                return {
                    success: true,
                    lockedBy: userId,
                    userName: renewPayload.userName,
                    userAvatar: renewPayload.userAvatar,
                };
            }

            // Lock is held by another user
            return {
                success: false,
                lockedBy: lockData.userId,
                userName: lockData.userName,
                userAvatar: lockData.userAvatar,
            };
        }

        // Lock expired between NX check and GET fallback: retry set with NX (C5)
        const retryResult = await redis.set(
            key,
            JSON.stringify(payload),
            'EX',
            LOCK_TTL_SECONDS,
            'NX'
        );
        if (retryResult === 'OK') {
            return {
                success: true,
                lockedBy: userId,
                userName,
                userAvatar,
            };
        }

        // Retry failed because another user acquired in the meantime
        const retryExisting = await redis.get(key);
        let retryLockData: LockInfo = { userId: '', timestamp: Date.now() };
        if (retryExisting) {
            try {
                retryLockData = JSON.parse(retryExisting);
            } catch {
                retryLockData = {
                    userId: retryExisting,
                    timestamp: Date.now(),
                };
            }
        }

        return {
            success: false,
            lockedBy: retryLockData.userId,
            userName: retryLockData.userName,
            userAvatar: retryLockData.userAvatar,
        };
    } catch (error: any) {
        logger.error('acquireLock error', {
            error: error.message,
            targetId,
            fieldKey,
        });
        return { success: false, lockedBy: '' };
    }
}

/**
 * Releases a soft lock on a specific field/step if held by the given userId.
 * Uses atomic Lua script if available to prevent TOCTOU deletion race conditions (A3).
 */
export async function releaseLock(
    targetId: string,
    fieldKey: string,
    userId: string
): Promise<boolean> {
    const key = getLockKey(targetId, fieldKey);

    try {
        // Use atomic Lua check-and-delete if supported
        if (typeof (redis as any).eval === 'function') {
            const luaScript = `
                local val = redis.call("GET", KEYS[1])
                if not val then return 1 end
                local ok, data = pcall(cjson.decode, val)
                if ok and data and data.userId == ARGV[1] then
                    return redis.call("DEL", KEYS[1])
                elseif not ok and val == ARGV[1] then
                    return redis.call("DEL", KEYS[1])
                else
                    return 0
                end
            `;
            const result = await (redis as any).eval(luaScript, 1, key, userId);
            return result === 1;
        }

        // Fallback for non-eval environments
        const existingData = await redis.get(key);
        if (!existingData) return true;

        let lockData: LockInfo;
        try {
            lockData = JSON.parse(existingData);
        } catch {
            lockData = { userId: existingData, timestamp: Date.now() };
        }

        if (lockData.userId === userId) {
            await redis.del(key);
            return true;
        }

        return false;
    } catch (error: any) {
        logger.error('releaseLock error', {
            error: error.message,
            targetId,
            fieldKey,
        });
        return false;
    }
}

/**
 * Retrieves all active soft locks for a given targetId (recipe or draft ID).
 * Uses batch mget to prevent N+1 Redis queries (C2).
 */
export async function getActiveLocks(
    targetId: string
): Promise<Record<string, LockInfo>> {
    const pattern = `lock:recipe:${targetId}:field:*`;

    try {
        const keys = await findMatchingKeys(pattern);
        const locks: Record<string, LockInfo> = {};
        if (!keys || keys.length === 0) return locks;

        if (typeof (redis as any).mget === 'function') {
            const values = await (redis as any).mget(...keys);
            for (let i = 0; i < keys.length; i++) {
                const rawData = values[i];
                if (rawData) {
                    const fieldKey = keys[i].replace(
                        `lock:recipe:${targetId}:field:`,
                        ''
                    );
                    try {
                        locks[fieldKey] = JSON.parse(rawData);
                    } catch {
                        locks[fieldKey] = {
                            userId: rawData,
                            timestamp: Date.now(),
                        };
                    }
                }
            }
            return locks;
        }

        // Fallback for environments without mget: fetch concurrently
        const results = await Promise.all(
            keys.map(async (key) => {
                const rawData = await redis.get(key);
                return { key, rawData };
            })
        );

        for (const { key, rawData } of results) {
            if (rawData) {
                const fieldKey = key.replace(
                    `lock:recipe:${targetId}:field:`,
                    ''
                );
                try {
                    locks[fieldKey] = JSON.parse(rawData);
                } catch {
                    locks[fieldKey] = {
                        userId: rawData,
                        timestamp: Date.now(),
                    };
                }
            }
        }

        return locks;
    } catch (error: any) {
        logger.error('getActiveLocks error', {
            error: error.message,
            targetId,
        });
        return {};
    }
}

/**
 * Releases all locks associated with a targetId.
 */
export async function releaseAllLocks(targetId: string): Promise<void> {
    const pattern = `lock:recipe:${targetId}:field:*`;
    try {
        const keys = await findMatchingKeys(pattern);
        if (keys && keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error: any) {
        logger.error('releaseAllLocks error', {
            error: error.message,
            targetId,
        });
    }
}
