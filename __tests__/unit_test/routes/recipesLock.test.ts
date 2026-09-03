jest.unmock('@/app/lib/redisLock');

import { expect } from '@jest/globals';
import {
    POST as LockPOST,
    GET as LockGET,
    DELETE as LockDELETE,
} from '@/app/api/recipes/[id]/lock/route';
let currentUserMock: any = null;

const mockUser = {
    id: 'user-123',
    name: 'Test Cook',
    email: 'cook@example.com',
    image: 'https://avatar.com/u123.png',
};

jest.mock('@/app/actions/getCurrentUser', () =>
    jest.fn(async () => currentUserMock)
);

const redisStore: Record<string, string> = {};

jest.mock('@/app/lib/redis', () => ({
    redis: {
        get: jest.fn(async (key: string) => redisStore[key] || null),
        set: jest.fn(async (key: string, val: string) => {
            redisStore[key] = val;
            return 'OK';
        }),
        del: jest.fn(async (...keys: string[]) => {
            let count = 0;
            for (const k of keys) {
                if (redisStore[k]) {
                    delete redisStore[k];
                    count++;
                }
            }
            return count;
        }),
        mget: jest.fn(async (...keys: string[]) => {
            return keys.map((k) => redisStore[k] || null);
        }),
        scan: jest.fn(async () => ['0', []]),
    },
}));

const mockRecipe: Record<string, any> = {};
jest.mock('@/app/actions/getRecipeById', () =>
    jest.fn(async ({ recipeId }: { recipeId: string }) => {
        return mockRecipe[recipeId] || null;
    })
);

jest.mock('@/app/services/draftService', () => ({
    DraftService: {
        getSharedDraft: jest.fn(async (draftId: string) => {
            const raw = redisStore[`draft:shared:${draftId}`];
            return raw ? JSON.parse(raw) : null;
        }),
    },
}));

