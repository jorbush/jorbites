import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import React from 'react';
import CertificateViewClient from '@/app/certificates/[certificateId]/CertificateViewClient';
import toast from 'react-hot-toast';

vi.mock('next/image', () => ({
    default: ({ alt, ...props }: any) => (
        <img
            alt={alt}
            {...props}
        />
    ),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'cert_description' && options?.courseTitle) {
                return `Completed ${options.courseTitle}`;
            }
            return key;
        },
        i18n: { language: 'en' },
    }),
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
    },
}));

vi.mock('next/dynamic', () => ({
    default: () => {
        return function MockedDynamicComponent(props: any) {
            return (
                <div data-testid="mock-download-section">
                    <span>{props.name}</span>
                    <span>{props.courseTitle}</span>
                    <span>{props.certId}</span>
                    <span>{props.downloadLabel}</span>
                    <span>{props.shareLinkedInLabel}</span>
                    <a
                        href={props.linkedInUrl}
                        data-testid="mock-linkedin-link"
                    >
                        LinkedIn Share
                    </a>
                </div>
            );
        };
    },
}));

describe('<CertificateViewClient />', () => {
    const mockCertificate = {
        id: 'cert-1',
        certId: 'JRBT-2026-TEST123',
        userId: 'u1',
        courseId: 'jorbites-basics',
        courseTitle: 'Jorbites Basics',
        userName: 'Elena Rostova',
        badgeUrl: '/badges/basics.webp',
        issuedAt: '2026-06-15T12:00:00.000Z',
        createdAt: '2026-06-15T12:00:00.000Z',
        updatedAt: '2026-06-15T12:00:00.000Z',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders recipient name, certificate ID, course title, and back link', () => {
        render(<CertificateViewClient certificate={mockCertificate} />);

        expect(screen.getAllByText('Elena Rostova').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Jorbites Basics').length).toBeGreaterThan(
            0
        );
        expect(screen.getAllByText(/JRBT-2026-TEST123/).length).toBeGreaterThan(
            0
        );
        expect(screen.getByText('explore_courses')).toBeDefined();
    });

    it('renders badge image when badgeUrl is present', () => {
        render(<CertificateViewClient certificate={mockCertificate} />);

        const badgeImg = screen.getByAltText('Jorbites Basics');
        expect(badgeImg).toBeDefined();
        expect(badgeImg.getAttribute('src')).toBe('/badges/basics.webp');
    });

    it('does not render badge image when badgeUrl is not provided', () => {
        const certWithoutBadge = {
            ...mockCertificate,
            badgeUrl: null,
        };
        render(<CertificateViewClient certificate={certWithoutBadge as any} />);

        expect(screen.queryByAltText('Jorbites Basics')).toBeNull();
    });

    it('handles copy link button click and notifies with toast', async () => {
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
        });

        render(<CertificateViewClient certificate={mockCertificate} />);

        const copyBtn = screen.getByText('copy_link');
        fireEvent.click(copyBtn);

        expect(writeTextMock).toHaveBeenCalledWith(
            expect.stringContaining('/certificates/JRBT-2026-TEST123')
        );
        expect(toast.success).toHaveBeenCalledWith('link_copied');

        await waitFor(() => {
            expect(screen.getByText('link_copied')).toBeDefined();
        });
    });

    it('passes expected LinkedIn URL and parameters to CertificateDownloadSection', () => {
        render(<CertificateViewClient certificate={mockCertificate} />);

        const linkedInLink = screen.getByTestId('mock-linkedin-link');
        const href = linkedInLink.getAttribute('href');

        expect(href).toBeDefined();
        expect(href).toContain('linkedin.com/profile/add');
        expect(href).toContain('name=Jorbites%20Basics');
        expect(href).toContain('certId=JRBT-2026-TEST123');
        expect(href).toContain(
            encodeURIComponent('/certificates/JRBT-2026-TEST123')
        );
    });

    it('renders both light and dark mode logos with appropriate theme classes', () => {
        render(<CertificateViewClient certificate={mockCertificate} />);

        const logos = screen.getAllByAltText('Jorbites') as HTMLImageElement[];
        expect(logos).toHaveLength(2);

        const lightLogo = logos.find((img) => img.src.includes('logo-nobg'));
        const darkLogo = logos.find((img) => img.src.includes('no_bg_white'));

        expect(lightLogo).toBeDefined();
        expect(lightLogo?.className).toContain('dark:hidden');

        expect(darkLogo).toBeDefined();
        expect(darkLogo?.className).toContain('dark:block');
    });

    it('styles the certificate completion header with green-450 in dark theme', () => {
        render(<CertificateViewClient certificate={mockCertificate} />);

        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading.className).toContain('dark:text-green-450');
    });

    it('uses app green (green-450) for the certificate frame borders and accent divider', () => {
        const { container } = render(
            <CertificateViewClient certificate={mockCertificate} />
        );

        const outerFrame = container.querySelector('.border-8');
        expect(outerFrame?.className).toContain('border-green-450/30');

        const innerFrame = container.querySelector('.border-2');
        expect(innerFrame?.className).toContain('border-green-450/60');

        const divider = container.querySelector('.bg-green-450');
        expect(divider).toBeDefined();
    });
});
