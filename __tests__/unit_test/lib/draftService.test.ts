import { DraftService } from '@/app/services/draftService';
import { redis } from '@/app/lib/redis';
import { releaseAllLocks } from '@/app/lib/redisLock';
import { SafeUser } from '@/app/types';
import { SOLO_DRAFT_TTL_SECONDS } from '@/app/utils/constants';

jest.mock('@/app/lib/redis', () => {
    const store: Record<string, any> = {};
    const sets: Record<string, Set<string>> = {};
    return {
        redis: {
            get: jest.fn(async (key: string) => store[key] || null),
            set: jest.fn(async (key: string, val: string) => {
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
                    if (sets[k]) {
                        delete sets[k];
                        deleted++;
                    }
                }
                return deleted;
            }),
            sadd: jest.fn(async (key: string, ...members: string[]) => {
                if (!sets[key]) sets[key] = new Set();
                members.forEach((m) => sets[key].add(m));
                return members.length;
            }),
            srem: jest.fn(async (key: string, ...members: string[]) => {
                if (!sets[key]) return 0;
                let rem = 0;
                members.forEach((m) => {
                    if (sets[key].delete(m)) rem++;
                });
                return rem;
            }),
            smembers: jest.fn(async (key: string) => {
                if (!sets[key]) return [];
                return Array.from(sets[key]);
            }),
            expire: jest.fn(async () => 1),
            eval: jest.fn(
                async (
                    _script: string,
                    _numKeys: number,
                    draftKey: string,
                    soloIndexKey: string,
                    combinedIndexKey: string,
                    draftId: string,
                    serialized: string,
                    _soloTtl: number,
                    maxSlots: number,
                    _combinedTtl: number,
                    draftKeyPrefix: string
                ) => {
                    if (_numKeys === 2) {
                        const raw = store[draftKey];
                        if (!raw)
                            return JSON.stringify({
                                ok: 0,
                                error: 'draft_not_found',
                            });
                        let draft;
                        try {
                            draft = JSON.parse(raw);
                        } catch {
                            return JSON.stringify({
                                ok: 0,
                                error: 'invalid_draft_data',
                            });
                        }
                        if (draft.inviteToken !== combinedIndexKey) {
                            return JSON.stringify({
                                ok: 0,
                                error: 'invalid_invite_token',
                            });
                        }
                        const coCooks = draft.coCooksIds || [];
                        const userId = draftId;
                        const maxCoCooks = Number(serialized);
                        if (
                            draft.ownerId !== userId &&
                            !coCooks.includes(userId)
                        ) {
                            if (coCooks.length >= maxCoCooks) {
                                return JSON.stringify({
                                    ok: 0,
                                    error: 'co_cook_limit_reached',
                                });
                            }
                            coCooks.push(userId);
                            draft.coCooksIds = coCooks;
                        }
                        draft.updatedAt = String(_soloTtl);
                        store[draftKey] = JSON.stringify(draft);
                        if (!sets[soloIndexKey]) sets[soloIndexKey] = new Set();
                        sets[soloIndexKey].add(draft.draftId || draftKey);
                        return JSON.stringify({ ok: 1, draft });
                    }

                    if (!sets[soloIndexKey]) sets[soloIndexKey] = new Set();
                    if (!sets[combinedIndexKey]) {
                        sets[combinedIndexKey] = new Set();
                    }

                    for (const id of sets[combinedIndexKey]) {
                        if (store[`${draftKeyPrefix}${id}`]) {
                            sets[soloIndexKey].add(id);
                        }
                    }
                    for (const id of Array.from(sets[soloIndexKey])) {
                        if (!store[`${draftKeyPrefix}${id}`]) {
                            sets[soloIndexKey].delete(id);
                        }
                    }

                    if (
                        !store[draftKey] &&
                        sets[soloIndexKey].size >= Number(maxSlots)
                    ) {
                        return 0;
                    }

                    store[draftKey] = serialized;
                    sets[soloIndexKey].add(draftId);
                    sets[combinedIndexKey].add(draftId);
                    return 1;
                }
            ),
            _store: store,
            _sets: sets,
        },
    };
});

jest.mock('@/app/lib/redisLock', () => ({
    releaseAllLocks: jest.fn().mockResolvedValue(undefined),
}));

