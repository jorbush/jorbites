import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
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

describe('getCertificateByUserAndCourse Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCert = {
        id: 'c1',
        certId: 'JRBT-2026-COURSE01',
        userId: 'u1',
        courseId: 'recipe-creator',
        courseTitle: 'Recipe Creator',
        userName: 'Bob',
        badgeUrl: '/badges/recipe_creator_badge.webp',
        issuedAt: new Date('2026-05-15T08:00:00.000Z'),
        createdAt: new Date('2026-05-15T08:00:00.000Z'),
        updatedAt: new Date('2026-05-15T08:00:00.000Z'),
        user: {
            id: 'u1',
            name: 'Bob',
            image: '/bob.jpg',
        },
    };

    it('returns null if userId or courseId is missing', async () => {
        expect(await getCertificateByUserAndCourse()).toBeNull();
        expect(await getCertificateByUserAndCourse('u1', '')).toBeNull();
        expect(
            await getCertificateByUserAndCourse('', 'recipe-creator')
        ).toBeNull();
        expect(prisma.certificate.findUnique).not.toHaveBeenCalled();
    });

    it('finds certificate by userId and courseId compound unique key', async () => {
        jest.mocked(prisma.certificate.findUnique).mockResolvedValueOnce(
            mockCert as any
        );

        const result = await getCertificateByUserAndCourse(
            'u1',
            'recipe-creator'
        );

        expect(prisma.certificate.findUnique).toHaveBeenCalledWith({
            where: {
                userId_courseId: {
                    userId: 'u1',
                    courseId: 'recipe-creator',
                },
            },
            include: {
                user: { select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS },
            },
        });
        expect(result).not.toBeNull();
        expect(result?.certId).toBe('JRBT-2026-COURSE01');
        expect(result?.courseId).toBe('recipe-creator');
        expect(result?.issuedAt).toBe('2026-05-15T08:00:00.000Z');
        expect(result?.user?.name).toBe('Bob');
    });

    it('returns null if no certificate found', async () => {
        jest.mocked(prisma.certificate.findUnique).mockResolvedValueOnce(null);

        const result = await getCertificateByUserAndCourse('u1', 'nonexistent');

        expect(result).toBeNull();
    });

    it('rethrows and logs error if database query fails', async () => {
        jest.mocked(prisma.certificate.findUnique).mockRejectedValueOnce(
            new Error('DB disconnect')
        );

        await expect(
            getCertificateByUserAndCourse('u1', 'recipe-creator')
        ).rejects.toThrow('DB disconnect');

        expect(logger.error).toHaveBeenCalledWith(
            'getCertificateByUserAndCourse error',
            { error: 'DB disconnect' }
        );
    });
});
