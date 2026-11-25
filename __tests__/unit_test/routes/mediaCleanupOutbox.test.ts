import { expect } from '@jest/globals';
import {
    GET as MediaCleanupGET,
    POST as MediaCleanupPOST,
} from '@/app/api/media-cleanup/outbox/route';
import { NextRequest } from 'next/server';

jest.mock('@/app/lib/prismadb', () => ({
    pendingMediaCleanup: {
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';
import { deleteUserPrefixFromCloudinary } from '@/app/utils/cloudinary';
import { deleteUserPrefixFromR2 } from '@/app/utils/r2';

describe('Media Cleanup Outbox API Route Tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.CRON_SECRET = 'test-cron-secret';
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return 500 if CRON_SECRET is missing', async () => {
        delete process.env.CRON_SECRET;

        const request = new NextRequest(
            'http://localhost:3000/api/media-cleanup/outbox',
            { method: 'POST' }
        );

        const response = await MediaCleanupPOST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('CRON_SECRET is not configured');
    });

    it('should return 401 when Authorization token is missing or invalid', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/media-cleanup/outbox',
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer wrong-secret',
                },
            }
        );

        const response = await MediaCleanupPOST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Invalid cron/outbox authorization key');
    });

    it('should delete completed jobs when both Cloudinary and R2 succeed', async () => {
        (prisma.pendingMediaCleanup.findMany as jest.Mock).mockResolvedValue([
            {
                id: 'job-1',
                userId: 'user-123',
                cloudinaryDone: false,
                r2Done: false,
                attempts: 0,
            },
        ]);
        (deleteUserPrefixFromCloudinary as jest.Mock).mockResolvedValue({
            completed: true,
            deletedCount: 12,
        });
        (deleteUserPrefixFromR2 as jest.Mock).mockResolvedValue({
            completed: true,
            deletedCount: 4,
        });
        (prisma.pendingMediaCleanup.delete as jest.Mock).mockResolvedValue({});

        const request = new NextRequest(
            'http://localhost:3000/api/media-cleanup/outbox',
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer test-cron-secret',
                },
            }
        );

        const response = await MediaCleanupPOST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            status: 'success',
            processed: 1,
            completed: 1,
            pending: 0,
            cloudinaryDeleted: 12,
            r2Deleted: 4,
        });

        expect(prisma.pendingMediaCleanup.findMany).toHaveBeenCalledWith({
            orderBy: { requestedAt: 'asc' },
            take: 10,
        });
        expect(deleteUserPrefixFromCloudinary).toHaveBeenCalledWith('user-123');
        expect(deleteUserPrefixFromR2).toHaveBeenCalledWith('user-123');
        expect(prisma.pendingMediaCleanup.delete).toHaveBeenCalledWith({
            where: { id: 'job-1' },
        });
        expect(prisma.pendingMediaCleanup.update).not.toHaveBeenCalled();
    });

    it('should preserve partial progress and record error when one provider fails', async () => {
        (prisma.pendingMediaCleanup.findMany as jest.Mock).mockResolvedValue([
            {
                id: 'job-2',
                userId: 'user-456',
                cloudinaryDone: false,
                r2Done: false,
                attempts: 0,
            },
        ]);
        (deleteUserPrefixFromCloudinary as jest.Mock).mockResolvedValue({
            completed: true,
            deletedCount: 3,
        });
        (deleteUserPrefixFromR2 as jest.Mock).mockResolvedValue({
            completed: false,
            deletedCount: 0,
            error: 'R2 service unavailable',
        });
        (prisma.pendingMediaCleanup.update as jest.Mock).mockResolvedValue({});

        const request = new NextRequest(
            'http://localhost:3000/api/media-cleanup/outbox',
            {
                method: 'GET',
                headers: {
                    'x-api-key': 'test-cron-secret',
                },
            }
        );

        const response = await MediaCleanupGET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            status: 'success',
            processed: 1,
            completed: 0,
            pending: 1,
            cloudinaryDeleted: 3,
            r2Deleted: 0,
        });

        expect(prisma.pendingMediaCleanup.delete).not.toHaveBeenCalled();
        expect(prisma.pendingMediaCleanup.update).toHaveBeenCalledWith({
            where: { id: 'job-2' },
            data: {
                cloudinaryDone: true,
                r2Done: false,
                attempts: { increment: 1 },
                lastError: 'r2: R2 service unavailable',
            },
        });
    });

    it('should skip already-completed provider on retry and delete job once remaining provider succeeds', async () => {
        (prisma.pendingMediaCleanup.findMany as jest.Mock).mockResolvedValue([
            {
                id: 'job-2',
                userId: 'user-456',
                cloudinaryDone: true,
                r2Done: false,
                attempts: 1,
            },
        ]);
        (deleteUserPrefixFromR2 as jest.Mock).mockResolvedValue({
            completed: true,
            deletedCount: 2,
        });
        (prisma.pendingMediaCleanup.delete as jest.Mock).mockResolvedValue({});

        const request = new NextRequest(
            'http://localhost:3000/api/media-cleanup/outbox',
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer test-cron-secret',
                },
            }
        );

        const response = await MediaCleanupPOST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.completed).toBe(1);
        expect(deleteUserPrefixFromCloudinary).not.toHaveBeenCalled();
        expect(deleteUserPrefixFromR2).toHaveBeenCalledWith('user-456');
        expect(prisma.pendingMediaCleanup.delete).toHaveBeenCalledWith({
            where: { id: 'job-2' },
        });
    });

    it('should keep job pending with null lastError when bounded pagination is incomplete', async () => {
        (prisma.pendingMediaCleanup.findMany as jest.Mock).mockResolvedValue([
            {
                id: 'job-3',
                userId: 'power-user',
                cloudinaryDone: false,
                r2Done: true,
                attempts: 0,
            },
        ]);
        (deleteUserPrefixFromCloudinary as jest.Mock).mockResolvedValue({
            completed: false,
            deletedCount: 2500,
        });
        (prisma.pendingMediaCleanup.update as jest.Mock).mockResolvedValue({});

        const request = new NextRequest(
            'http://localhost:3000/api/media-cleanup/outbox',
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer test-cron-secret',
                },
            }
        );

        const response = await MediaCleanupPOST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.pending).toBe(1);
        expect(data.cloudinaryDeleted).toBe(2500);
        expect(prisma.pendingMediaCleanup.update).toHaveBeenCalledWith({
            where: { id: 'job-3' },
            data: {
                cloudinaryDone: false,
                r2Done: true,
                attempts: { increment: 1 },
                lastError: null,
            },
        });
    });
});
