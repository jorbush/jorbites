import { expect } from '@jest/globals';
import { GET as DraftJoinGET } from '@/app/api/draft/join/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

const mockUser = {
    id: 'user-b-id',
    name: 'User B',
    email: 'userb@test.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';

const store: Record<string, string> = {};
const sets: Record<string, Set<string>> = {};

jest.mock('@/app/lib/redis', () => ({
    redis: {
        get: jest.fn(async (key: string) => store[key] || null),
        set: jest.fn(async (key: string, val: string) => {
            store[key] = val;
            return 'OK';
        }),
        del: jest.fn(async (...keys: string[]) => {
            let count = 0;
            for (const k of keys) {
                if (store[k]) {
                    delete store[k];
                    count++;
                }
                if (sets[k]) {
                    delete sets[k];
                    count++;
                }
            }
            return count;
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
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    },
}));

jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => Promise.resolve(mockedSession)),
}));

describe('Draft Join API (/api/draft/join)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        for (const key of Object.keys(store)) {
            delete store[key];
        }
        for (const key of Object.keys(sets)) {
            delete sets[key];
        }
    });

    it('should redirect to login if user is unauthenticated', async () => {
        mockedSession = null;
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const req = new Request(
            'http://localhost:3000/api/draft/join?draft=draft-1&token=token-1'
        );
        const res = await DraftJoinGET(req);

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain('/login');
    });

    it('should redirect with error if draft is not found in Redis', async () => {
        mockedSession = {
            expires: 'expires',
            user: { name: 'User B', email: 'userb@test.com' },
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        const req = new Request(
            'http://localhost:3000/api/draft/join?draft=draft-nonexistent&token=token-1'
        );
        const res = await DraftJoinGET(req);

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain('error=draft_not_found');
    });

    it('should redirect with error if token does not match', async () => {
        mockedSession = {
            expires: 'expires',
            user: { name: 'User B', email: 'userb@test.com' },
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        store['draft:shared:draft-1'] = JSON.stringify({
            draftId: 'draft-1',
            inviteToken: 'valid-token',
            ownerId: 'user-a-id',
            coCooksIds: [],
        });

        const req = new Request(
            'http://localhost:3000/api/draft/join?draft=draft-1&token=invalid-token'
        );
        const res = await DraftJoinGET(req);

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain(
            'error=invalid_invite_token'
        );
    });

    it('should join draft successfully and append user ID to coCooksIds', async () => {
        mockedSession = {
            expires: 'expires',
            user: { name: 'User B', email: 'userb@test.com' },
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        store['draft:shared:draft-1'] = JSON.stringify({
            draftId: 'draft-1',
            inviteToken: 'valid-token',
            ownerId: 'user-a-id',
            coCooksIds: [],
        });

        const req = new Request(
            'http://localhost:3000/api/draft/join?draft=draft-1&token=valid-token'
        );
        const res = await DraftJoinGET(req);

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain(
            '/?draft=draft-1&joined=true'
        );

        const updatedDraft = JSON.parse(store['draft:shared:draft-1']);
        expect(updatedDraft.coCooksIds).toContain('user-b-id');
    });

    it('should redirect with error when 4 co-cooks limit is already reached', async () => {
        mockedSession = {
            expires: 'expires',
            user: { name: 'User 5', email: 'user5@test.com' },
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: 'user-5-id',
            name: 'User 5',
            email: 'user5@test.com',
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        });

        store['draft:shared:draft-full'] = JSON.stringify({
            draftId: 'draft-full',
            inviteToken: 'valid-token',
            ownerId: 'user-a-id',
            coCooksIds: ['cook-1', 'cook-2', 'cook-3', 'cook-4'],
        });

        const req = new Request(
            'http://localhost:3000/api/draft/join?draft=draft-full&token=valid-token'
        );
        const res = await DraftJoinGET(req);

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain(
            'error=co_cook_limit_reached'
        );
    });
});
