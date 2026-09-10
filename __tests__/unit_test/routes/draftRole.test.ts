import { expect } from '@jest/globals';
import { PATCH as DraftRolePATCH } from '@/app/api/draft/role/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

const mockOwner = {
    id: 'owner-id',
    name: 'Owner Chef',
    email: 'owner@test.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

const mockCoCook = {
    id: 'co-cook-id',
    name: 'Co-Cook Maria',
    email: 'maria@test.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';

const redisStore: Record<string, string> = {};
const redisSets: Record<string, Set<string>> = {};

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
        sadd: jest.fn(async (key: string, ...members: string[]) => {
            if (!redisSets[key]) redisSets[key] = new Set();
            members.forEach((m) => redisSets[key].add(m));
            return members.length;
        }),
        srem: jest.fn(async (key: string, ...members: string[]) => {
            if (!redisSets[key]) return 0;
            let rem = 0;
            members.forEach((m) => {
                if (redisSets[key].delete(m)) rem++;
            });
            return rem;
        }),
        smembers: jest.fn(async (key: string) => {
            if (!redisSets[key]) return [];
            return Array.from(redisSets[key]);
        }),
        expire: jest.fn(async () => 1),
    },
}));

jest.mock('@/app/lib/redisLock', () => ({
    releaseAllLocks: jest.fn(async () => 1),
}));

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => Promise.resolve(mockedSession)),
}));

describe('PATCH /api/draft/role', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.keys(redisStore).forEach((k) => delete redisStore[k]);
        Object.keys(redisSets).forEach((k) => delete redisSets[k]);
        mockedSession = {
            user: { email: mockOwner.email, name: mockOwner.name },
            expires: '2099-01-01',
        };
        (prisma.user.findUnique as jest.Mock).mockImplementation(
            (args: any) => {
                if (args.where.email === mockOwner.email) {
                    return Promise.resolve(mockOwner);
                }
                if (args.where.email === mockCoCook.email) {
                    return Promise.resolve(mockCoCook);
                }
                return Promise.resolve(null);
            }
        );
    });

    it('returns 401 when user is not authenticated', async () => {
        mockedSession = null;
        const req = new Request('http://localhost:3000/api/draft/role', {
            method: 'PATCH',
            body: JSON.stringify({
                draftId: 'd-1',
                userId: mockCoCook.id,
                role: 'viewer',
            }),
        });
        const res = await DraftRolePATCH(req);
        expect(res.status).toBe(401);
    });

    it('returns 400 when required fields are missing', async () => {
        const req = new Request('http://localhost:3000/api/draft/role', {
            method: 'PATCH',
            body: JSON.stringify({ draftId: 'd-1' }),
        });
        const res = await DraftRolePATCH(req);
        expect(res.status).toBe(400);
    });

    it('returns 400 when role is invalid', async () => {
        const req = new Request('http://localhost:3000/api/draft/role', {
            method: 'PATCH',
            body: JSON.stringify({
                draftId: 'd-1',
                userId: mockCoCook.id,
                role: 'admin',
            }),
        });
        const res = await DraftRolePATCH(req);
        expect(res.status).toBe(400);
    });

    it('returns 403 when caller is not the draft owner', async () => {
        mockedSession = {
            user: { email: mockCoCook.email, name: mockCoCook.name },
            expires: '2099-01-01',
        };

        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: [mockCoCook.id],
            coCookRoles: { [mockCoCook.id]: 'editor' },
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);

        const req = new Request('http://localhost:3000/api/draft/role', {
            method: 'PATCH',
            body: JSON.stringify({
                draftId: 'd-1',
                userId: mockCoCook.id,
                role: 'viewer',
            }),
        });
        const res = await DraftRolePATCH(req);
        expect(res.status).toBe(403);
    });

    it('returns 200 and updates role when owner toggles to viewer', async () => {
        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: [mockCoCook.id],
            coCookRoles: { [mockCoCook.id]: 'editor' },
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);

        const req = new Request('http://localhost:3000/api/draft/role', {
            method: 'PATCH',
            body: JSON.stringify({
                draftId: 'd-1',
                userId: mockCoCook.id,
                role: 'viewer',
            }),
        });
        const res = await DraftRolePATCH(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.draft.coCookRoles[mockCoCook.id]).toBe('viewer');
    });
});
