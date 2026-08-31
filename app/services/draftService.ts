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

const SAVE_SOLO_DRAFT_SCRIPT = `
local combinedType = redis.call('TYPE', KEYS[3])
if type(combinedType) == 'table' then
    combinedType = combinedType.ok
end

local function migrateSoloId(id)
    if redis.call('EXISTS', ARGV[6] .. id) == 1 then
        redis.call('SADD', KEYS[2], id)
    end
end

if combinedType == 'set' then
    local combinedIds = redis.call('SMEMBERS', KEYS[3])
    for _, id in ipairs(combinedIds) do
        migrateSoloId(id)
    end
elseif combinedType == 'string' then
    local rawCombined = redis.call('GET', KEYS[3])
    local decoded, legacyIds = pcall(cjson.decode, rawCombined)
    redis.call('DEL', KEYS[3])
    if decoded and type(legacyIds) == 'table' then
        for _, id in ipairs(legacyIds) do
            redis.call('SADD', KEYS[3], id)
            migrateSoloId(id)
        end
    end
end

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
    'inviteToken',
];

/**
 * Filter an arbitrary payload to only allowed draft fields to prevent field pollution (C3).
 */
function sanitizeDraftPayload(body: any): Partial<SharedDraft> {
    const sanitized: Partial<SharedDraft> = {};
    if (!body || typeof body !== 'object') return sanitized;

    for (const field of ALLOWED_DRAFT_FIELDS) {
        if (body[field] !== undefined) {
            (sanitized as any)[field] = body[field];
        }
    }
    return sanitized;
}

export class DraftService {
    /**
     * Atomically adds a draft ID to a user's active drafts set/list (A1).
     */
    static async addToUserDrafts(
        userId: string,
        draftId: string
    ): Promise<void> {
        const key = `user:drafts:${userId}`;
        try {
            if (typeof (redis as any).sadd === 'function') {
                await (redis as any).sadd(key, draftId);
                if (typeof (redis as any).expire === 'function') {
                    await (redis as any).expire(key, USER_DRAFTS_TTL_SECONDS);
                }
                return;
            }

            // Fallback for mock environments
            const raw = await redis.get(key);
            let list: string[] = [];
            if (raw) {
                try {
                    list = JSON.parse(raw);
                } catch {}
            }
            if (!list.includes(draftId)) {
                list.push(draftId);
                await redis.set(
                    key,
                    JSON.stringify(list),
                    'EX',
                    USER_DRAFTS_TTL_SECONDS
                );
            }
        } catch (error: any) {
            logger.error('DraftService.addToUserDrafts error', {
                error: error.message,
                userId,
                draftId,
            });
        }
    }

    /**
     * Atomically removes a draft ID from a user's active drafts set/list (A1).
     */
    static async removeFromUserDrafts(
        userId: string,
        draftId: string
    ): Promise<void> {
        const key = `user:drafts:${userId}`;
        try {
            if (typeof (redis as any).srem === 'function') {
                await (redis as any).srem(key, draftId);
            }

            // Also check string JSON list for backward compatibility with legacy storage
            const raw = await redis.get(key);
            if (raw) {
                try {
                    const list: string[] = JSON.parse(raw);
                    if (Array.isArray(list)) {
                        const filtered = list.filter((id) => id !== draftId);
                        await redis.set(
                            key,
                            JSON.stringify(filtered),
                            'EX',
                            USER_DRAFTS_TTL_SECONDS
                        );
                    }
                } catch {}
            }
        } catch (error: any) {
            logger.error('DraftService.removeFromUserDrafts error', {
                error: error.message,
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
            if (typeof (redis as any).smembers === 'function') {
                const members = await (redis as any).smembers(key);
                if (Array.isArray(members) && members.length > 0) {
                    return members;
                }
            }

            // Fallback for string JSON list
            const raw = await redis.get(key);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) return parsed;
                } catch {}
            }
            return [];
        } catch (error: any) {
            logger.error('DraftService.getUserDraftIds error', {
                error: error.message,
                userId,
            });
            return [];
        }
    }

    static async getSoloDraftIds(userId: string): Promise<string[]> {
        const key = `user:solo-drafts:${userId}`;
        try {
            if (typeof (redis as any).smembers === 'function') {
                const members = await (redis as any).smembers(key);
                if (Array.isArray(members)) return members;
            }

            const raw = await redis.get(key);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error: any) {
            logger.error('DraftService.getSoloDraftIds error', {
                error: error.message,
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
            if (typeof (redis as any).srem === 'function') {
                await (redis as any).srem(key, draftId);
                return;
            }

            const raw = await redis.get(key);
            if (!raw) return;
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
                await redis.set(
                    key,
                    JSON.stringify(list.filter((id) => id !== draftId)),
                    'EX',
                    SOLO_DRAFT_TTL_SECONDS
                );
            }
        } catch (error: any) {
            logger.error('DraftService.removeFromSoloDrafts error', {
                error: error.message,
                userId,
                draftId,
            });
        }
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
                    const { inviteToken: _inviteToken, ...sanitized } = draft;
                    return sanitized as SharedDraft;
                }
            }

            return draft;
        } catch (error: any) {
            logger.error('DraftService.getSharedDraft error', {
                error: error.message,
                draftId,
            });
            return null;
        }
    }

    /**
     * Saves or merges a shared draft (B2, C3).
     * Enforces MAX_CO_COOKS and MAX_LINKED_RECIPES (B3).
     */
    static async saveSharedDraft(
        draftId: string,
        payload: Partial<SharedDraft> | any,
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

        const rawCoCooks =
            sanitizedPayload.coCooksIds !== undefined
                ? sanitizedPayload.coCooksIds.length === 0
                    ? []
                    : [
                          ...(existing?.coCooksIds || []),
                          ...sanitizedPayload.coCooksIds,
                      ]
                : existing?.coCooksIds || [];
        const limitedCoCooks = Array.from(new Set(rawCoCooks)).slice(
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
                sanitizedPayload.inviteToken ||
                payload.inviteToken,
            updatedAt: new Date().toISOString(),
        };

        await redis.set(key, JSON.stringify(merged), 'EX', DRAFT_TTL_SECONDS);

        await this.addToUserDrafts(currentUser.id, draftId);

        return merged;
    }

    /**
     * Joins a user to a shared draft via invite token (B2).
     */
    static async joinSharedDraft(
        draftId: string,
        token: string,
        currentUser: SafeUser
    ): Promise<{ success: boolean; error?: string; draft?: SharedDraft }> {
        const raw = await redis.get(`draft:shared:${draftId}`);
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
        draft.updatedAt = new Date().toISOString();

        await redis.set(
            `draft:shared:${draftId}`,
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
        const raw = await redis.get(key);
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
            redis.del(key),
            redis.del(`draft:user:${currentUser.id}:${draftId}`),
            this.removeFromSoloDrafts(currentUser.id, draftId),
            releaseAllLocks(draftId),
        ]);

        await Promise.all(
            participants.map(async (uid) => {
                await this.removeFromUserDrafts(uid, draftId);
                const remaining = await this.getUserDraftIds(uid);
                if (remaining.length === 0) {
                    await Promise.all([
                        redis.del(`draft:user:${uid}`),
                        redis.del(uid),
                    ]);
                }
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
            const raw = await redis.get(key);
            let participants: string[] = [];
            if (raw) {
                try {
                    const draft: SharedDraft = JSON.parse(raw);
                    participants = Array.from(
                        new Set([draft.ownerId, ...(draft.coCooksIds || [])])
                    ).filter(Boolean);
                } catch {}
            }

            if (userId && !participants.includes(userId)) {
                participants.push(userId);
            }

            await Promise.all([redis.del(key), releaseAllLocks(draftId)]);

            if (participants.length > 0) {
                await Promise.all(
                    participants.map(async (uid) => {
                        await this.deleteSingleUserDraft(uid, draftId);
                    })
                );
            }
        } catch (error: any) {
            logger.error('DraftService.cleanUpDraftOnPublish error', {
                error: error.message,
                draftId,
                userId,
            });
        }
    }

    /**
     * Single-user draft helpers.
     */
    static async getSingleUserDraft(
        userId: string,
        slotId?: string
    ): Promise<SingleDraft | SharedDraft | null> {
        let raw;
        if (slotId) {
            raw = await redis.get(`draft:user:${userId}:${slotId}`);
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
            const soloRaw = await redis.get(
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

        // Fallback for legacy un-indexed keys
        raw = await redis.get(`draft:user:${userId}`);
        if (!raw) {
            raw = await redis.get(userId);
        }
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                // If the legacy draft has a draftId, verify that the slotted/shared draft still exists
                if (parsed.draftId) {
                    const slottedExists = await redis.get(
                        `draft:user:${userId}:${parsed.draftId}`
                    );
                    const sharedExists = await redis.get(
                        `draft:shared:${parsed.draftId}`
                    );
                    if (!slottedExists && !sharedExists) {
                        // Stale ghost shadow key from an already-deleted draft! Clean up immediately.
                        await Promise.all([
                            redis.del(`draft:user:${userId}`),
                            redis.del(userId),
                        ]);
                        return null;
                    }
                } else {
                    // True un-indexed legacy draft without draftId: migrate to multi-slot
                    const legacyId = crypto.randomUUID();
                    await this.saveSingleUserDraft(userId, parsed, legacyId);
                }
            }
            return parsed;
        } catch {
            return null;
        }
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

        if (typeof (redis as any).eval === 'function') {
            const result = await (redis as any).eval(
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

        // Lightweight Redis mocks may not implement EVAL. Production ioredis
        // always uses the atomic script above.
        const [existingRaw, combinedIds, initialSoloIds] = await Promise.all([
            redis.get(draftKey),
            this.getUserDraftIds(userId),
            this.getSoloDraftIds(userId),
        ]);
        const soloIds = new Set(initialSoloIds);

        const combinedDrafts = await Promise.all(
            combinedIds.map((id) => redis.get(`${draftKeyPrefix}${id}`))
        );
        combinedIds.forEach((id, idx) => {
            if (combinedDrafts[idx]) {
                soloIds.add(id);
            }
        });

        const currentSoloList = Array.from(soloIds);
        const soloDrafts = await Promise.all(
            currentSoloList.map((id) => redis.get(`${draftKeyPrefix}${id}`))
        );
        currentSoloList.forEach((id, idx) => {
            if (!soloDrafts[idx]) {
                soloIds.delete(id);
            }
        });

        if (!existingRaw && soloIds.size >= MAX_SOLO_DRAFT_SLOTS) {
            return false;
        }

        await redis.set(draftKey, serialized, 'EX', SOLO_DRAFT_TTL_SECONDS);
        soloIds.add(draftId);

        if (typeof (redis as any).sadd === 'function') {
            await (redis as any).sadd(soloIndexKey, ...Array.from(soloIds));
            if (typeof (redis as any).expire === 'function') {
                await (redis as any).expire(
                    soloIndexKey,
                    SOLO_DRAFT_TTL_SECONDS
                );
            }
        } else {
            await redis.set(
                soloIndexKey,
                JSON.stringify(Array.from(soloIds)),
                'EX',
                SOLO_DRAFT_TTL_SECONDS
            );
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
            existing = await this.getSingleUserDraft(userId, slotId);
        }

        const nowIso = new Date().toISOString();
        data.draftId = id;
        data.updatedAt = data.updatedAt || nowIso;
        if (!data.createdAt) {
            data.createdAt = existing?.createdAt || data.updatedAt;
        }

        const merged: SingleDraft = {
            ...existing,
            ...data,
            draftId: id,
            ingredients:
                data.ingredients !== undefined
                    ? data.ingredients
                    : existing?.ingredients || [],
            steps:
                data.steps !== undefined ? data.steps : existing?.steps || [],
            categories:
                data.categories !== undefined
                    ? data.categories
                    : existing?.categories || [],
            updatedAt: data.updatedAt,
        };

        const serialized = JSON.stringify(merged);
        const saved = await this.saveSingleUserDraftWithQuota(
            userId,
            id,
            serialized
        );
        if (!saved) {
            throw new Error('MAX_SOLO_DRAFTS_REACHED');
        }

        await Promise.all([
            redis.set(
                `draft:user:${userId}`,
                serialized,
                'EX',
                SOLO_DRAFT_TTL_SECONDS
            ),
            redis.set(userId, serialized, 'EX', SOLO_DRAFT_TTL_SECONDS),
        ]);

        return id;
    }

    static async deleteSingleUserDraft(
        userId: string,
        slotId?: string
    ): Promise<boolean> {
        if (slotId) {
            const del = await redis.del(`draft:user:${userId}:${slotId}`);
            await Promise.all([
                this.removeFromUserDrafts(userId, slotId),
                this.removeFromSoloDrafts(userId, slotId),
            ]);

            const remaining = await this.getSoloDraftIds(userId);
            if (remaining.length === 0) {
                await Promise.all([
                    redis.del(`draft:user:${userId}`),
                    redis.del(userId),
                ]);
            } else {
                // Clean up or update legacy key if it held this draft
                const legacyRaw = await redis.get(`draft:user:${userId}`);
                if (legacyRaw) {
                    try {
                        const parsed = JSON.parse(legacyRaw);
                        if (parsed.draftId === slotId) {
                            const latest = await this.getSingleUserDraft(
                                userId,
                                remaining[0]
                            );
                            if (latest) {
                                await redis.set(
                                    `draft:user:${userId}`,
                                    JSON.stringify(latest),
                                    'EX',
                                    SOLO_DRAFT_TTL_SECONDS
                                );
                            } else {
                                await Promise.all([
                                    redis.del(`draft:user:${userId}`),
                                    redis.del(userId),
                                ]);
                            }
                        }
                    } catch {
                        await Promise.all([
                            redis.del(`draft:user:${userId}`),
                            redis.del(userId),
                        ]);
                    }
                }
            }

            return Boolean(del);
        } else {
            const [del1, del2, combinedIds, indexedSoloIds] = await Promise.all(
                [
                    redis.del(`draft:user:${userId}`),
                    redis.del(userId),
                    this.getUserDraftIds(userId),
                    this.getSoloDraftIds(userId),
                ]
            );

            const indexedSoloSet = new Set(indexedSoloIds);
            const soloIds = Array.from(
                new Set([...combinedIds, ...indexedSoloIds])
            );
            let deletedAny = Boolean(del1 || del2);

            const deletionResults = await Promise.all(
                soloIds.map(async (id) => {
                    const soloKey = `draft:user:${userId}:${id}`;
                    const raw = await redis.get(soloKey);
                    if (raw) {
                        await redis.del(soloKey);
                        await Promise.all([
                            this.removeFromUserDrafts(userId, id),
                            this.removeFromSoloDrafts(userId, id),
                        ]);
                        return true;
                    } else if (indexedSoloSet.has(id)) {
                        await this.removeFromSoloDrafts(userId, id);
                        const shared = await redis.get(`draft:shared:${id}`);
                        if (!shared) {
                            await this.removeFromUserDrafts(userId, id);
                        }
                    }
                    return false;
                })
            );

            if (deletionResults.some(Boolean)) {
                deletedAny = true;
            }

            await redis.del(`user:solo-drafts:${userId}`);
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

                const soloRaw = await redis.get(`draft:user:${userId}:${id}`);
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
