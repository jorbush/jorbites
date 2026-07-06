import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CertificateDownloadLinkSection from '@/app/components/courses/certificate/CertificateDownloadLinkSection';

afterEach(() => {
    cleanup();
});

// Mock components to test that layout rendering receives correct details
const mockPDFDownloadLink = ({ children, document, fileName }: any) => {
    // Render the document to verify the output in JSDOM
    return (
        <div
            data-testid="mock-pdf-download-link"
            data-filename={fileName}
        >
            {children({ loading: false })}
            <div data-testid="document-contents">{document}</div>
        </div>
    );
};

const mockDocument = ({ children }: any) => (
    <div data-testid="pdf-document">{children}</div>
);
const mockPage = ({ children, style }: any) => (
    <div
        data-testid="pdf-page"
        style={style}
    >
        {children}
    </div>
);
const mockText = ({ children, style }: any) => (
    <span
        data-testid="pdf-text"
        style={style}
    >
        {children}
    </span>
);
const mockView = ({ children, style }: any) => (
    <div
        data-testid="pdf-view"
        style={style}
    >
        {children}
    </div>
);
const mockImage = ({ src, style }: any) => (
    <img
        data-testid="pdf-image"
        src={src}
        style={style}
        alt="pdf asset"
    />
);

const mockPdfModule = {
    PDFDownloadLink: mockPDFDownloadLink,
    Document: mockDocument,
    Page: mockPage,
    Text: mockText,
    View: mockView,
    Image: mockImage,
    Font: {
        register: vi.fn(),
    },
    StyleSheet: {
        create: (styles: any) => styles,
    },
} as any;

describe('CertificateDownloadLinkSection', () => {
    const mockProps = {
        pdfModule: mockPdfModule,
        styles: {
            page: { padding: 40 },
            innerBorder: { flex: 1 },
            logo: { width: 100 },
            header: { fontSize: 15 },
            subtitle: { fontSize: 10 },
            presentation: { fontSize: 12 },
            recipient: { fontSize: 24 },
            course: { fontSize: 14 },
            badge: { width: 55 },
            footerRow: { flexDirection: 'row' },
            footerCol: { flexDirection: 'column' },
            signatureLine: { width: 120 },
            signatureText: { fontSize: 9 },
            certInfo: { fontSize: 8 },
        },
        name: 'Jordi Bonet',
        dateString: 'July 4, 2026',
        certId: 'JRBT-2026-XYZ',
        absoluteBadgeUrl: 'http://localhost/badges/contest_manager_badge.jpg',
        logoUrl: 'http://localhost/images/logo-nobg.png',
        labels: {
            completion: 'CERTIFICATE OF COMPLETION',
            presentedTo: 'This certificate is proudly presented to',
            description:
                'For successfully completing the Contest Manager Course.',
            team: 'Jorbites Team',
            date: 'Date',
            certIdLabel: 'Certificate ID',
        },
        courseTitle: 'Contest Manager Course',
        downloadLabel: 'Download PDF',
        linkedInUrl: 'https://linkedin.com/cert/123',
        shareLinkedInLabel: 'Share on LinkedIn',
    };

    it('renders download button and linkedin link with correct attributes', () => {
        render(<CertificateDownloadLinkSection {...mockProps} />);

        // Verify PDF Download Link wrapper attributes
        const downloadWrapper = screen.getByTestId('mock-pdf-download-link');
        expect(downloadWrapper.getAttribute('data-filename')).toBe(
            'Jorbites_Certificate_Contest_Manager_Course.pdf'
        );
        expect(screen.getByText('Download PDF')).toBeDefined();

        // Verify LinkedIn Link attributes
        const linkedinLink = screen.getByRole('link', {
            name: 'Share on LinkedIn',
        });
        expect(linkedinLink).toBeDefined();
        expect(linkedinLink.getAttribute('href')).toBe(
            'https://linkedin.com/cert/123'
        );
        expect(linkedinLink.getAttribute('target')).toBe('_blank');
    });

    it('renders CertificatePDF details inside the pdf document container', () => {
        render(<CertificateDownloadLinkSection {...mockProps} />);

        // Verify that PDF components render correct contents passed downstream
        expect(screen.getByTestId('pdf-document')).toBeDefined();
        expect(screen.getByText('Jordi Bonet')).toBeDefined();
        expect(screen.getByText('CERTIFICATE OF COMPLETION')).toBeDefined();
        expect(
            screen.getByText('This certificate is proudly presented to')
        ).toBeDefined();
        expect(
            screen.getByText(
                'For successfully completing the Contest Manager Course.'
            )
        ).toBeDefined();
        expect(screen.getByText('Jorbites Team')).toBeDefined();
        expect(screen.getByText('Date: July 4, 2026')).toBeDefined();
        expect(screen.getByText('Certificate ID: JRBT-2026-XYZ')).toBeDefined();

        // Verify images
        const images = screen.getAllByTestId('pdf-image');
        expect(images).toHaveLength(2);
        expect(images[0].getAttribute('src')).toBe(
            'http://localhost/images/logo-nobg.png'
        );
        expect(images[1].getAttribute('src')).toBe(
            'http://localhost/badges/contest_manager_badge.jpg'
        );
    });

    it('does not render badge if absoluteBadgeUrl is omitted', () => {
        const propsWithoutBadge = { ...mockProps, absoluteBadgeUrl: undefined };
        render(<CertificateDownloadLinkSection {...propsWithoutBadge} />);

        const images = screen.getAllByTestId('pdf-image');
        // Only logo image should render
        expect(images).toHaveLength(1);
        expect(images[0].getAttribute('src')).toBe(
            'http://localhost/images/logo-nobg.png'
        );
    });
});
