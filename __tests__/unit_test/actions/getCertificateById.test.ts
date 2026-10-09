import getCertificateById from '@/app/actions/getCertificateById';
import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { PUBLIC_CERTIFICATE_USER_SELECT_FIELDS } from '@/app/utils/certificateUtils';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        certificate: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe('getCertificateById Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCert = {
        id: '507f1f77bcf86cd799439011',
        certId: 'JRBT-2026-ABC123',
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
    };

    it('returns null if certificateId is not provided or invalid', async () => {
        expect(await getCertificateById({})).toBeNull();
        expect(await getCertificateById({ certificateId: '' })).toBeNull();
        expect(
            await getCertificateById({ certificateId: undefined })
        ).toBeNull();
        expect(prisma.certificate.findUnique).not.toHaveBeenCalled();
    });

    it('finds certificate by MongoDB ObjectId', async () => {
        jest.mocked(prisma.certificate.findUnique).mockResolvedValueOnce(
            mockCert as any
        );

        const result = await getCertificateById({
            certificateId: '507f1f77bcf86cd799439011',
        });

        expect(prisma.certificate.findUnique).toHaveBeenCalledWith({
            where: { id: '507f1f77bcf86cd799439011' },
            include: {
                user: { select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS },
            },
        });
        expect(result).not.toBeNull();
        expect(result?.id).toBe('507f1f77bcf86cd799439011');
        expect(result?.certId).toBe('JRBT-2026-ABC123');
        expect(result?.issuedAt).toBe('2026-06-01T10:00:00.000Z');
        expect(result?.user?.name).toBe('Alice');
        expect(result?.user?.image).toBe('/avatar.jpg');
    });

    it('finds certificate by public certId when not a 24-hex ObjectId', async () => {
        jest.mocked(prisma.certificate.findUnique).mockResolvedValueOnce(
            mockCert as any
        );

        const result = await getCertificateById({
            certificateId: 'JRBT-2026-ABC123',
        });

        expect(prisma.certificate.findUnique).toHaveBeenCalledWith({
            where: { certId: 'JRBT-2026-ABC123' },
            include: {
                user: { select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS },
            },
        });
        expect(result?.certId).toBe('JRBT-2026-ABC123');
    });

    it('falls back to certId lookup if ObjectId query yields nothing', async () => {
        jest.mocked(prisma.certificate.findUnique)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(mockCert as any);

        const result = await getCertificateById({
            certificateId: '507f1f77bcf86cd799439011',
        });

        expect(prisma.certificate.findUnique).toHaveBeenCalledTimes(2);
        expect(result?.id).toBe('507f1f77bcf86cd799439011');
    });

    it('returns null when certificate is not found', async () => {
        jest.mocked(prisma.certificate.findUnique).mockResolvedValue(null);

        const result = await getCertificateById({
            certificateId: 'JRBT-NOT-FOUND',
        });

        expect(result).toBeNull();
    });

    it('handles certificate with null user', async () => {
        const certWithoutUser = {
            ...mockCert,
            user: null,
        };
        jest.mocked(prisma.certificate.findUnique).mockResolvedValueOnce(
            certWithoutUser as any
        );

        const result = await getCertificateById({
            certificateId: 'JRBT-2026-ABC123',
        });

        expect(result).not.toBeNull();
        expect(result?.user).toBeUndefined();
    });

    it('rethrows and logs error if database query throws', async () => {
        jest.mocked(prisma.certificate.findUnique).mockRejectedValueOnce(
            new Error('DB failure')
        );

        await expect(
            getCertificateById({ certificateId: 'JRBT-2026-ABC123' })
        ).rejects.toThrow('DB failure');

        expect(logger.error).toHaveBeenCalledWith('getCertificateById error', {
            error: 'DB failure',
        });
    });
});
