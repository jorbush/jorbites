'use client';

import React, { useMemo, useEffect, useState } from 'react';
import CertificateDownloadLinkSection from './CertificateDownloadLinkSection';

interface CertificateLabels {
    completion: string;
    presentedTo: string;
    description: string;
    team: string;
    date: string;
    certIdLabel: string;
}

interface CertificateDownloadSectionProps {
    name: string;
    dateString: string;
    certId: string;
    absoluteBadgeUrl?: string;
    logoUrl: string;
    labels: CertificateLabels;
    courseTitle: string;
    downloadLabel: string;
    linkedInUrl: string;
    shareLinkedInLabel: string;
}

type ReactPdfModule = typeof import('@react-pdf/renderer');

const CertificateDownloadSection: React.FC<CertificateDownloadSectionProps> = ({
    name,
    dateString,
    certId,
    absoluteBadgeUrl,
    logoUrl,
    labels,
    courseTitle,
    downloadLabel,
    linkedInUrl,
    shareLinkedInLabel,
}) => {
    const [pdfModule, setPdfModule] = useState<ReactPdfModule | null>(null);

    useEffect(() => {
        // Load @react-pdf/renderer dynamically when component mounts
        import('@react-pdf/renderer').then((mod) => {
            mod.Font.register({
                family: 'Montserrat',
                fonts: [
                    {
                        src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aX8.ttf',
                        fontWeight: 400,
                    },
                    {
                        src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu173w5aX8.ttf',
                        fontWeight: 600,
                    },
                    {
                        src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aX8.ttf',
                        fontWeight: 700,
                    },
                    {
                        src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq6R9aX8.ttf',
                        fontWeight: 400,
                        fontStyle: 'italic',
                    },
                ],
            });
            setPdfModule(mod);
        });
    }, []);

    const styles = useMemo(() => {
        if (!pdfModule) return null;
        return pdfModule.StyleSheet.create({
            page: {
                flexDirection: 'column',
                backgroundColor: '#FCFDF9',
                padding: 40,
                position: 'relative',
                border: '12px solid #C5F0A4',
            },
            innerBorder: {
                flex: 1,
                border: '2px solid #C5F0A4',
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            },
            logo: {
                width: 100,
                height: 23,
                marginBottom: 8,
            },
            header: {
                fontFamily: 'Montserrat',
                fontSize: 15,
                fontWeight: 700,
                color: '#1C2915',
                marginBottom: 4,
                letterSpacing: 4,
                textTransform: 'uppercase',
            },
            subtitle: {
                fontFamily: 'Montserrat',
                fontSize: 10,
                fontWeight: 600,
                color: '#7C8A76',
                marginBottom: 16,
                letterSpacing: 1.5,
            },
            presentation: {
                fontFamily: 'Montserrat',
                fontSize: 12,
                fontWeight: 400,
                color: '#607258',
                marginBottom: 12,
                fontStyle: 'italic',
            },
            recipient: {
                fontFamily: 'Montserrat',
                fontSize: 24,
                fontWeight: 700,
                color: '#1C2915',
                marginBottom: 16,
                textDecoration: 'underline',
                textAlign: 'center',
            },
            course: {
                fontFamily: 'Montserrat',
                fontSize: 14,
                fontWeight: 400,
                color: '#1C2915',
                textAlign: 'center',
                marginBottom: 16,
                maxWidth: 450,
                lineHeight: 1.5,
            },
            badge: {
                width: 55,
                height: 55,
                marginBottom: 16,
            },
            footerRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: 16,
                borderTop: '1px solid #E3E7E1',
                paddingTop: 12,
            },
            footerCol: {
                flexDirection: 'column',
                alignItems: 'center',
                width: '45%',
            },
            signatureLine: {
                width: 120,
                borderBottom: '1px solid #7C8A76',
                marginBottom: 8,
            },
            signatureText: {
                fontFamily: 'Montserrat',
                fontSize: 9,
                fontWeight: 600,
                color: '#7C8A76',
            },
            certInfo: {
                fontFamily: 'Montserrat',
                fontSize: 8,
                fontWeight: 400,
                color: '#A2B09D',
                marginTop: 12,
            },
        });
    }, [pdfModule]);

    if (!pdfModule || !styles) {
        return (
            <div className="flex h-12 w-full items-center justify-center text-sm font-semibold text-neutral-500">
                Loading download options...
            </div>
        );
    }

    return (
        <CertificateDownloadLinkSection
            pdfModule={pdfModule}
            styles={styles}
            name={name}
            dateString={dateString}
            certId={certId}
            absoluteBadgeUrl={absoluteBadgeUrl}
            logoUrl={logoUrl}
            labels={labels}
            courseTitle={courseTitle}
            downloadLabel={downloadLabel}
            linkedInUrl={linkedInUrl}
            shareLinkedInLabel={shareLinkedInLabel}
        />
    );
};

export default CertificateDownloadSection;
