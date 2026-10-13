import getUserCertificates from '@/app/actions/getUserCertificates';
import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { PUBLIC_CERTIFICATE_USER_SELECT_FIELDS } from '@/app/utils/certificateUtils';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        certificate: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe('getUserCertificates Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCertificates = [
        {
            id: 'c1',
            certId: 'JRBT-2026-CERT01',
            userId: 'u1',
            courseId: 'jorbites-basics',
            courseTitle: 'Jorbites Basics',
            userName: 'Alice',
            badgeUrl: '/badges/basics.webp',
            issuedAt: new Date('2026-06-01T10:00:00.000Z'),
            createdAt: new Date('2026-06-01T10:00:00.000Z'),
            updatedAt: new Date('2026-06-01T10:00:00.000Z'),
            user: {
                id: 'u1',
                name: 'Alice',
                image: '/avatar.jpg',
            },
        },
    ];

    it('returns empty array when userId is not provided', async () => {
        expect(await getUserCertificates()).toEqual([]);
        expect(await getUserCertificates('')).toEqual([]);
        expect(prisma.certificate.findMany).not.toHaveBeenCalled();
    });

    it('returns user certificates with serialized dates', async () => {
        jest.mocked(prisma.certificate.findMany).mockResolvedValueOnce(
            mockCertificates as any
        );

        const result = await getUserCertificates('u1');

        expect(prisma.certificate.findMany).toHaveBeenCalledWith({
            where: { userId: 'u1' },
            include: {
                user: { select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS },
            },
            orderBy: { createdAt: 'desc' },
        });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('c1');
        expect(result[0].certId).toBe('JRBT-2026-CERT01');
        expect(result[0].issuedAt).toBe('2026-06-01T10:00:00.000Z');
        expect(result[0].createdAt).toBe('2026-06-01T10:00:00.000Z');
        expect(result[0].user?.name).toBe('Alice');
    });

    it('handles certificates when user relation is absent', async () => {
        const certsNoUser = [
            {
                ...mockCertificates[0],
                user: null,
            },
        ];
        jest.mocked(prisma.certificate.findMany).mockResolvedValueOnce(
            certsNoUser as any
        );

        const result = await getUserCertificates('u1');

        expect(result).toHaveLength(1);
        expect(result[0].user).toBeUndefined();
    });

    it('rethrows and logs error on DB exception', async () => {
        jest.mocked(prisma.certificate.findMany).mockRejectedValueOnce(
            new Error('Database connection lost')
        );

        await expect(getUserCertificates('u1')).rejects.toThrow(
            'Database connection lost'
        );
        expect(logger.error).toHaveBeenCalledWith('getUserCertificates error', {
            error: 'Database connection lost',
        });
    });
});
