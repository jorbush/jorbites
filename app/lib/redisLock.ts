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
 * Fast atomic renewal check to verify and renew lock if currently held by userId.
 * Used by heartbeat endpoints to renew in 1 network roundtrip without hitting the DB.
 */
export async function renewLockIfHeld(
    targetId: string,
    fieldKey: string,
    userId: string,
    userName?: string,
    userAvatar?: string
): Promise<{
    renewed: boolean;
    lockResult?: {
        success: boolean;
        lockedBy: string;
        userName?: string;
        userAvatar?: string;
    };
}> {
    const key = getLockKey(targetId, fieldKey);
    const renewPayload: LockInfo = {
        userId,
        userName,
        userAvatar,
        timestamp: Date.now(),
    };

    try {
        if (typeof (redis as any).eval === 'function') {
            const luaScript = `
                local val = redis.call("GET", KEYS[1])
                if not val then return 0 end
                local ok, data = pcall(cjson.decode, val)
                local lockUser = (ok and data and data.userId) or val
                if lockUser == ARGV[3] then
                    redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])
                    return 1
                end
                return 0
            `;
            const res = await (redis as any).eval(
                luaScript,
                1,
                key,
                JSON.stringify(renewPayload),
                LOCK_TTL_SECONDS,
                userId
            );

            if (res === 1) {
                return {
                    renewed: true,
                    lockResult: {
                        success: true,
                        lockedBy: userId,
                        userName,
                        userAvatar,
                    },
                };
            }
            return { renewed: false };
        }

        // Fallback for non-eval environments
        const isHeld = await isLockHeldByUser(targetId, fieldKey, userId);
        if (isHeld) {
            await redis.set(
                key,
                JSON.stringify(renewPayload),
                'EX',
                LOCK_TTL_SECONDS
            );
            return {
                renewed: true,
                lockResult: {
                    success: true,
                    lockedBy: userId,
                    userName,
                    userAvatar,
                },
            };
        }
        return { renewed: false };
    } catch {
        return { renewed: false };
    }
}

/**
 * Acquires or renews a soft lock on a specific field/step for a recipe or draft.
 * Uses atomic Lua script when available to eliminate TOCTOU race conditions (C1 & H8).
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

        // Atomic Lua path (C1 & H8)
        if (typeof (redis as any).eval === 'function') {
            const luaScript = `
                local val = redis.call("GET", KEYS[1])
                if not val then
                    redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])
                    return {1, ARGV[3], ARGV[4], ARGV[5]}
                end

                local ok, data = pcall(cjson.decode, val)
                local lockUser = ""
                local lockName = ""
                local lockAvatar = ""

                if ok and data then
                    lockUser = data.userId or ""
                    lockName = data.userName or ""
                    lockAvatar = data.userAvatar or ""
                else
                    lockUser = val
                end

                if lockUser == ARGV[3] then
                    redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])
                    local finalName = ARGV[4] ~= "" and ARGV[4] or lockName
                    local finalAvatar = ARGV[5] ~= "" and ARGV[5] or lockAvatar
                    return {1, ARGV[3], finalName, finalAvatar}
                else
                    return {0, lockUser, lockName, lockAvatar}
                end
            `;

            const res = await (redis as any).eval(
                luaScript,
                1,
                key,
                JSON.stringify(payload),
                LOCK_TTL_SECONDS,
                userId,
                userName || '',
                userAvatar || ''
            );

            if (Array.isArray(res) && res.length >= 2) {
                const isSuccess = res[0] === 1;
                return {
                    success: isSuccess,
                    lockedBy: res[1] || '',
                    userName: res[2] || undefined,
                    userAvatar: res[3] || undefined,
                };
            }
        }

        // Fallback for non-eval environments
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

        const existingData = await redis.get(key);
        if (existingData) {
            let lockData: LockInfo;
            try {
                lockData = JSON.parse(existingData);
            } catch {
                lockData = { userId: existingData, timestamp: Date.now() };
            }

            if (lockData.userId === userId) {
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

            return {
                success: false,
                lockedBy: lockData.userId,
                userName: lockData.userName,
                userAvatar: lockData.userAvatar,
            };
        }

        return { success: false, lockedBy: '' };
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
    if (!targetId || typeof targetId !== 'string') return;
    // Security (M2): Escape glob special characters in targetId to prevent matching unintended keys
    const escapedTargetId = targetId.replace(/[*?[\]]/g, '\\$&');
    const pattern = `lock:recipe:${escapedTargetId}:field:*`;
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
