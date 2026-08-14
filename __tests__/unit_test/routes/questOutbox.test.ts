import { expect } from '@jest/globals';
import {
    GET as OutboxGET,
    POST as OutboxPOST,
} from '@/app/api/quests/outbox/route';
import { NextRequest } from 'next/server';

jest.mock('@/app/lib/prismadb', () => ({
    quest: {
        findMany: jest.fn(),
        update: jest.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';

describe('Quests Outbox API Route Tests', () => {
    const originalFetch = global.fetch;
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.BADGE_FORGE_URL = 'http://localhost:4000';
        process.env.CRON_SECRET = 'test-cron-secret';
        process.env.BADGE_FORGE_API_KEY = 'outbound-key-different-from-cron';
    });

    afterEach(() => {
        global.fetch = originalFetch;
        process.env = originalEnv;
    });

    it('should return 500 if CRON_SECRET is missing', async () => {
        delete process.env.CRON_SECRET;

        const request = new NextRequest(
            'http://localhost:3000/api/quests/outbox',
            {
                method: 'GET',
            }
        );

        const response = await OutboxGET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('CRON_SECRET is not configured');
    });

    it('should reject BADGE_FORGE_API_KEY when attempting to authenticate inbound cron', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/quests/outbox',
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer outbound-key-different-from-cron',
                },
            }
        );

        const response = await OutboxGET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Invalid cron/outbox authorization key');
    });

    it('should return 401 if unauthenticated or token mismatched', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/quests/outbox',
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer wrong-secret',
                },
            }
        );

        const response = await OutboxGET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Invalid cron/outbox authorization key');
    });

    it('should process pending outbox evaluations on GET with Bearer token and enforce take: 50 limit', async () => {
        (prisma.quest.findMany as jest.Mock).mockResolvedValue([
            {
                id: 'quest-1',
                acceptedSolverId: 'solver-1',
                badgeEvaluated: false,
            },
            {
                id: 'quest-2',
                acceptedSolverId: 'solver-2',
                badgeEvaluated: false,
            },
        ]);
        (prisma.quest.update as jest.Mock).mockResolvedValue({});

        const mockFetch = jest
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'success' }),
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Badge Forge failed' }),
            });
        global.fetch = mockFetch as any;

        const request = new NextRequest(
            'http://localhost:3000/api/quests/outbox',
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test-cron-secret',
                },
            }
        );

        const response = await OutboxGET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('success');
        expect(data.processed).toBe(2);
        expect(data.succeeded).toBe(1);

        // Verify take: 50 pagination limit was used in DB query
        expect(prisma.quest.findMany).toHaveBeenCalledWith({
            where: {
                status: 'completed',
                badgeEvaluated: false,
                acceptedSolverId: { not: null },
            },
            take: 50,
        });

        // Verify only quest-1 was marked as evaluated (quest-2 failed)
        expect(prisma.quest.update).toHaveBeenCalledTimes(1);
        expect(prisma.quest.update).toHaveBeenCalledWith({
            where: { id: 'quest-1' },
            data: { badgeEvaluated: true },
        });
    });

    it('should process pending outbox evaluations on POST with x-api-key', async () => {
        (prisma.quest.findMany as jest.Mock).mockResolvedValue([]);

        const request = new NextRequest(
            'http://localhost:3000/api/quests/outbox',
            {
                method: 'POST',
                headers: {
                    'x-api-key': 'test-cron-secret',
                },
            }
        );

        const response = await OutboxPOST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.processed).toBe(0);
    });
});
