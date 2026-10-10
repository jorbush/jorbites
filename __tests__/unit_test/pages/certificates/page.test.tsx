import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CertificatePage, {
    generateMetadata,
} from '@/app/certificates/[certificateId]/page';

// Mocks
vi.mock('@/app/actions/getCertificateById', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/components/utils/ClientOnly', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="client-only">{children}</div>
    ),
}));

vi.mock('@/app/components/utils/EmptyState', () => ({
    default: ({ title, subtitle }: { title?: string; subtitle?: string }) => (
        <div data-testid="empty-state">
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
    ),
}));

vi.mock('@/app/certificates/[certificateId]/CertificateViewClient', () => ({
    default: ({ certificate }: { certificate: any }) => (
        <div data-testid="certificate-view-client">
            <span>{certificate.userName}</span>
            <span>{certificate.courseTitle}</span>
            <span>{certificate.certId}</span>
        </div>
    ),
}));

describe('CertificatePage and generateMetadata', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockCert = {
        id: 'cert-1',
        certId: 'JRBT-2026-ABCDEF12',
        userId: 'u1',
        courseId: 'jorbites-basics',
        courseTitle: 'Jorbites Basics',
        userName: 'Alice Smith',
        badgeUrl: '/badges/basics.webp',
        issuedAt: '2026-06-01T10:00:00.000Z',
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-06-01T10:00:00.000Z',
    };

    describe('generateMetadata', () => {
        it('returns fallback metadata when certificate is not found', async () => {
            const getCertificateByIdMock =
                await import('@/app/actions/getCertificateById');
            vi.mocked(getCertificateByIdMock.default).mockResolvedValue(null);

            const metadata = await generateMetadata({
                params: Promise.resolve({ certificateId: 'nonexistent' }),
            });

            expect(metadata.title).toBe('Certificate Not Found | Jorbites');
        });

        it('returns rich OpenGraph metadata when certificate is found', async () => {
            const getCertificateByIdMock =
                await import('@/app/actions/getCertificateById');
            vi.mocked(getCertificateByIdMock.default).mockResolvedValue(
                mockCert as any
            );

            const metadata = await generateMetadata({
                params: Promise.resolve({
                    certificateId: 'JRBT-2026-ABCDEF12',
                }),
            });

            expect(metadata.title).toBe(
                "Alice Smith's Jorbites Basics | Jorbites Certificate"
            );
            expect(metadata.openGraph?.url).toBe(
                '/certificates/JRBT-2026-ABCDEF12'
            );
            expect(metadata.openGraph?.images).toEqual(['/badges/basics.webp']);
        });

        it('returns graceful fallback metadata if action throws', async () => {
            const getCertificateByIdMock =
                await import('@/app/actions/getCertificateById');
            vi.mocked(getCertificateByIdMock.default).mockRejectedValue(
                new Error('DB connection error')
            );

            const metadata = await generateMetadata({
                params: Promise.resolve({
                    certificateId: 'JRBT-2026-ABCDEF12',
                }),
            });

            expect(metadata.title).toBe('Certificate | Jorbites');
        });
    });

    describe('CertificatePage component', () => {
        it('renders EmptyState ("Certificate not found") when certificate is null', async () => {
            const getCertificateByIdMock =
                await import('@/app/actions/getCertificateById');
            vi.mocked(getCertificateByIdMock.default).mockResolvedValue(null);

            render(
                await CertificatePage({
                    params: Promise.resolve({ certificateId: 'missing' }),
                })
            );

            expect(screen.getByTestId('empty-state')).toBeDefined();
            expect(screen.getByText('Certificate not found')).toBeDefined();
        });

        it('renders EmptyState ("Service temporarily unavailable") when DB error throws', async () => {
            const getCertificateByIdMock =
                await import('@/app/actions/getCertificateById');
            vi.mocked(getCertificateByIdMock.default).mockRejectedValue(
                new Error('DB failure')
            );

            render(
                await CertificatePage({
                    params: Promise.resolve({ certificateId: 'cert-1' }),
                })
            );

            expect(screen.getByTestId('empty-state')).toBeDefined();
            expect(
                screen.getByText('Service temporarily unavailable')
            ).toBeDefined();
        });

        it('renders CertificateViewClient when certificate is successfully loaded', async () => {
            const getCertificateByIdMock =
                await import('@/app/actions/getCertificateById');
            vi.mocked(getCertificateByIdMock.default).mockResolvedValue(
                mockCert as any
            );

            render(
                await CertificatePage({
                    params: Promise.resolve({
                        certificateId: 'JRBT-2026-ABCDEF12',
                    }),
                })
            );

            expect(screen.getByTestId('certificate-view-client')).toBeDefined();
            expect(screen.getByText('Alice Smith')).toBeDefined();
            expect(screen.getByText('JRBT-2026-ABCDEF12')).toBeDefined();
        });
    });
});
