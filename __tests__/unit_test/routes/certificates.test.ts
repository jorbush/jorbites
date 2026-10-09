import { expect } from '@jest/globals';
import {
    GET as CertificatesGET,
    POST as CertificatesPOST,
} from '@/app/api/certificates/route';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { authenticatedRatelimit } from '@/app/lib/ratelimit';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        certificate: {
            findMany: jest.fn(),
            upsert: jest.fn(),
        },
    },
}));

jest.mock('@/app/actions/getCurrentUser');

jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('@/app/lib/ratelimit', () => ({
    authenticatedRatelimit: { limit: jest.fn() },
}));

describe('Certificates API Routes (/api/certificates)', () => {
    const mockUser = {
        id: 'user-123',
        name: 'Chef Tester',
        email: 'test@example.com',
    };

    const mockCert = {
        id: 'cert-1',
        certId: 'JRBT-2026-TEST01',
        userId: 'user-123',
        courseId: 'jorbites-basics',
        courseTitle: 'Jorbites Basics',
        userName: 'Chef Tester',
        badgeUrl: '/badges/basics_badge.webp',
        issuedAt: new Date('2026-06-01T12:00:00.000Z'),
        createdAt: new Date('2026-06-01T12:00:00.000Z'),
        updatedAt: new Date('2026-06-01T12:00:00.000Z'),
        user: {
            id: 'user-123',
            name: 'Chef Tester',
            image: '/avatar.jpg',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.ENV;
    });

    describe('GET /api/certificates', () => {
        it('returns 401 when user is not authenticated', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(null);

            const req = new Request('http://localhost:3000/api/certificates');
            const res = await CertificatesGET(req);
            const data = await res.json();

            expect(res.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
            expect(prisma.certificate.findMany).not.toHaveBeenCalled();
        });

        it('returns user certificates when authenticated', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
            jest.mocked(prisma.certificate.findMany).mockResolvedValueOnce([
                mockCert as any,
            ]);

            const req = new Request('http://localhost:3000/api/certificates');
            const res = await CertificatesGET(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data).toHaveLength(1);
            expect(data[0].id).toBe('cert-1');
            expect(data[0].certId).toBe('JRBT-2026-TEST01');
            expect(data[0].issuedAt).toBe('2026-06-01T12:00:00.000Z');
            expect(prisma.certificate.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                include: { user: expect.any(Object) },
                orderBy: { createdAt: 'desc' },
            });
        });

        it('filters by courseId if query parameter provided', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
            jest.mocked(prisma.certificate.findMany).mockResolvedValueOnce([
                mockCert as any,
            ]);

            const req = new Request(
                'http://localhost:3000/api/certificates?courseId=jorbites-basics'
            );
            const res = await CertificatesGET(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(prisma.certificate.findMany).toHaveBeenCalledWith({
                where: {
                    userId: 'user-123',
                    courseId: 'jorbites-basics',
                },
                include: { user: expect.any(Object) },
                orderBy: { createdAt: 'desc' },
            });
        });

        it('returns 500 when database query throws', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
            jest.mocked(prisma.certificate.findMany).mockRejectedValueOnce(
                new Error('DB Query Failed')
            );

            const req = new Request('http://localhost:3000/api/certificates');
            const res = await CertificatesGET(req);
            const data = await res.json();

            expect(res.status).toBe(500);
            expect(data.error).toBe('Internal Error');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('POST /api/certificates', () => {
        it('returns 401 when user is not authenticated', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(null);

            const req = new Request('http://localhost:3000/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    userName: 'Chef Tester',
                }),
            });

            const res = await CertificatesPOST(req);
            const data = await res.json();

            expect(res.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
            expect(prisma.certificate.upsert).not.toHaveBeenCalled();
        });

        it('returns 429 when rate limit is exceeded in production', async () => {
            process.env.ENV = 'production';
            jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
            jest.mocked(authenticatedRatelimit.limit).mockResolvedValueOnce({
                success: false,
                reset: Date.now() + 5000,
            } as any);

            const req = new Request('http://localhost:3000/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    userName: 'Chef Tester',
                }),
            });

            const res = await CertificatesPOST(req);
            const data = await res.json();

            expect(res.status).toBe(429);
            expect(data.error).toContain('Too many requests');
            expect(prisma.certificate.upsert).not.toHaveBeenCalled();
        });

        it('returns 400 when courseId is not a valid course in catalog', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);

            const req = new Request('http://localhost:3000/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'hacking-101',
                    userName: 'Chef Tester',
                }),
            });

            const res = await CertificatesPOST(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toBe('Invalid course ID');
            expect(prisma.certificate.upsert).not.toHaveBeenCalled();
        });

        it('returns 400 when userName is too short or too long', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);

            const req = new Request('http://localhost:3000/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    userName: 'A',
                }),
            });

            const res = await CertificatesPOST(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toContain('between 2 and 60 characters');
            expect(prisma.certificate.upsert).not.toHaveBeenCalled();
        });

        it('upserts certificate using authoritative catalog title and badge, ignoring client spoofing', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
            jest.mocked(prisma.certificate.upsert).mockResolvedValueOnce(
                mockCert as any
            );

            const req = new Request('http://localhost:3000/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    courseTitle: 'Spoofed Masterclass Degree',
                    userName: 'Chef Tester',
                    badgeUrl: 'https://evil.com/fake-badge.png',
                }),
            });

            const res = await CertificatesPOST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.id).toBe('cert-1');
            expect(data.certId).toBe('JRBT-2026-TEST01');
            // Check that upsert called with authoritative catalog values
            expect(prisma.certificate.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId_courseId: {
                            userId: 'user-123',
                            courseId: 'jorbites-basics',
                        },
                    },
                    create: expect.objectContaining({
                        userId: 'user-123',
                        courseId: 'jorbites-basics',
                        courseTitle: 'Jorbites Basics',
                        userName: 'Chef Tester',
                        badgeUrl: '/badges/basics_badge.webp',
                    }),
                    update: expect.objectContaining({
                        courseTitle: 'Jorbites Basics',
                        userName: 'Chef Tester',
                        badgeUrl: '/badges/basics_badge.webp',
                    }),
                })
            );
        });

        it('retries upsert on unique certId collision (P2002)', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);

            const p2002Error: any = new Error('Unique constraint failed');
            p2002Error.code = 'P2002';
            p2002Error.meta = { target: ['certId'] };

            jest.mocked(prisma.certificate.upsert)
                .mockRejectedValueOnce(p2002Error)
                .mockResolvedValueOnce(mockCert as any);

            const req = new Request('http://localhost:3000/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    userName: 'Chef Tester',
                }),
            });

            const res = await CertificatesPOST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(prisma.certificate.upsert).toHaveBeenCalledTimes(2);
            expect(data.certId).toBe('JRBT-2026-TEST01');
        });

        it('returns 500 when database upsert fails unexpectedly', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
            jest.mocked(prisma.certificate.upsert).mockRejectedValueOnce(
                new Error('Upsert Failed')
            );

            const req = new Request('http://localhost:3000/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    userName: 'Chef Tester',
                }),
            });

            const res = await CertificatesPOST(req);
            const data = await res.json();

            expect(res.status).toBe(500);
            expect(data.error).toBe('Internal Error');
            expect(logger.error).toHaveBeenCalled();
        });
    });
});
