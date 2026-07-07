import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CertificateDownloadSection from '@/app/components/courses/certificate/CertificateDownloadSection';
import React from 'react';

// Mock react-pdf/renderer
vi.mock('@react-pdf/renderer', () => ({
    Font: {
        register: vi.fn(),
    },
    StyleSheet: {
        create: (styles: any) => styles,
    },
    PDFDownloadLink: ({ children, fileName }: any) => (
        <div
            data-testid="mock-download-link"
            data-filename={fileName}
        >
            {children({ loading: false })}
        </div>
    ),
    Document: ({ children }: any) => (
        <div data-testid="mock-doc">{children}</div>
    ),
    Page: ({ children }: any) => <div data-testid="mock-page">{children}</div>,
    Text: ({ children }: any) => (
        <span data-testid="mock-text">{children}</span>
    ),
    View: ({ children }: any) => <div data-testid="mock-view">{children}</div>,
    Image: ({ src }: any) => (
        <img
            data-testid="mock-img"
            src={src}
            alt="pdf asset"
        />
    ),
}));

afterEach(() => {
    cleanup();
});

describe('<CertificateDownloadSection />', () => {
    const mockProps = {
        name: 'Jordi Bonet',
        dateString: 'July 6, 2026',
        certId: 'JRBT-2026-ABC',
        logoUrl: 'http://localhost/images/logo-nobg.png',
        absoluteBadgeUrl: 'http://localhost/badges/basics_badge.webp',
        labels: {
            completion: 'CERTIFICATE OF COMPLETION',
            presentedTo: 'Presented to',
            description: 'For completing the course',
            team: 'Jorbites Team',
            date: 'Date',
            certIdLabel: 'Certificate ID',
        },
        courseTitle: 'Jorbites Basics',
        downloadLabel: 'Download Certificate',
        linkedInUrl: 'https://linkedin.com/cert/123',
        shareLinkedInLabel: 'Share on LinkedIn',
    };

    it('renders loading state initially and then renders CertificateDownloadLinkSection when pdfModule is loaded', async () => {
        render(<CertificateDownloadSection {...mockProps} />);

        // It should render loading text initially (before the dynamic import promise resolves)
        expect(screen.getByText('Loading download options…')).toBeDefined();

        // Wait for dynamic import to resolve and load CertificateDownloadLinkSection
        await waitFor(() => {
            expect(screen.queryByText('Loading download options…')).toBeNull();
        });

        // Verify that the download link section rendered correctly with the mocked react-pdf components
        expect(screen.getByText('Download Certificate')).toBeDefined();
        expect(screen.getByText('Share on LinkedIn')).toBeDefined();
    });
});