describe('Recipe / Draft Lock Route Handlers (/api/recipes/[id]/lock)', () => {
    beforeEach(() => {
        currentUserMock = { ...mockUser };
        for (const k of Object.keys(redisStore)) {
            delete redisStore[k];
        }
        for (const k of Object.keys(mockRecipe)) {
            delete mockRecipe[k];
        }
        jest.clearAllMocks();
    });

    describe('POST /api/recipes/[id]/lock', () => {
        it('should return 401 if user is not authenticated', async () => {
            currentUserMock = null;

            const req = {
                json: jest.fn().mockResolvedValue({ field: 'step:1' }),
            } as unknown as Request;
            const res = await LockPOST(req, {
                params: Promise.resolve({ id: 'target-1' }),
            });

            expect(res.status).toBe(401);
        });

        it('should return 400 if field is missing', async () => {
            const req = {
                json: jest.fn().mockResolvedValue({}),
            } as unknown as Request;
            const res = await LockPOST(req, {
                params: Promise.resolve({ id: 'target-1' }),
            });

            expect(res.status).toBe(400);
        });

        it('should return 404 if target is neither an existing recipe nor a shared draft (C3)', async () => {
            const req = {
                json: jest.fn().mockResolvedValue({ field: 'step:1' }),
            } as unknown as Request;
            const res = await LockPOST(req, {
                params: Promise.resolve({ id: 'nonexistent-target' }),
            });

            expect(res.status).toBe(404);
            const data = await res.json();
            expect(data.error).toBe('Target recipe or shared draft not found');
        });

        it('should return 403 if recipe exists but user is not owner and not co-cook', async () => {
            mockRecipe['recipe-456'] = {
                id: 'recipe-456',
                userId: 'other-user',
                coCooksIds: ['co-cook-x'],
            };

            const req = {
                json: jest.fn().mockResolvedValue({ field: 'step:1' }),
            } as unknown as Request;
            const res = await LockPOST(req, {
                params: Promise.resolve({ id: 'recipe-456' }),
            });

            expect(res.status).toBe(403);
        });

        it('should return 403 if shared draft exists but user is not owner and not co-cook', async () => {
            redisStore['draft:shared:draft-789'] = JSON.stringify({
                draftId: 'draft-789',
                ownerId: 'other-owner',
                coCooksIds: ['co-cook-x'],
            });

            const req = {
                json: jest.fn().mockResolvedValue({ field: 'step:1' }),
            } as unknown as Request;
            const res = await LockPOST(req, {
                params: Promise.resolve({ id: 'draft-789' }),
            });

            expect(res.status).toBe(403);
        });

        it('should successfully acquire lock if user is recipe owner', async () => {
            mockRecipe['recipe-owner'] = {
                id: 'recipe-owner',
                userId: 'user-123',
                coCooksIds: [],
            };

            const req = {
                json: jest.fn().mockResolvedValue({ field: 'step:1' }),
            } as unknown as Request;
            const res = await LockPOST(req, {
                params: Promise.resolve({ id: 'recipe-owner' }),
            });

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
            expect(data.lockedBy).toBe('user-123');
        });

        it('should successfully acquire lock if user is a co-cook in shared draft', async () => {
            redisStore['draft:shared:draft-team'] = JSON.stringify({
                draftId: 'draft-team',
                ownerId: 'other-owner',
                coCooksIds: ['user-123'],
            });

            const req = {
                json: jest.fn().mockResolvedValue({ field: 'step:2' }),
            } as unknown as Request;
            const res = await LockPOST(req, {
                params: Promise.resolve({ id: 'draft-team' }),
            });

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
            expect(data.lockedBy).toBe('user-123');
        });

        it('should fast-path renew lock if lock is already held by currentUser (H8)', async () => {
            redisStore['lock:recipe:draft-held:field:step:1'] = JSON.stringify({
                userId: 'user-123',
                userName: 'Test Cook',
                timestamp: Date.now(),
            });

            const req = {
                json: jest.fn().mockResolvedValue({ field: 'step:1' }),
            } as unknown as Request;
            const res = await LockPOST(req, {
                params: Promise.resolve({ id: 'draft-held' }),
            });

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
            expect(data.lockedBy).toBe('user-123');
        });
    });

    describe('GET /api/recipes/[id]/lock', () => {
        it('should return 401 if unauthenticated (C2)', async () => {
            currentUserMock = null;

            const req = new Request(
                'http://localhost:3000/api/recipes/recipe-1/lock'
            );
            const res = await LockGET(req, {
                params: Promise.resolve({ id: 'recipe-1' }),
            });

            expect(res.status).toBe(401);
        });

        it('should return 404 if target does not exist (C2 & C3)', async () => {
            const req = new Request(
                'http://localhost:3000/api/recipes/unknown/lock'
            );
            const res = await LockGET(req, {
                params: Promise.resolve({ id: 'unknown' }),
            });

            expect(res.status).toBe(404);
        });

        it('should return 403 if target exists but user is not owner or co-cook', async () => {
            mockRecipe['recipe-private'] = {
                id: 'recipe-private',
                userId: 'stranger-id',
                coCooksIds: [],
            };

            const req = new Request(
                'http://localhost:3000/api/recipes/recipe-private/lock'
            );
            const res = await LockGET(req, {
                params: Promise.resolve({ id: 'recipe-private' }),
            });

            expect(res.status).toBe(403);
        });

        it('should return active locks for authorized user', async () => {
            mockRecipe['recipe-my'] = {
                id: 'recipe-my',
                userId: 'user-123',
                coCooksIds: [],
            };

            const req = new Request(
                'http://localhost:3000/api/recipes/recipe-my/lock'
            );
            const res = await LockGET(req, {
                params: Promise.resolve({ id: 'recipe-my' }),
            });

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(typeof data).toBe('object');
        });
    });

    describe('DELETE /api/recipes/[id]/lock', () => {
        it('should return 401 if unauthenticated', async () => {
            currentUserMock = null;

            const req = new Request(
                'http://localhost:3000/api/recipes/rec-1/lock?field=step:1'
            );
            const res = await LockDELETE(req, {
                params: Promise.resolve({ id: 'rec-1' }),
            });

            expect(res.status).toBe(401);
        });

        it('should release lock held by user', async () => {
            redisStore['lock:recipe:rec-1:field:step:1'] = JSON.stringify({
                userId: 'user-123',
                timestamp: Date.now(),
            });

            const req = new Request(
                'http://localhost:3000/api/recipes/rec-1/lock?field=step:1'
            );
            const res = await LockDELETE(req, {
                params: Promise.resolve({ id: 'rec-1' }),
            });

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
        });
    });
});
