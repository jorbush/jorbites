import crypto from 'crypto';
import { redis } from '@/app/lib/redis';
import { releaseAllLocks } from '@/app/lib/redisLock';
import { logger } from '@/app/lib/axiom/server';
import { SafeUser } from '@/app/types';
import { SharedDraft, SingleDraft, DraftSummary } from '@/app/types/draft';
import {
    DRAFT_TTL_SECONDS,
    USER_DRAFTS_TTL_SECONDS,
    MAX_CO_COOKS,
    MAX_LINKED_RECIPES,
    MAX_SOLO_DRAFT_SLOTS,
    SOLO_DRAFT_TTL_SECONDS,
} from '@/app/utils/constants';

interface RedisClient {
    get(key: string): Promise<string | null>;
    set(
        key: string,
        value: string,
        mode?: string,
        duration?: number
    ): Promise<string | null>;
    del(...keys: string[]): Promise<number>;
    sadd(key: string, ...members: string[]): Promise<number>;
    srem(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    expire(key: string, seconds: number): Promise<number>;
    eval(
        script: string,
        numKeys: number,
        ...args: (string | number)[]
    ): Promise<unknown>;
}

const redisClient = redis as unknown as RedisClient;

const SAVE_SOLO_DRAFT_SCRIPT = `
local soloIds = redis.call('SMEMBERS', KEYS[2])
for _, id in ipairs(soloIds) do
    if redis.call('EXISTS', ARGV[6] .. id) == 0 then
        redis.call('SREM', KEYS[2], id)
    end
end

local draftExists = redis.call('EXISTS', KEYS[1])
if draftExists == 0 and redis.call('SCARD', KEYS[2]) >= tonumber(ARGV[4]) then
    if redis.call('SCARD', KEYS[2]) > 0 then
        redis.call('EXPIRE', KEYS[2], tonumber(ARGV[3]))
    end
    return 0
end

redis.call('SET', KEYS[1], ARGV[2], 'EX', tonumber(ARGV[3]))
redis.call('SADD', KEYS[2], ARGV[1])
redis.call('EXPIRE', KEYS[2], tonumber(ARGV[3]))
redis.call('SADD', KEYS[3], ARGV[1])
redis.call('EXPIRE', KEYS[3], tonumber(ARGV[5]))
return 1
`;

const JOIN_SHARED_DRAFT_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
if not raw then
    return cjson.encode({ ok = 0, error = 'draft_not_found' })
end

local decoded, draft = pcall(cjson.decode, raw)
if not decoded or type(draft) ~= 'table' then
    return cjson.encode({ ok = 0, error = 'invalid_draft_data' })
end

if draft.inviteToken ~= ARGV[1] then
    return cjson.encode({ ok = 0, error = 'invalid_invite_token' })
end

local userId = ARGV[2]
local maxCoCooks = tonumber(ARGV[3])
local coCooks = draft.coCooksIds or {}

local isOwner = (draft.ownerId == userId)
local alreadyMember = false

for _, id in ipairs(coCooks) do
    if id == userId then
        alreadyMember = true
        break
    end
end

if not isOwner and not alreadyMember then
    if #coCooks >= maxCoCooks then
        return cjson.encode({ ok = 0, error = 'co_cook_limit_reached' })
    end
    table.insert(coCooks, userId)
    draft.coCooksIds = coCooks
end

draft.updatedAt = ARGV[5]
local updatedRaw = cjson.encode(draft)
redis.call('SET', KEYS[1], updatedRaw, 'EX', tonumber(ARGV[4]))
redis.call('SADD', KEYS[2], draft.draftId or ARGV[7])
redis.call('EXPIRE', KEYS[2], tonumber(ARGV[6]))

return cjson.encode({ ok = 1, draft = draft })
`;

const ALLOWED_DRAFT_FIELDS: (keyof SharedDraft)[] = [
    'currentStep',
    'title',
    'description',
    'categories',
    'method',
    'imageSrc',
    'imageSrc1',
    'imageSrc2',
    'imageSrc3',
    'ingredients',
    'steps',
    'minutes',
    'prepTime',
    'cookTime',
    'coCooksIds',
    'linkedRecipeIds',
    'youtubeUrl',
    'questId',
];

/**
 * Filter an arbitrary payload to only allowed draft fields to prevent field pollution (C3).
 */
function sanitizeDraftPayload(body: unknown): Partial<SharedDraft> {
    const sanitized: Partial<SharedDraft> = {};
    if (!body || typeof body !== 'object') return sanitized;
    const rec = body as Record<string, unknown>;

    for (const field of ALLOWED_DRAFT_FIELDS) {
        if (rec[field] !== undefined) {
            (sanitized as Record<string, unknown>)[field] = rec[field];
        }
    }
    return sanitized;
}

export class DraftService {
    /**
     * Atomically adds a draft ID to a user's active drafts set (A1).
     */
    static async addToUserDrafts(
        userId: string,
        draftId: string
    ): Promise<void> {
        const key = `user:drafts:${userId}`;
        try {
            if (typeof redisClient.sadd === 'function') {
                await redisClient.sadd(key, draftId);
                if (typeof redisClient.expire === 'function') {
                    await redisClient.expire(key, USER_DRAFTS_TTL_SECONDS);
                }
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.error('DraftService.addToUserDrafts error', {
                error: message,
                userId,
                draftId,
            });
        }
    }

    /**
     * Atomically removes a draft ID from a user's active drafts set (A1, M2).
     */
    static async removeFromUserDrafts(
        userId: string,
        draftId: string
    ): Promise<void> {
        const key = `user:drafts:${userId}`;
        try {
            if (typeof redisClient.srem === 'function') {
                await redisClient.srem(key, draftId);
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.error('DraftService.removeFromUserDrafts error', {
                error: message,
                userId,
                draftId,
            });
        }
    }

    /**
     * Retrieves the list of active draft IDs for a user (A1).
     */
    static async getUserDraftIds(userId: string): Promise<string[]> {
        const key = `user:drafts:${userId}`;
        try {
            if (typeof redisClient.smembers === 'function') {
                const members = await redisClient.smembers(key);
                if (Array.isArray(members)) {
                    return members;
                }
            }
            return [];
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.error('DraftService.getUserDraftIds error', {
                error: message,
                userId,
            });
            return [];
        }
    }

    static async getSoloDraftIds(userId: string): Promise<string[]> {
        const key = `user:solo-drafts:${userId}`;
        try {
            if (typeof redisClient.smembers === 'function') {
                const members = await redisClient.smembers(key);
                if (Array.isArray(members)) return members;
            }
            return [];
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.error('DraftService.getSoloDraftIds error', {
                error: message,
                userId,
            });
            return [];
        }
    }

    static async removeFromSoloDrafts(
        userId: string,
        draftId: string
    ): Promise<void> {
        const key = `user:solo-drafts:${userId}`;
        try {
            if (typeof redisClient.srem === 'function') {
                await redisClient.srem(key, draftId);
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.error('DraftService.removeFromSoloDrafts error', {
                error: message,
                userId,
                draftId,
            });
        }
    }

    /**
     * Masks sensitive fields like inviteToken for non-owner participants (B4).
     */
    static maskSharedDraft(draft: SharedDraft): SharedDraft {
        const { inviteToken: _inviteToken, ...sanitized } = draft;
        return sanitized as SharedDraft;
    }

    /**
     * Retrieves a shared draft by ID.
     * Sanitizes inviteToken if requester is not the draft owner (B4).
     */
    static async getSharedDraft(
        draftId: string,
        requesterUserId?: string
    ): Promise<SharedDraft | null> {
        const key = `draft:shared:${draftId}`;
        try {
            const raw = await redis.get(key);
            if (!raw) return null;

            let draft: SharedDraft;
            try {
                draft = JSON.parse(raw);
            } catch {
                return null;
            }

            // Authorization check if requester is provided
            if (requesterUserId) {
                const isOwner = draft.ownerId === requesterUserId;
                const isCoCook =
                    Array.isArray(draft.coCooksIds) &&
                    draft.coCooksIds.includes(requesterUserId);

                if (!isOwner && !isCoCook) {
                    return null;
                }

                // Mask inviteToken for non-owners (B4)
                if (!isOwner) {
                    return this.maskSharedDraft(draft);
                }
            }

            return draft;
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.error('DraftService.getSharedDraft error', {
                error: message,
                draftId,
            });
            return null;
        }
    }

    /**
     * Saves or merges a shared draft (B2, C3, H1).
     * Enforces MAX_CO_COOKS and MAX_LINKED_RECIPES (B3).
     */
    static async saveSharedDraft(
        draftId: string,
        payload: Partial<SharedDraft>,
        currentUser: SafeUser
    ): Promise<SharedDraft> {
        const key = `draft:shared:${draftId}`;
        const existing = await this.getSharedDraft(draftId);

        if (
            existing &&
            existing.ownerId &&
            existing.ownerId !== currentUser.id
        ) {
            const isCoCook =
                Array.isArray(existing.coCooksIds) &&
                existing.coCooksIds.includes(currentUser.id);
            if (!isCoCook) {
                throw new Error('UNAUTHORIZED_DRAFT_UPDATE');
            }
        }

        const sanitizedPayload = sanitizeDraftPayload(payload);

        let finalCoCooks: string[];
        if (existing && currentUser.id !== existing.ownerId) {
            // Non-owners (co-cooks) can never modify or wipe the co-cooks roster
            finalCoCooks = existing.coCooksIds || [];
        } else if (sanitizedPayload.coCooksIds !== undefined) {
            // Owner update: if coCooksIds is empty array but existing draft has co-cooks,
            // only wipe if explicitly on the RELATED_CONTENT step; otherwise preserve.
            if (
                sanitizedPayload.coCooksIds.length === 0 &&
                (existing?.coCooksIds?.length || 0) > 0 &&
                sanitizedPayload.currentStep !== 5 // STEPS.RELATED_CONTENT
            ) {
                finalCoCooks = existing?.coCooksIds || [];
            } else {
                finalCoCooks = sanitizedPayload.coCooksIds;
            }
        } else {
            finalCoCooks = existing?.coCooksIds || [];
        }
        const limitedCoCooks = Array.from(new Set(finalCoCooks)).slice(
            0,
            MAX_CO_COOKS
        );

        const rawLinked =
            sanitizedPayload.linkedRecipeIds !== undefined
                ? sanitizedPayload.linkedRecipeIds
                : existing?.linkedRecipeIds || [];
        const limitedLinked = Array.from(new Set(rawLinked)).slice(
            0,
            MAX_LINKED_RECIPES
        );

        const merged: SharedDraft = {
            ...existing,
            ...sanitizedPayload,
            draftId,
            ownerId: existing?.ownerId || currentUser.id,
            ownerName:
                existing?.ownerName ||
                currentUser.name ||
                currentUser.email ||
                'Chef',
            ingredients:
                sanitizedPayload.ingredients !== undefined
                    ? sanitizedPayload.ingredients
                    : existing?.ingredients || [],
            steps:
                sanitizedPayload.steps !== undefined
                    ? sanitizedPayload.steps
                    : existing?.steps || [],
            categories:
                sanitizedPayload.categories !== undefined
                    ? sanitizedPayload.categories
                    : existing?.categories || [],
            title:
                sanitizedPayload.title !== undefined
                    ? sanitizedPayload.title
                    : existing?.title || '',
            description:
                sanitizedPayload.description !== undefined
                    ? sanitizedPayload.description
                    : existing?.description || '',
            method:
                sanitizedPayload.method !== undefined
                    ? sanitizedPayload.method
                    : existing?.method || '',
            imageSrc:
                sanitizedPayload.imageSrc !== undefined
                    ? sanitizedPayload.imageSrc
                    : existing?.imageSrc || '',
            imageSrc1:
                sanitizedPayload.imageSrc1 !== undefined
                    ? sanitizedPayload.imageSrc1
                    : existing?.imageSrc1 || '',
            imageSrc2:
                sanitizedPayload.imageSrc2 !== undefined
                    ? sanitizedPayload.imageSrc2
                    : existing?.imageSrc2 || '',
            imageSrc3:
                sanitizedPayload.imageSrc3 !== undefined
                    ? sanitizedPayload.imageSrc3
                    : existing?.imageSrc3 || '',
            minutes:
                sanitizedPayload.minutes !== undefined
                    ? sanitizedPayload.minutes
                    : existing?.minutes !== undefined
                      ? existing.minutes
                      : 30,
            prepTime:
                sanitizedPayload.prepTime !== undefined
                    ? sanitizedPayload.prepTime
                    : existing?.prepTime,
            cookTime:
                sanitizedPayload.cookTime !== undefined
                    ? sanitizedPayload.cookTime
                    : existing?.cookTime,
            coCooksIds: limitedCoCooks,
            linkedRecipeIds: limitedLinked,
            inviteToken:
                existing?.inviteToken ||
                (payload as { inviteToken?: string }).inviteToken,
            updatedAt:
                (payload as { updatedAt?: string }).updatedAt ||
                new Date().toISOString(),
        };

        await redisClient.set(
            key,
            JSON.stringify(merged),
            'EX',
            DRAFT_TTL_SECONDS
        );

        await this.addToUserDrafts(currentUser.id, draftId);

        return merged;
    }

    /**
     * Joins a user to a shared draft via invite token atomically (B2, H2).
     */
    static async joinSharedDraft(
        draftId: string,
        token: string,
        currentUser: SafeUser
    ): Promise<{ success: boolean; error?: string; draft?: SharedDraft }> {
        const nowIso = new Date().toISOString();
        const draftKey = `draft:shared:${draftId}`;
        const userDraftsKey = `user:drafts:${currentUser.id}`;

        // Atomic join via Redis Lua script
        if (typeof redisClient.eval === 'function') {
            try {
                const evalResult = await redisClient.eval(
                    JOIN_SHARED_DRAFT_SCRIPT,
                    2,
                    draftKey,
                    userDraftsKey,
                    token,
                    currentUser.id,
                    MAX_CO_COOKS,
                    DRAFT_TTL_SECONDS,
                    nowIso,
                    USER_DRAFTS_TTL_SECONDS,
                    draftId
                );

                if (typeof evalResult === 'string') {
                    const parsed = JSON.parse(evalResult);
                    if (parsed.ok === 1 && parsed.draft) {
                        return { success: true, draft: parsed.draft };
                    }
                    if (parsed.error) {
                        return { success: false, error: parsed.error };
                    }
                }
            } catch (err: unknown) {
                // If EVAL fails (e.g. lightweight mock environment), gracefully fall through to standard handler
                const message =
                    err instanceof Error ? err.message : String(err);
                logger.warn('DraftService.joinSharedDraft eval fallback', {
                    error: message,
                    draftId,
                });
            }
        }

        // Fallback for mock environments without EVAL support
        const raw = await redisClient.get(draftKey);
        if (!raw) {
            return { success: false, error: 'draft_not_found' };
        }

        let draft: SharedDraft;
        try {
            draft = JSON.parse(raw);
        } catch {
            return { success: false, error: 'invalid_draft_data' };
        }

        if (draft.inviteToken !== token) {
            return { success: false, error: 'invalid_invite_token' };
        }

        const coCooksSet = new Set<string>(draft.coCooksIds || []);
        if (currentUser.id !== draft.ownerId) {
            if (
                !coCooksSet.has(currentUser.id) &&
                coCooksSet.size >= MAX_CO_COOKS
            ) {
                return { success: false, error: 'co_cook_limit_reached' };
            }
            coCooksSet.add(currentUser.id);
        }

        draft.coCooksIds = Array.from(coCooksSet);
        draft.updatedAt = nowIso;

        await redisClient.set(
            draftKey,
            JSON.stringify(draft),
            'EX',
            DRAFT_TTL_SECONDS
        );

        await this.addToUserDrafts(currentUser.id, draftId);

        return { success: true, draft };
    }

    /**
     * Deletes a shared draft and cleans up all related locks and user lists.
     */
    static async deleteSharedDraft(
        draftId: string,
        currentUser: SafeUser
    ): Promise<boolean> {
        const key = `draft:shared:${draftId}`;
        const raw = await redisClient.get(key);
        let participants: string[] = [currentUser.id];

        if (raw) {
            let draft: SharedDraft;
            try {
                draft = JSON.parse(raw);
            } catch {
                throw new Error('CORRUPTED_DRAFT_DATA');
            }

            if (draft.ownerId && draft.ownerId !== currentUser.id) {
                throw new Error('ONLY_OWNER_CAN_DELETE');
            }

            participants = Array.from(
                new Set([
                    currentUser.id,
                    draft.ownerId,
                    ...(draft.coCooksIds || []),
                ])
            ).filter(Boolean);
        }

        await Promise.all([
            redisClient.del(key),
            redisClient.del(`draft:user:${currentUser.id}:${draftId}`),
            this.removeFromSoloDrafts(currentUser.id, draftId),
            releaseAllLocks(draftId),
        ]);

        await Promise.all(
            participants.map(async (uid) => {
                await this.removeFromUserDrafts(uid, draftId);
            })
        );

        return true;
    }

    /**
     * Cleans up a shared or solo draft and locks when a recipe is published.
     */
    static async cleanUpDraftOnPublish(
        draftId: string,
        userId?: string
    ): Promise<void> {
        const key = `draft:shared:${draftId}`;
        try {
            const raw = await redisClient.get(key);
            let participants: string[] = [];
            if (raw) {
                try {
                    const draft: SharedDraft = JSON.parse(raw);
                    participants = Array.from(
                        new Set([draft.ownerId, ...(draft.coCooksIds || [])])
                    ).filter(Boolean);
                } catch (parseError: unknown) {
                    const parseMessage =
                        parseError instanceof Error
                            ? parseError.message
                            : String(parseError);
                    logger.warn(
                        'DraftService.cleanUpDraftOnPublish corrupted draft data',
                        {
                            draftId,
                            error: parseMessage,
                        }
                    );
                }
            }

            if (userId && !participants.includes(userId)) {
                participants.push(userId);
            }

            await Promise.all([redisClient.del(key), releaseAllLocks(draftId)]);

            if (participants.length > 0) {
                await Promise.all(
                    participants.map(async (uid) => {
                        await this.deleteSingleUserDraft(uid, draftId);
                    })
                );
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            logger.error('DraftService.cleanUpDraftOnPublish error', {
                error: message,
                draftId,
                userId,
            });
        }
    }

    /**
     * Single-user draft helpers (M1 deprecated legacy un-indexed keys).
     */
    static async getSingleUserDraft(
        userId: string,
        slotId?: string
    ): Promise<SingleDraft | SharedDraft | null> {
        if (slotId) {
            const raw = await redisClient.get(`draft:user:${userId}:${slotId}`);
            if (!raw) return null;
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        }

        // When no slotId is specified, load the user's most recently modified draft
        const allDrafts = await this.getAllUserDrafts(userId);
        if (allDrafts && allDrafts.length > 0) {
            const latest = allDrafts[0];
            if (latest.type === 'shared') {
                return await this.getSharedDraft(latest.draftId, userId);
            }
            const soloRaw = await redisClient.get(
                `draft:user:${userId}:${latest.draftId}`
            );
            if (soloRaw) {
                try {
                    return JSON.parse(soloRaw);
                } catch {
                    // Fallback to latest summary
                }
            }
            return latest;
        }

        return null;
    }

    private static async saveSingleUserDraftWithQuota(
        userId: string,
        draftId: string,
        serialized: string
    ): Promise<boolean> {
        const draftKey = `draft:user:${userId}:${draftId}`;
        const soloIndexKey = `user:solo-drafts:${userId}`;
        const combinedIndexKey = `user:drafts:${userId}`;
        const draftKeyPrefix = `draft:user:${userId}:`;

        if (typeof redisClient.eval === 'function') {
            const result = await redisClient.eval(
                SAVE_SOLO_DRAFT_SCRIPT,
                3,
                draftKey,
                soloIndexKey,
                combinedIndexKey,
                draftId,
                serialized,
                SOLO_DRAFT_TTL_SECONDS,
                MAX_SOLO_DRAFT_SLOTS,
                USER_DRAFTS_TTL_SECONDS,
                draftKeyPrefix
            );
            return Number(result) === 1;
        }

        // Fallback for lightweight Redis mocks that do not implement EVAL
        const [existingRaw, initialSoloIds] = await Promise.all([
            redisClient.get(draftKey),
            this.getSoloDraftIds(userId),
        ]);
        const soloIds = new Set(initialSoloIds);

        const currentSoloList = Array.from(soloIds);
        const soloDrafts = await Promise.all(
            currentSoloList.map((id) =>
                redisClient.get(`${draftKeyPrefix}${id}`)
            )
        );
        currentSoloList.forEach((id, idx) => {
            if (!soloDrafts[idx]) {
                soloIds.delete(id);
            }
        });

        if (!existingRaw && soloIds.size >= MAX_SOLO_DRAFT_SLOTS) {
            return false;
        }

        await redisClient.set(
            draftKey,
            serialized,
            'EX',
            SOLO_DRAFT_TTL_SECONDS
        );
        soloIds.add(draftId);

        if (typeof redisClient.sadd === 'function') {
            await redisClient.sadd(soloIndexKey, ...Array.from(soloIds));
            if (typeof redisClient.expire === 'function') {
                await redisClient.expire(soloIndexKey, SOLO_DRAFT_TTL_SECONDS);
            }
        }
        await this.addToUserDrafts(userId, draftId);
        return true;
    }

    static async saveSingleUserDraft(
        userId: string,
        data: SingleDraft,
        slotId?: string
    ): Promise<string> {
        const id = slotId || crypto.randomUUID();

        let existing: SingleDraft | null = null;
        if (slotId) {
            existing = (await this.getSingleUserDraft(
                userId,
                slotId
            )) as SingleDraft | null;
        }

        const nowIso = new Date().toISOString();
        const sanitized = sanitizeDraftPayload(data);
        const createdAt =
            existing?.createdAt || (data.createdAt as string) || nowIso;
        const updatedAt = data.updatedAt || nowIso;

        const merged: SingleDraft = {
            ...existing,
            ...sanitized,
            draftId: id,
            type: 'solo',
            ownerId: userId,
            createdAt,
            updatedAt,
            ingredients:
                sanitized.ingredients !== undefined
                    ? sanitized.ingredients
                    : existing?.ingredients || [],
            steps:
                sanitized.steps !== undefined
                    ? sanitized.steps
                    : existing?.steps || [],
            categories:
                sanitized.categories !== undefined
                    ? sanitized.categories
                    : existing?.categories || [],
        };

        // Mutate caller's data object with assigned draftId and updatedAt
        data.draftId = id;
        data.updatedAt = updatedAt;
        if (!data.createdAt) {
            data.createdAt = createdAt;
        }

        const serialized = JSON.stringify(merged);
        const saved = await this.saveSingleUserDraftWithQuota(
            userId,
            id,
            serialized
        );
        if (!saved) {
            throw new Error('MAX_SOLO_DRAFTS_REACHED');
        }

        return id;
    }

    static async deleteSingleUserDraft(
        userId: string,
        slotId?: string
    ): Promise<boolean> {
        if (slotId) {
            const del = await redisClient.del(`draft:user:${userId}:${slotId}`);
            await Promise.all([
                this.removeFromUserDrafts(userId, slotId),
                this.removeFromSoloDrafts(userId, slotId),
            ]);

            return Boolean(del);
        } else {
            const [combinedIds, indexedSoloIds] = await Promise.all([
                this.getUserDraftIds(userId),
                this.getSoloDraftIds(userId),
            ]);

            const soloIds = Array.from(
                new Set([...combinedIds, ...indexedSoloIds])
            );
            let deletedAny = false;

            const deletionResults = await Promise.all(
                soloIds.map(async (id) => {
                    const soloKey = `draft:user:${userId}:${id}`;
                    const raw = await redisClient.get(soloKey);
                    if (raw) {
                        await redisClient.del(soloKey);
                        await Promise.all([
                            this.removeFromUserDrafts(userId, id),
                            this.removeFromSoloDrafts(userId, id),
                        ]);
                        return true;
                    }
                    return false;
                })
            );

            if (deletionResults.some(Boolean)) {
                deletedAny = true;
            }

            await redisClient.del(`user:solo-drafts:${userId}`);
            return deletedAny;
        }
    }

    static async getAllUserDrafts(userId: string): Promise<DraftSummary[]> {
        const draftIds = await this.getUserDraftIds(userId);
        const uniqueDraftIds = Array.from(new Set(draftIds));

        const draftItems = await Promise.all(
            uniqueDraftIds.map(async (id): Promise<DraftSummary | null> => {
                const shared = await this.getSharedDraft(id, userId);
                if (shared) {
                    const updatedAt =
                        shared.updatedAt || new Date().toISOString();
                    return {
                        draftId: shared.draftId,
                        type: 'shared',
                        title: shared.title,
                        description: shared.description,
                        categories: shared.categories,
                        ingredients: shared.ingredients,
                        steps: shared.steps,
                        method: shared.method,
                        coCooksIds: shared.coCooksIds || [],
                        ownerId: shared.ownerId,
                        ownerName: shared.ownerName,
                        updatedAt,
                        imageSrc: shared.imageSrc,
                    };
                }

                const soloRaw = await redisClient.get(
                    `draft:user:${userId}:${id}`
                );
                if (soloRaw) {
                    try {
                        const solo: SingleDraft = JSON.parse(soloRaw);
                        const updatedAt =
                            solo.updatedAt ||
                            solo.createdAt ||
                            new Date().toISOString();
                        return {
                            draftId: id,
                            type: 'solo',
                            title: solo.title,
                            description: solo.description,
                            categories: solo.categories,
                            ingredients: solo.ingredients,
                            steps: solo.steps,
                            method: solo.method,
                            coCooksIds: solo.coCooksIds || [],
                            ownerId: solo.ownerId || userId,
                            ownerName: solo.ownerName,
                            updatedAt,
                            imageSrc: solo.imageSrc,
                        };
                    } catch {
                        return null;
                    }
                } else {
                    await Promise.all([
                        this.removeFromUserDrafts(userId, id),
                        this.removeFromSoloDrafts(userId, id),
                    ]);
                    return null;
                }
            })
        );

        const results = draftItems.filter((item): item is DraftSummary =>
            Boolean(item)
        );

        results.sort((a, b) => {
            const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return bDate - aDate;
        });

        return results;
    }
}
