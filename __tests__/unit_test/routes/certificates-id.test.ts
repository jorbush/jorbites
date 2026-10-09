import { expect } from '@jest/globals';
import { GET as CertificateByIdGET } from '@/app/api/certificates/[certificateId]/route';
import getCertificateById from '@/app/actions/getCertificateById';
import { logger } from '@/app/lib/axiom/server';

jest.mock('@/app/actions/getCertificateById');

jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Certificate by ID API Route (/api/certificates/[certificateId])', () => {
    const mockCert = {
        id: 'cert-1',
        certId: 'JRBT-2026-TEST01',
        userId: 'user-123',
        courseId: 'jorbites-basics',
        courseTitle: 'Jorbites Basics',
        userName: 'Chef Tester',
        badgeUrl: '/badges/basics.webp',
        issuedAt: '2026-06-01T12:00:00.000Z',
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-01T12:00:00.000Z',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 404 when certificate is not found', async () => {
        jest.mocked(getCertificateById).mockResolvedValueOnce(null);

        const req = new Request(
            'http://localhost:3000/api/certificates/non-existent'
        );
        const params = Promise.resolve({ certificateId: 'non-existent' });

        const res = await CertificateByIdGET(req, { params });
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.error).toBe('Certificate not found');
        expect(getCertificateById).toHaveBeenCalledWith({
            certificateId: 'non-existent',
        });
    });

    it('returns 200 with certificate data when found', async () => {
        jest.mocked(getCertificateById).mockResolvedValueOnce(mockCert as any);

        const req = new Request(
            'http://localhost:3000/api/certificates/JRBT-2026-TEST01'
        );
        const params = Promise.resolve({
            certificateId: 'JRBT-2026-TEST01',
        });

        const res = await CertificateByIdGET(req, { params });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual(mockCert);
        expect(getCertificateById).toHaveBeenCalledWith({
            certificateId: 'JRBT-2026-TEST01',
        });
    });

    it('returns 500 when action throws an error', async () => {
        jest.mocked(getCertificateById).mockRejectedValueOnce(
            new Error('Database crash')
        );

        const req = new Request(
            'http://localhost:3000/api/certificates/JRBT-2026-TEST01'
        );
        const params = Promise.resolve({
            certificateId: 'JRBT-2026-TEST01',
        });

        const res = await CertificateByIdGET(req, { params });
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error).toBe('Internal Error');
        expect(logger.error).toHaveBeenCalled();
    });
});