const mockOwner: SafeUser = {
    id: 'owner-1',
    name: 'Chef Owner',
    email: 'owner@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockCoCook: SafeUser = {
    id: 'cocook-1',
    name: 'Chef CoCook',
    email: 'cocook@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockStranger: SafeUser = {
    id: 'stranger-1',
    name: 'Chef Stranger',
    email: 'stranger@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('DraftService', () => {
    beforeEach(() => {
        const store = (redis as any)._store;
        const sets = (redis as any)._sets;
        for (const k of Object.keys(store)) delete store[k];
        for (const k of Object.keys(sets)) delete sets[k];
        jest.clearAllMocks();
    });

    describe('User drafts list operations (Redis Sets)', () => {
        it('should add draftId to user drafts set with TTL', async () => {
            await DraftService.addToUserDrafts('user-1', 'draft-abc');
            const list = await DraftService.getUserDraftIds('user-1');
            expect(list).toContain('draft-abc');
            expect(redis.sadd).toHaveBeenCalledWith(
                'user:drafts:user-1',
                'draft-abc'
            );
            expect(redis.expire).toHaveBeenCalledWith(
                'user:drafts:user-1',
                SOLO_DRAFT_TTL_SECONDS
            );
        });

        it('should remove draftId from user drafts set', async () => {
            await DraftService.addToUserDrafts('user-1', 'draft-abc');
            await DraftService.removeFromUserDrafts('user-1', 'draft-abc');
            const list = await DraftService.getUserDraftIds('user-1');
            expect(list).not.toContain('draft-abc');
            expect(redis.srem).toHaveBeenCalledWith(
                'user:drafts:user-1',
                'draft-abc'
            );
        });
    });

    describe('saveSharedDraft & field allowlisting', () => {
        it('should save shared draft and filter out unallowed fields', async () => {
            const saved = await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Paella',
                    description: 'Traditional paella',
                    inviteToken: 'secret-token-123',
                    maliciousField: 'exploit',
                } as any,
                mockOwner
            );

            expect(saved.title).toBe('Paella');
            expect(saved.ownerId).toBe('owner-1');
            expect(saved.inviteToken).toBe('secret-token-123');
            expect((saved as any).maliciousField).toBeUndefined();
        });

        it('should enforce MAX_CO_COOKS and MAX_LINKED_RECIPES', async () => {
            const saved = await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Tapas',
                    coCooksIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
                    linkedRecipeIds: ['r1', 'r2', 'r3', 'r4'],
                },
                mockOwner
            );

            expect(saved.coCooksIds.length).toBe(4);
            expect(saved.linkedRecipeIds?.length).toBe(2);
        });

        it('should reject draft updates from unauthorized users', async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                { title: 'Tapas', inviteToken: 'tok1' },
                mockOwner
            );

            await expect(
                DraftService.saveSharedDraft(
                    'draft-1',
                    { title: 'Hacked Tapas' },
                    mockStranger
                )
            ).rejects.toThrow('UNAUTHORIZED_DRAFT_UPDATE');
        });

        it('should allow updates from existing co-cooks', async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                { title: 'Tapas', coCooksIds: [mockCoCook.id] },
                mockOwner
            );

            const updated = await DraftService.saveSharedDraft(
                'draft-1',
                { title: 'Co-Cook Tapas Edit' },
                mockCoCook
            );

            expect(updated.title).toBe('Co-Cook Tapas Edit');
            expect(updated.ownerId).toBe('owner-1');
        });

        it('should clear explicitly empty arrays and strings', async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Original Title',
                    description: 'Original Description',
                    categories: ['dinner'],
                    ingredients: ['Tomato', 'Garlic'],
                    steps: ['Chop', 'Fry'],
                    method: 'stovetop',
                },
                mockOwner
            );

            const updated = await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: '',
                    description: '',
                    categories: [],
                    ingredients: [],
                    steps: [],
                    method: '',
                },
                mockOwner
            );

            expect(updated.title).toBe('');
            expect(updated.description).toBe('');
            expect(updated.categories).toEqual([]);
            expect(updated.ingredients).toEqual([]);
            expect(updated.steps).toEqual([]);
            expect(updated.method).toBe('');
        });

        it('should preserve omitted arrays', async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                {
                    categories: ['dinner'],
                    ingredients: ['Tomato', 'Garlic'],
                    steps: ['Chop', 'Fry'],
                },
                mockOwner
            );

            const updated = await DraftService.saveSharedDraft(
                'draft-1',
                { description: 'Only this field changed' },
                mockOwner
            );

            expect(updated.categories).toEqual(['dinner']);
            expect(updated.ingredients).toEqual(['Tomato', 'Garlic']);
            expect(updated.steps).toEqual(['Chop', 'Fry']);
        });

        it('should preserve existing step fields when co-cook updates a different step', async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Original Title',
                    ingredients: ['Tomato', 'Garlic'],
                    steps: ['Chop', 'Fry'],
                    coCooksIds: [mockCoCook.id],
                },
                mockOwner
            );

            // Co-cook updates only description and steps, sending empty/omitted ingredients
            const updated = await DraftService.saveSharedDraft(
                'draft-1',
                {
                    description: 'New Description',
                    steps: ['Chop finely', 'Fry gently'],
                },
                mockCoCook
            );

            expect(updated.description).toBe('New Description');
            expect(updated.steps).toEqual(['Chop finely', 'Fry gently']);
            // Preserves ingredients previously saved by owner
            expect(updated.ingredients).toEqual(['Tomato', 'Garlic']);
            expect(updated.title).toBe('Original Title');
        });

        it('should prevent non-owners from modifying or wiping the co-cooks roster (C3)', async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Paella Draft',
                    coCooksIds: [mockCoCook.id, 'another-chef'],
                },
                mockOwner
            );

            // Co-cook attempts to wipe coCooksIds or remove another participant
            const updated = await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Paella Edit by CoCook',
                    coCooksIds: [],
                } as any,
                mockCoCook
            );

            // Co-cooks cannot alter the roster
            expect(updated.coCooksIds).toEqual([mockCoCook.id, 'another-chef']);
        });

        it('should preserve existing co-cooks when owner updates a step other than RELATED_CONTENT with empty array (C3)', async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Paella Draft',
                    coCooksIds: [mockCoCook.id],
                    currentStep: 0, // Category step
                },
                mockOwner
            );

            // Owner saves Step 0 or 1 with an empty coCooksIds from non-related step form state
            const updated = await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Paella Draft Updated',
                    coCooksIds: [],
                    currentStep: 1, // Description step
                } as any,
                mockOwner
            );

            // Co-cooks are preserved!
            expect(updated.coCooksIds).toEqual([mockCoCook.id]);
        });

        it('should not allow client payloads to overwrite inviteToken in saveSharedDraft (C1)', async () => {
            const initial = await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Paella',
                    inviteToken: 'original-token-123',
                } as any,
                mockOwner
            );
            expect(initial.inviteToken).toBe('original-token-123');

            // Malicious or accidental update attempt with a forged token
            const updated = await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Paella Renamed',
                    inviteToken: 'hacked-token-999',
                } as any,
                mockOwner
            );

            // Preserves original token
            expect(updated.inviteToken).toBe('original-token-123');
        });

        it('should sanitize single-user draft payloads to prevent arbitrary field pollution (C2)', async () => {
            const slotId = await DraftService.saveSingleUserDraft('owner-1', {
                title: 'Solo Tapas',
                ingredients: ['Ham', 'Bread'],
                ['__proto__' as any]: { polluted: true },
                ['arbitraryField' as any]: 'malicious-data',
            } as any);

            const fetched: any = await DraftService.getSingleUserDraft(
                'owner-1',
                slotId
            );
            expect(fetched).toBeDefined();
            expect(fetched.title).toBe('Solo Tapas');
            expect(fetched.arbitraryField).toBeUndefined();
            expect(fetched.polluted).toBeUndefined();
        });
    });

    describe('getSharedDraft & token masking', () => {
        beforeEach(async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Secret Paella',
                    inviteToken: 'confidential-token-999',
                    coCooksIds: [mockCoCook.id],
                },
                mockOwner
            );
        });

        it('should return inviteToken when requester is the owner', async () => {
            const draft = await DraftService.getSharedDraft(
                'draft-1',
                mockOwner.id
            );
            expect(draft).not.toBeNull();
            expect(draft?.inviteToken).toBe('confidential-token-999');
        });

        it('should mask inviteToken when requester is a co-cook', async () => {
            const draft = await DraftService.getSharedDraft(
                'draft-1',
                mockCoCook.id
            );
            expect(draft).not.toBeNull();
            expect(draft?.inviteToken).toBeUndefined();
            expect(draft?.title).toBe('Secret Paella');
        });

        it('should return null when requester is unauthorized', async () => {
            const draft = await DraftService.getSharedDraft(
                'draft-1',
                mockStranger.id
            );
            expect(draft).toBeNull();
        });
    });

    describe('joinSharedDraft', () => {
        beforeEach(async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Open Kitchen',
                    inviteToken: 'join-token-123',
                    coCooksIds: [],
                },
                mockOwner
            );
        });

        it('should successfully join user when token matches', async () => {
            const result = await DraftService.joinSharedDraft(
                'draft-1',
                'join-token-123',
                mockCoCook
            );

            expect(result.success).toBe(true);
            expect(result.draft?.coCooksIds).toContain(mockCoCook.id);

            const userDrafts = await DraftService.getUserDraftIds(
                mockCoCook.id
            );
            expect(userDrafts).toContain('draft-1');
        });

        it('should reject join when token is invalid', async () => {
            const result = await DraftService.joinSharedDraft(
                'draft-1',
                'wrong-token',
                mockCoCook
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('invalid_invite_token');
        });

        it('should reject join when max co-cooks limit is reached', async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                {
                    inviteToken: 'join-token-123',
                    coCooksIds: ['c1', 'c2', 'c3', 'c4'],
                },
                mockOwner
            );

            const result = await DraftService.joinSharedDraft(
                'draft-1',
                'join-token-123',
                mockCoCook
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('co_cook_limit_reached');
        });

        it('should handle concurrent join requests without race conditions or losing participants', async () => {
            const user2: SafeUser = {
                id: 'cocook-2',
                name: 'Chef CoCook 2',
                email: 'cocook2@test.com',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
            };
            const user3: SafeUser = {
                id: 'cocook-3',
                name: 'Chef CoCook 3',
                email: 'cocook3@test.com',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
            };

            const results = await Promise.all([
                DraftService.joinSharedDraft(
                    'draft-1',
                    'join-token-123',
                    mockCoCook
                ),
                DraftService.joinSharedDraft(
                    'draft-1',
                    'join-token-123',
                    user2
                ),
                DraftService.joinSharedDraft(
                    'draft-1',
                    'join-token-123',
                    user3
                ),
            ]);

            expect(results.every((r) => r.success)).toBe(true);

            const draft = await DraftService.getSharedDraft('draft-1');
            expect(draft?.coCooksIds).toContain(mockCoCook.id);
            expect(draft?.coCooksIds).toContain(user2.id);
            expect(draft?.coCooksIds).toContain(user3.id);
            expect(draft?.coCooksIds?.length).toBe(3);
        });
    });

    describe('deleteSharedDraft & cleanup on publish', () => {
        beforeEach(async () => {
            await DraftService.saveSharedDraft(
                'draft-1',
                {
                    title: 'Draft to delete',
                    coCooksIds: [mockCoCook.id],
                },
                mockOwner
            );
        });

        it('should allow owner to delete draft and clean up locks and user lists', async () => {
            await DraftService.deleteSharedDraft('draft-1', mockOwner);

            const draft = await DraftService.getSharedDraft('draft-1');
            expect(draft).toBeNull();
            expect(releaseAllLocks).toHaveBeenCalledWith('draft-1');

            const ownerDrafts = await DraftService.getUserDraftIds(
                mockOwner.id
            );
            const coCookDrafts = await DraftService.getUserDraftIds(
                mockCoCook.id
            );
            expect(ownerDrafts).not.toContain('draft-1');
            expect(coCookDrafts).not.toContain('draft-1');
        });

        it('should reject deletion by non-owner', async () => {
            await expect(
                DraftService.deleteSharedDraft('draft-1', mockCoCook)
            ).rejects.toThrow('ONLY_OWNER_CAN_DELETE');
        });

        it('should clean up draft and participant lists on publish', async () => {
            await DraftService.cleanUpDraftOnPublish('draft-1');

            const draft = await DraftService.getSharedDraft('draft-1');
            expect(draft).toBeNull();
            expect(releaseAllLocks).toHaveBeenCalledWith('draft-1');
        });
    });

    describe('Single-user draft helpers', () => {
        it('should save, retrieve and delete single user drafts', async () => {
            await DraftService.saveSingleUserDraft('user-1', {
                title: 'My Private Recipe',
            });
            const draft = await DraftService.getSingleUserDraft('user-1');
            expect(draft?.title).toBe('My Private Recipe');

            const deleted = await DraftService.deleteSingleUserDraft('user-1');
            expect(deleted).toBe(true);
            const afterDelete = await DraftService.getSingleUserDraft('user-1');
            expect(afterDelete).toBeNull();
        });
    });
});
