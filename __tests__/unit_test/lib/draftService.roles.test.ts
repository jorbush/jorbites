import { DraftService } from '@/app/services/draftService';
import { SafeUser } from '@/app/types';

const store: Record<string, any> = {};
const sets: Record<string, Set<string>> = {};

jest.mock('@/app/lib/redis', () => ({
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
    },
}));

jest.mock('@/app/lib/redisLock', () => ({
    releaseAllLocks: jest.fn(async () => 1),
}));

import { releaseAllLocks } from '@/app/lib/redisLock';

describe('DraftService - Roles, Invites & Collaboration (D-08, D-10)', () => {
    const ownerUser: SafeUser = {
        id: 'owner-1',
        name: 'Head Chef',
        email: 'owner@example.com',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
    };

    const coCook1: SafeUser = {
        id: 'cook-1',
        name: 'Sous Chef Maria',
        email: 'maria@example.com',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
    };

    const coCook2: SafeUser = {
        id: 'cook-2',
        name: 'Pastry Chef Leo',
        email: 'leo@example.com',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
    };

    const outsiderUser: SafeUser = {
        id: 'outsider-99',
        name: 'Random User',
        email: 'outsider@example.com',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        Object.keys(store).forEach((k) => delete store[k]);
        Object.keys(sets).forEach((k) => delete sets[k]);
    });

    const createSharedDraftFixture = async (
        draftId: string = 'draft-roles-1'
    ) => {
        const draft = {
            draftId,
            ownerId: ownerUser.id,
            ownerName: ownerUser.name,
            inviteToken: 'initial-secret-token',
            coCooksIds: [coCook1.id, coCook2.id],
            coCookRoles: {
                [coCook1.id]: 'editor',
                [coCook2.id]: 'editor',
            },
            title: 'Truffle Risotto Collab',
            updatedAt: new Date().toISOString(),
        };
        store[`draft:shared:${draftId}`] = JSON.stringify(draft);
        sets[`user:drafts:${ownerUser.id}`] = new Set([draftId]);
        sets[`user:drafts:${coCook1.id}`] = new Set([draftId]);
        sets[`user:drafts:${coCook2.id}`] = new Set([draftId]);
        return draft;
    };

    describe('updateCoCookRole', () => {
        it('allows owner to update co-cook role to viewer and releases their locks', async () => {
            await createSharedDraftFixture('draft-roles-1');

            const updated = await DraftService.updateCoCookRole(
                'draft-roles-1',
                coCook1.id,
                'viewer',
                ownerUser
            );

            expect(updated.coCookRoles?.[coCook1.id]).toBe('viewer');
            expect(releaseAllLocks).toHaveBeenCalledWith('draft-roles-1');

            const savedRaw = store['draft:shared:draft-roles-1'];
            const saved = JSON.parse(savedRaw);
            expect(saved.coCookRoles[coCook1.id]).toBe('viewer');
        });

        it('rejects role update if caller is not the owner', async () => {
            await createSharedDraftFixture('draft-roles-1');

            await expect(
                DraftService.updateCoCookRole(
                    'draft-roles-1',
                    coCook2.id,
                    'viewer',
                    coCook1
                )
            ).rejects.toThrow('ONLY_OWNER_CAN_MANAGE_ROLES');
        });

        it('rejects updating role of the owner', async () => {
            await createSharedDraftFixture('draft-roles-1');

            await expect(
                DraftService.updateCoCookRole(
                    'draft-roles-1',
                    ownerUser.id,
                    'viewer',
                    ownerUser
                )
            ).rejects.toThrow('CANNOT_CHANGE_OWNER_ROLE');
        });

        it('rejects if target user is not a co-cook', async () => {
            await createSharedDraftFixture('draft-roles-1');

            await expect(
                DraftService.updateCoCookRole(
                    'draft-roles-1',
                    outsiderUser.id,
                    'viewer',
                    ownerUser
                )
            ).rejects.toThrow('USER_NOT_A_CO_COOK');
        });
    });

    describe('removeCollaborator', () => {
        it('allows owner to remove a co-cook from draft and cleans up user drafts set and locks', async () => {
            await createSharedDraftFixture('draft-roles-2');

            const updated = await DraftService.removeCollaborator(
                'draft-roles-2',
                coCook1.id,
                ownerUser
            );

            expect(updated.coCooksIds).not.toContain(coCook1.id);
            expect(updated.coCookRoles?.[coCook1.id]).toBeUndefined();
            expect(releaseAllLocks).toHaveBeenCalledWith('draft-roles-2');
            expect(sets[`user:drafts:${coCook1.id}`].has('draft-roles-2')).toBe(
                false
            );
        });

        it('allows co-cook to remove themselves (leave draft)', async () => {
            await createSharedDraftFixture('draft-roles-2');

            const updated = await DraftService.removeCollaborator(
                'draft-roles-2',
                coCook2.id,
                coCook2
            );

            expect(updated.coCooksIds).not.toContain(coCook2.id);
            expect(sets[`user:drafts:${coCook2.id}`].has('draft-roles-2')).toBe(
                false
            );
        });

        it('rejects non-owner outsider trying to remove a co-cook', async () => {
            await createSharedDraftFixture('draft-roles-2');

            await expect(
                DraftService.removeCollaborator(
                    'draft-roles-2',
                    coCook1.id,
                    outsiderUser
                )
            ).rejects.toThrow('UNAUTHORIZED_COLLABORATOR_REMOVAL');
        });

        it('rejects removing the owner', async () => {
            await createSharedDraftFixture('draft-roles-2');

            await expect(
                DraftService.removeCollaborator(
                    'draft-roles-2',
                    ownerUser.id,
                    ownerUser
                )
            ).rejects.toThrow('CANNOT_REMOVE_OWNER');
        });
    });

    describe('regenerateInviteToken', () => {
        it('allows owner to generate a new invite token and returns new shareUrl', async () => {
            await createSharedDraftFixture('draft-roles-3');

            const result = await DraftService.regenerateInviteToken(
                'draft-roles-3',
                ownerUser,
                'https://jorbites.app'
            );

            expect(result.inviteToken).toBeTruthy();
            expect(result.inviteToken).not.toBe('initial-secret-token');
            expect(result.shareUrl).toBe(
                `https://jorbites.app/recipes/new?draft=draft-roles-3&token=${result.inviteToken}`
            );

            const saved = JSON.parse(store['draft:shared:draft-roles-3']);
            expect(saved.inviteToken).toBe(result.inviteToken);
        });

        it('rejects token regeneration if caller is not the owner', async () => {
            await createSharedDraftFixture('draft-roles-3');

            await expect(
                DraftService.regenerateInviteToken('draft-roles-3', coCook1)
            ).rejects.toThrow('ONLY_OWNER_CAN_REGENERATE_TOKEN');
        });
    });

    describe('saveSharedDraft viewer restriction', () => {
        it('throws VIEWER_CANNOT_EDIT when a viewer tries to save the draft', async () => {
            await createSharedDraftFixture('draft-roles-4');

            // Set cook-1 to viewer
            await DraftService.updateCoCookRole(
                'draft-roles-4',
                coCook1.id,
                'viewer',
                ownerUser
            );

            await expect(
                DraftService.saveSharedDraft(
                    'draft-roles-4',
                    { title: 'Hacked title by viewer' },
                    coCook1
                )
            ).rejects.toThrow('VIEWER_CANNOT_EDIT');
        });

        it('allows editor co-cook to save the draft and records lastModifiedBy', async () => {
            await createSharedDraftFixture('draft-roles-4');

            const saved = await DraftService.saveSharedDraft(
                'draft-roles-4',
                { title: 'Updated title by editor' },
                coCook2
            );

            expect(saved.title).toBe('Updated title by editor');
            expect(saved.lastModifiedBy).toEqual({
                id: coCook2.id,
                name: coCook2.name,
            });
        });
    });
});
