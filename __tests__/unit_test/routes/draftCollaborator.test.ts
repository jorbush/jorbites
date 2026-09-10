import {
    DELETE as DraftCollaboratorDELETE,
    POST as DraftCollaboratorPOST,
} from '@/app/api/draft/collaborator/route';
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

const mockOutsider = {
    id: 'outsider-id',
    name: 'Outsider User',
    email: 'outsider@test.com',
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

describe('DELETE /api/draft/collaborator', () => {
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
                if (args.where.email === mockOwner.email)
                    return Promise.resolve(mockOwner);
                if (args.where.email === mockCoCook.email)
                    return Promise.resolve(mockCoCook);
                if (args.where.email === mockOutsider.email)
                    return Promise.resolve(mockOutsider);
                return Promise.resolve(null);
            }
        );
    });

    it('returns 401 when unauthenticated', async () => {
        mockedSession = null;
        const req = new Request(
            'http://localhost:3000/api/draft/collaborator?draftId=d-1&userId=c-1',
            { method: 'DELETE' }
        );
        const res = await DraftCollaboratorDELETE(req);
        expect(res.status).toBe(401);
    });

    it('returns 400 when parameters are missing', async () => {
        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'DELETE',
            }
        );
        const res = await DraftCollaboratorDELETE(req);
        expect(res.status).toBe(400);
    });

    it('returns 403 when an outsider attempts to remove a collaborator', async () => {
        mockedSession = {
            user: { email: mockOutsider.email, name: mockOutsider.name },
            expires: '2099-01-01',
        };
        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: [mockCoCook.id],
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);

        const req = new Request(
            `http://localhost:3000/api/draft/collaborator?draftId=d-1&userId=${mockCoCook.id}`,
            { method: 'DELETE' }
        );
        const res = await DraftCollaboratorDELETE(req);
        expect(res.status).toBe(403);
    });

    it('returns 200 when owner removes a collaborator', async () => {
        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: [mockCoCook.id],
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);
        redisSets[`user:drafts:${mockCoCook.id}`] = new Set(['d-1']);

        const req = new Request(
            `http://localhost:3000/api/draft/collaborator?draftId=d-1&userId=${mockCoCook.id}`,
            { method: 'DELETE' }
        );
        const res = await DraftCollaboratorDELETE(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.draft.coCooksIds).not.toContain(mockCoCook.id);
    });

    it('returns 200 when collaborator leaves draft on their own', async () => {
        mockedSession = {
            user: { email: mockCoCook.email, name: mockCoCook.name },
            expires: '2099-01-01',
        };
        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: [mockCoCook.id],
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);
        redisSets[`user:drafts:${mockCoCook.id}`] = new Set(['d-1']);

        const req = new Request(
            `http://localhost:3000/api/draft/collaborator?draftId=d-1&userId=${mockCoCook.id}`,
            { method: 'DELETE' }
        );
        const res = await DraftCollaboratorDELETE(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.draft.coCooksIds).not.toContain(mockCoCook.id);
    });
});

describe('POST /api/draft/collaborator', () => {
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
                if (args.where.email === mockOwner.email)
                    return Promise.resolve(mockOwner);
                if (args.where.email === mockCoCook.email)
                    return Promise.resolve(mockCoCook);
                if (args.where.email === mockOutsider.email)
                    return Promise.resolve(mockOutsider);
                return Promise.resolve(null);
            }
        );
    });

    it('returns 401 when unauthenticated', async () => {
        mockedSession = null;
        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'POST',
                body: JSON.stringify({
                    draftId: 'd-1',
                    userId: mockOutsider.id,
                }),
            }
        );
        const res = await DraftCollaboratorPOST(req);
        expect(res.status).toBe(401);
    });

    it('returns 400 when parameters are missing', async () => {
        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'POST',
                body: JSON.stringify({ draftId: 'd-1' }),
            }
        );
        const res = await DraftCollaboratorPOST(req);
        expect(res.status).toBe(400);
    });

    it('returns 404 when draft does not exist', async () => {
        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'POST',
                body: JSON.stringify({
                    draftId: 'non-existent',
                    userId: mockOutsider.id,
                }),
            }
        );
        const res = await DraftCollaboratorPOST(req);
        expect(res.status).toBe(404);
    });

    it('returns 403 when non-owner attempts to add a collaborator', async () => {
        mockedSession = {
            user: { email: mockOutsider.email, name: mockOutsider.name },
            expires: '2099-01-01',
        };
        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: [mockCoCook.id],
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);

        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'POST',
                body: JSON.stringify({ draftId: 'd-1', userId: 'new-user' }),
            }
        );
        const res = await DraftCollaboratorPOST(req);
        expect(res.status).toBe(403);
    });

    it('returns 400 when attempting to add the owner as co-cook', async () => {
        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: [],
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);

        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'POST',
                body: JSON.stringify({ draftId: 'd-1', userId: mockOwner.id }),
            }
        );
        const res = await DraftCollaboratorPOST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('The draft owner cannot be added as a co-cook');
    });

    it('returns 400 when collaborator already exists', async () => {
        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: [mockCoCook.id],
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);

        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'POST',
                body: JSON.stringify({ draftId: 'd-1', userId: mockCoCook.id }),
            }
        );
        const res = await DraftCollaboratorPOST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe(
            'This user is already a collaborator on this draft'
        );
    });

    it('returns 400 when co-cook limit of 4 is reached', async () => {
        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: ['c1', 'c2', 'c3', 'c4'],
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);

        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'POST',
                body: JSON.stringify({
                    draftId: 'd-1',
                    userId: mockOutsider.id,
                }),
            }
        );
        const res = await DraftCollaboratorPOST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('Maximum co-cook limit reached');
    });

    it('returns 200 when owner successfully adds a collaborator', async () => {
        const draft = {
            draftId: 'd-1',
            ownerId: mockOwner.id,
            coCooksIds: [mockCoCook.id],
            coCookRoles: { [mockCoCook.id]: 'editor' },
        };
        redisStore['draft:shared:d-1'] = JSON.stringify(draft);

        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'POST',
                body: JSON.stringify({
                    draftId: 'd-1',
                    userId: mockOutsider.id,
                    role: 'viewer',
                }),
            }
        );
        const res = await DraftCollaboratorPOST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.draft.coCooksIds).toContain(mockOutsider.id);
        expect(data.draft.coCookRoles[mockOutsider.id]).toBe('viewer');
        expect(redisSets[`user:drafts:${mockOutsider.id}`].has('d-1')).toBe(
            true
        );
    });

    it('promotes a solo draft to a shared draft when adding a collaborator directly via search', async () => {
        const soloDraft = {
            draftId: 'solo-slot-1',
            ownerId: mockOwner.id,
            title: 'My Solo Pasta',
            type: 'solo',
            currentStep: 1,
        };
        redisStore[`draft:user:${mockOwner.id}:solo-slot-1`] =
            JSON.stringify(soloDraft);
        redisSets[`user:drafts:${mockOwner.id}`] = new Set(['solo-slot-1']);

        const req = new Request(
            'http://localhost:3000/api/draft/collaborator',
            {
                method: 'POST',
                body: JSON.stringify({
                    draftId: 'solo-slot-1',
                    userId: mockCoCook.id,
                    role: 'editor',
                }),
            }
        );
        const res = await DraftCollaboratorPOST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.draft.draftId).toBe('solo-slot-1');
        expect(data.draft.coCooksIds).toContain(mockCoCook.id);
        expect(data.draft.title).toBe('My Solo Pasta');
        expect(data.draft.currentStep).toBe(1);
    });
});
