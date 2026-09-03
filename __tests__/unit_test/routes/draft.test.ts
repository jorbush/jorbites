import { expect } from '@jest/globals';
import {
    POST as DraftPOST,
    GET as DraftGET,
    DELETE as DraftDELETE,
} from '@/app/api/draft/route';
import { POST as DraftInvitePOST } from '@/app/api/draft/invite/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

const mockUser = {
    id: 'test-user-id',
    name: 'test',
    email: 'test@a.com',
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
                if (redisSets[k]) {
                    delete redisSets[k];
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
        incr: jest.fn(async () => 1),
    },
    redisCache: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        incr: jest.fn(),
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
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

describe('Draft API Error Handling & Shared Drafts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        for (const k of Object.keys(redisStore)) {
            delete redisStore[k];
        }
        for (const k of Object.keys(redisSets)) {
            delete redisSets[k];
        }
        if (mockedSession?.user?.email) {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        } else {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        }
    });

    describe('POST /api/draft', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const mockRequest = {
                json: jest.fn().mockResolvedValue({ title: 'Test Draft' }),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to save draft'
            );
        });

        it('should save single-user draft successfully', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                json: jest.fn().mockResolvedValue({ title: 'Single Draft' }),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.draftId).toBeDefined();
            expect(
                redisStore[`draft:user:test-user-id:${data.draftId}`]
            ).toBeDefined();
        });

        it('should save shared draft successfully when draftId is provided', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    draftId: 'shared-123',
                    title: 'Collaborative Pasta',
                    coCooksIds: ['co-cook-2'],
                }),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);
            expect(response.status).toBe(200);
            expect(redisStore['draft:shared:shared-123']).toBeDefined();

            const saved = JSON.parse(redisStore['draft:shared:shared-123']);
            expect(saved.title).toBe('Collaborative Pasta');
            expect(saved.ownerId).toBe('test-user-id');
        });

        it('should mask inviteToken in save response when user is a co-cook and not the owner (H2)', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'co-cook', email: 'cook@a.com' },
            };
            const coCookUser = {
                ...mockUser,
                id: 'co-cook-2',
                email: 'cook@a.com',
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(coCookUser);

            redisStore['draft:shared:shared-456'] = JSON.stringify({
                draftId: 'shared-456',
                ownerId: 'owner-id',
                inviteToken: 'secret-invite-token-abc',
                coCooksIds: ['co-cook-2'],
                title: 'Team Recipe',
            });

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    draftId: 'shared-456',
                    description: 'Updated by co-cook',
                }),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.draftId).toBe('shared-456');
            // Must NOT leak inviteToken to co-cook!
            expect(data.inviteToken).toBeUndefined();
        });
    });

    describe('GET /api/draft', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const response = await DraftGET(
                new Request('http://localhost:3000/api/draft')
            );

            expect(response.status).toBe(401);
        });

        it('should fetch single-user draft successfully', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            redisStore['draft:user:test-user-id:slot-1'] = JSON.stringify({
                draftId: 'slot-1',
                title: 'My Draft',
                updatedAt: new Date().toISOString(),
            });
            if (!redisSets['user:drafts:test-user-id']) {
                redisSets['user:drafts:test-user-id'] = new Set();
            }
            redisSets['user:drafts:test-user-id'].add('slot-1');

            const response = await DraftGET(
                new Request('http://localhost:3000/api/draft?slotId=slot-1')
            );
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.title).toBe('My Draft');
        });

        it('should fetch shared draft successfully when draftId query param is provided', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            redisStore['draft:shared:shared-999'] = JSON.stringify({
                draftId: 'shared-999',
                ownerId: 'test-user-id',
                title: 'Shared Draft Title',
            });

            const response = await DraftGET(
                new Request(
                    'http://localhost:3000/api/draft?draftId=shared-999'
                )
            );
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.title).toBe('Shared Draft Title');
        });
    });

    describe('DELETE /api/draft', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const response = await DraftDELETE(
                new Request('http://localhost:3000/api/draft')
            );
            expect(response.status).toBe(401);
        });

        it('should return 403 when non-owner attempts to delete shared draft', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            redisStore['draft:shared:shared-999'] = JSON.stringify({
                draftId: 'shared-999',
                ownerId: 'different-owner-id',
            });

            const response = await DraftDELETE(
                new Request(
                    'http://localhost:3000/api/draft?draftId=shared-999'
                )
            );
            expect(response.status).toBe(403);
            expect(redisStore['draft:shared:shared-999']).toBeDefined();
        });

        it('should return 500 when draft data is corrupted JSON without deleting keys', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            redisStore['draft:shared:corrupted-draft'] = '{invalid-json';

            const response = await DraftDELETE(
                new Request(
                    'http://localhost:3000/api/draft?draftId=corrupted-draft'
                )
            );
            expect(response.status).toBe(500);
            expect(redisStore['draft:shared:corrupted-draft']).toBe(
                '{invalid-json'
            );
        });

        it('should delete shared draft and clean up co-cooks user:drafts lists when owner deletes', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            redisStore['draft:shared:shared-999'] = JSON.stringify({
                draftId: 'shared-999',
                ownerId: 'test-user-id',
                coCooksIds: ['co-cook-a', 'co-cook-b'],
            });
            redisSets['user:drafts:test-user-id'] = new Set([
                'shared-999',
                'other-draft',
            ]);
            redisSets['user:drafts:co-cook-a'] = new Set(['shared-999']);
            redisSets['user:drafts:co-cook-b'] = new Set([
                'shared-999',
                'b-draft',
            ]);

            const response = await DraftDELETE(
                new Request(
                    'http://localhost:3000/api/draft?draftId=shared-999'
                )
            );
            expect(response.status).toBe(200);
            expect(redisStore['draft:shared:shared-999']).toBeUndefined();

            // Verify cleaned up from owner and co-cooks' lists
            expect(Array.from(redisSets['user:drafts:test-user-id'])).toEqual([
                'other-draft',
            ]);
            expect(Array.from(redisSets['user:drafts:co-cook-a'])).toEqual([]);
            expect(Array.from(redisSets['user:drafts:co-cook-b'])).toEqual([
                'b-draft',
            ]);
        });
    });

    describe('POST /api/draft/invite', () => {
        it('should reject invite regeneration by a non-owner with 403 Forbidden', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            redisStore['draft:shared:existing-draft'] = JSON.stringify({
                draftId: 'existing-draft',
                ownerId: 'original-owner-id',
                inviteToken: 'original-token',
            });

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    draftId: 'existing-draft',
                }),
                headers: { get: () => 'http://localhost:3000' },
            } as unknown as Request;

            const response = await DraftInvitePOST(mockRequest);
            expect(response.status).toBe(403);
            const data = await response.json();
            expect(data.error).toBe(
                'Only the draft owner can generate invite links'
            );
        });

        it('should allow draft owner to generate/regenerate invite link', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            redisStore['draft:shared:my-draft'] = JSON.stringify({
                draftId: 'my-draft',
                ownerId: 'test-user-id',
                inviteToken: 'old-token',
            });

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    draftId: 'my-draft',
                }),
                headers: { get: () => 'http://localhost:3000' },
            } as unknown as Request;

            const response = await DraftInvitePOST(mockRequest);
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.draftId).toBe('my-draft');
            expect(data.shareUrl).toContain('draft=my-draft');
        });

        it('should ignore client-supplied inviteToken and generate or reuse a server token (M4)', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    draftId: 'custom-token-draft',
                    inviteToken: 'injected-attacker-token',
                }),
                headers: { get: () => 'http://localhost:3000' },
            } as unknown as Request;

            const response = await DraftInvitePOST(mockRequest);
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.inviteToken).not.toBe('injected-attacker-token');
            expect(data.inviteToken).toMatch(/^[a-f0-9]{32}$/);
            expect(data.shareUrl).not.toContain(
                'token=injected-attacker-token'
            );
        });
    });
});
