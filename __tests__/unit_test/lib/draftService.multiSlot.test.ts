import { DraftService } from '@/app/services/draftService';
import { redis } from '@/app/lib/redis';
import { SafeUser } from '@/app/types';
import {
    MAX_SOLO_DRAFT_SLOTS,
    SOLO_DRAFT_TTL_SECONDS,
} from '@/app/utils/constants';

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
            _store: store,
            _sets: sets,
        },
    };
});

jest.mock('@/app/lib/redisLock', () => ({
    releaseAllLocks: jest.fn().mockResolvedValue(undefined),
}));

const mockUser: SafeUser = {
    id: 'user-multi-1',
    name: 'Chef Multi',
    email: 'multi@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('DraftService Multi-Slot Solo Drafts', () => {
    beforeEach(() => {
        const store = (redis as any)._store;
        const sets = (redis as any)._sets;
        for (const k of Object.keys(store)) delete store[k];
        for (const k of Object.keys(sets)) delete sets[k];
        jest.clearAllMocks();
    });

    describe('saveSingleUserDraft with multi-slot', () => {
        it('saves solo draft with generated slotId and registers in user:drafts set', async () => {
            const slotId = await DraftService.saveSingleUserDraft(
                'user-multi-1',
                {
                    title: 'Slot 1 Recipe',
                    categories: ['quick'],
                }
            );

            expect(typeof slotId).toBe('string');
            expect(slotId.length).toBeGreaterThan(0);

            const store = (redis as any)._store;
            expect(store[`draft:user:user-multi-1:${slotId}`]).toBeDefined();
            const saved = JSON.parse(
                store[`draft:user:user-multi-1:${slotId}`]
            );
            expect(saved.title).toBe('Slot 1 Recipe');
            expect(saved.draftId).toBe(slotId);

            expect(redis.set).toHaveBeenCalledWith(
                `draft:user:user-multi-1:${slotId}`,
                expect.any(String),
                'EX',
                SOLO_DRAFT_TTL_SECONDS
            );
            expect(redis.set).toHaveBeenCalledWith(
                'draft:user:user-multi-1',
                expect.any(String),
                'EX',
                SOLO_DRAFT_TTL_SECONDS
            );
            expect(redis.set).toHaveBeenCalledWith(
                'user-multi-1',
                expect.any(String),
                'EX',
                SOLO_DRAFT_TTL_SECONDS
            );

            const draftIds = await DraftService.getUserDraftIds('user-multi-1');
            expect(draftIds).toContain(slotId);
        });

        it('saves solo draft with explicit slotId', async () => {
            const explicitId = 'custom-slot-id';
            const returnedId = await DraftService.saveSingleUserDraft(
                'user-multi-1',
                { title: 'Explicit Slot' },
                explicitId
            );

            expect(returnedId).toBe(explicitId);
            const store = (redis as any)._store;
            expect(
                store[`draft:user:user-multi-1:${explicitId}`]
            ).toBeDefined();
        });

        it('enforces maximum solo draft slots cap (5)', async () => {
            // Fill 5 slots
            for (let i = 0; i < MAX_SOLO_DRAFT_SLOTS; i++) {
                await DraftService.saveSingleUserDraft('user-multi-1', {
                    title: `Draft ${i + 1}`,
                });
            }

            const draftIds = await DraftService.getUserDraftIds('user-multi-1');
            expect(draftIds.length).toBe(5);

            // Attempt to create 6th slot should throw
            await expect(
                DraftService.saveSingleUserDraft('user-multi-1', {
                    title: 'Draft 6 Overflow',
                })
            ).rejects.toThrow('MAX_SOLO_DRAFTS_REACHED');
        });
    });

    describe('getSingleUserDraft with multi-slot and legacy fallback', () => {
        it('retrieves solo draft by slotId', async () => {
            const slotId = 'slot-abc';
            const store = (redis as any)._store;
            store[`draft:user:user-multi-1:${slotId}`] = JSON.stringify({
                title: 'Retrieved Draft',
                draftId: slotId,
            });

            const draft = await DraftService.getSingleUserDraft(
                'user-multi-1',
                slotId
            );
            expect(draft).not.toBeNull();
            expect(draft?.title).toBe('Retrieved Draft');
        });

        it('loads the most recently updated draft by default when slotId is omitted and multi-slot drafts exist', async () => {
            await DraftService.saveSingleUserDraft('user-multi-1', {
                title: 'Older Draft',
                updatedAt: '2026-08-10T10:00:00.000Z',
            });

            const slotNewer = await DraftService.saveSingleUserDraft(
                'user-multi-1',
                {
                    title: 'Newer Draft',
                    updatedAt: '2026-08-20T10:00:00.000Z',
                }
            );

            const draft = await DraftService.getSingleUserDraft('user-multi-1');
            expect(draft).not.toBeNull();
            expect(draft?.title).toBe('Newer Draft');
            expect(draft?.draftId).toBe(slotNewer);
        });

        it('falls back to legacy draft:user:{userId} when slotId is omitted and no indexed drafts exist', async () => {
            const store = (redis as any)._store;
            store['draft:user:user-multi-1'] = JSON.stringify({
                title: 'Legacy Draft',
            });

            const draft = await DraftService.getSingleUserDraft('user-multi-1');
            expect(draft).not.toBeNull();
            expect(draft?.title).toBe('Legacy Draft');
        });
    });

    describe('deleteSingleUserDraft with multi-slot', () => {
        it('deletes slot draft and removes it from user:drafts set', async () => {
            const slotId = await DraftService.saveSingleUserDraft(
                'user-multi-1',
                {
                    title: 'To Delete',
                }
            );

            let draftIds = await DraftService.getUserDraftIds('user-multi-1');
            expect(draftIds).toContain(slotId);

            const deleted = await DraftService.deleteSingleUserDraft(
                'user-multi-1',
                slotId
            );
            expect(deleted).toBe(true);

            draftIds = await DraftService.getUserDraftIds('user-multi-1');
            expect(draftIds).not.toContain(slotId);

            const store = (redis as any)._store;
            expect(store[`draft:user:user-multi-1:${slotId}`]).toBeUndefined();
        });

        it('deleteSharedDraft deletes both shared key and any matching solo slot key', async () => {
            const draftId = 'shared-and-solo-id';
            const store = (redis as any)._store;
            store[`draft:shared:${draftId}`] = JSON.stringify({
                draftId,
                ownerId: 'user-multi-1',
                title: 'Dual Key Draft',
            });
            store[`draft:user:user-multi-1:${draftId}`] = JSON.stringify({
                draftId,
                title: 'Solo Copy',
            });
            await DraftService.addToUserDrafts('user-multi-1', draftId);

            const deleted = await DraftService.deleteSharedDraft(
                draftId,
                mockUser
            );
            expect(deleted).toBe(true);
            expect(store[`draft:shared:${draftId}`]).toBeUndefined();
            expect(store[`draft:user:user-multi-1:${draftId}`]).toBeUndefined();
            const draftIds = await DraftService.getUserDraftIds('user-multi-1');
            expect(draftIds).not.toContain(draftId);
        });
    });

    describe('getAllUserDrafts', () => {
        it('returns combined list of solo and shared drafts with type discriminator', async () => {
            // 1. Create a solo draft
            const soloId = await DraftService.saveSingleUserDraft(
                'user-multi-1',
                {
                    title: 'Solo Pasta',
                    updatedAt: '2026-08-01T10:00:00.000Z',
                }
            );

            // 2. Create a shared draft
            await DraftService.saveSharedDraft(
                'shared-pizza',
                {
                    title: 'Shared Pizza',
                    updatedAt: '2026-08-02T12:00:00.000Z',
                },
                mockUser
            );

            const allDrafts =
                await DraftService.getAllUserDrafts('user-multi-1');

            expect(allDrafts.length).toBe(2);

            const sharedItem = allDrafts.find(
                (d) => d.draftId === 'shared-pizza'
            );
            expect(sharedItem).toBeDefined();
            expect(sharedItem.type).toBe('shared');
            expect(sharedItem.title).toBe('Shared Pizza');

            const soloItem = allDrafts.find((d) => d.draftId === soloId);
            expect(soloItem).toBeDefined();
            expect(soloItem.type).toBe('solo');
            expect(soloItem.title).toBe('Solo Pasta');

            // Sorted by updatedAt descending (Shared Pizza is newer)
            expect(allDrafts[0].draftId).toBe('shared-pizza');
            expect(allDrafts[1].draftId).toBe(soloId);
        });

        it('cleans up stale draft IDs that no longer exist in Redis', async () => {
            await DraftService.addToUserDrafts('user-multi-1', 'stale-id-1');
            await DraftService.addToUserDrafts('user-multi-1', 'stale-id-2');

            const allDrafts =
                await DraftService.getAllUserDrafts('user-multi-1');
            expect(allDrafts.length).toBe(0);

            // Stale IDs should be purged from set
            const remaining =
                await DraftService.getUserDraftIds('user-multi-1');
            expect(remaining.length).toBe(0);
        });
    });
});
