import { redis } from '@/app/lib/redis';
import { releaseAllLocks } from '@/app/lib/redisLock';
import { logger } from '@/app/lib/axiom/server';
import { SafeUser } from '@/app/types';
import { SharedDraft, SingleDraft } from '@/app/types/draft';
import {
    DRAFT_TTL_SECONDS,
    USER_DRAFTS_TTL_SECONDS,
    MAX_CO_COOKS,
    MAX_LINKED_RECIPES,
} from '@/app/utils/constants';

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

            // Also check string JSON list for backward compatibility
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

        const rawCoCooks = [
            ...(existing?.coCooksIds || []),
            ...(sanitizedPayload.coCooksIds || []),
        ];
        const limitedCoCooks = Array.from(new Set(rawCoCooks)).slice(
            0,
            MAX_CO_COOKS
        );

        const rawLinked =
            sanitizedPayload.linkedRecipeIds || existing?.linkedRecipeIds || [];
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
                sanitizedPayload.ingredients &&
                sanitizedPayload.ingredients.length > 0
                    ? sanitizedPayload.ingredients
                    : existing?.ingredients || [],
            steps:
                sanitizedPayload.steps && sanitizedPayload.steps.length > 0
                    ? sanitizedPayload.steps
                    : existing?.steps || [],
            categories:
                sanitizedPayload.categories &&
                sanitizedPayload.categories.length > 0
                    ? sanitizedPayload.categories
                    : existing?.categories || [],
            title:
                sanitizedPayload.title !== undefined &&
                sanitizedPayload.title !== ''
                    ? sanitizedPayload.title
                    : existing?.title || '',
            description:
                sanitizedPayload.description !== undefined &&
                sanitizedPayload.description !== ''
                    ? sanitizedPayload.description
                    : existing?.description || '',
            method:
                sanitizedPayload.method !== undefined &&
                sanitizedPayload.method !== ''
                    ? sanitizedPayload.method
                    : existing?.method || '',
            imageSrc:
                sanitizedPayload.imageSrc !== undefined &&
                sanitizedPayload.imageSrc !== ''
                    ? sanitizedPayload.imageSrc
                    : existing?.imageSrc || '',
            imageSrc1:
                sanitizedPayload.imageSrc1 !== undefined &&
                sanitizedPayload.imageSrc1 !== ''
                    ? sanitizedPayload.imageSrc1
                    : existing?.imageSrc1 || '',
            imageSrc2:
                sanitizedPayload.imageSrc2 !== undefined &&
                sanitizedPayload.imageSrc2 !== ''
                    ? sanitizedPayload.imageSrc2
                    : existing?.imageSrc2 || '',
            imageSrc3:
                sanitizedPayload.imageSrc3 !== undefined &&
                sanitizedPayload.imageSrc3 !== ''
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

        await Promise.all([redis.del(key), releaseAllLocks(draftId)]);

        await Promise.all(
            participants.map((uid) => this.removeFromUserDrafts(uid, draftId))
        );

        return true;
    }

    /**
     * Cleans up a shared draft and locks when a recipe is published.
     */
    static async cleanUpDraftOnPublish(draftId: string): Promise<void> {
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

            await Promise.all([redis.del(key), releaseAllLocks(draftId)]);

            if (participants.length > 0) {
                await Promise.all(
                    participants.map((uid) =>
                        this.removeFromUserDrafts(uid, draftId)
                    )
                );
            }
        } catch (error: any) {
            logger.error('DraftService.cleanUpDraftOnPublish error', {
                error: error.message,
                draftId,
            });
        }
    }

    /**
     * Single-user draft helpers.
     */
    static async getSingleUserDraft(
        userId: string
    ): Promise<SingleDraft | null> {
        let raw = await redis.get(`draft:user:${userId}`);
        if (!raw) {
            raw = await redis.get(userId);
        }
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    static async saveSingleUserDraft(
        userId: string,
        data: SingleDraft
    ): Promise<void> {
        const serialized = JSON.stringify(data);
        await Promise.all([
            redis.set(`draft:user:${userId}`, serialized),
            redis.set(userId, serialized),
        ]);
    }

    static async deleteSingleUserDraft(userId: string): Promise<boolean> {
        const [del1, del2] = await Promise.all([
            redis.del(`draft:user:${userId}`),
            redis.del(userId),
        ]);
        return Boolean(del1 || del2);
    }
}
