'use client';

import React, { useMemo } from 'react';
import { FiDownload, FiLinkedin } from 'react-icons/fi';

interface CertificateLabels {
    completion: string;
    presentedTo: string;
    description: string;
    team: string;
    date: string;
    certIdLabel: string;
}

type ReactPdfModule = typeof import('@react-pdf/renderer');

interface CertificatePDFProps {
    pdfModule: ReactPdfModule;
    styles: any;
    recipientName: string;
    dateString: string;
    certId: string;
    badgePath?: string;
    logoUrl: string;
    labels: CertificateLabels;
}

const CertificatePDF: React.FC<CertificatePDFProps> = React.memo(
    ({
        pdfModule,
        styles,
        recipientName,
        dateString,
        certId,
        badgePath,
        logoUrl,
        labels,
    }) => {
        const {
            Document: Doc,
            Page: Pg,
            Text: Tx,
            View: Vw,
            Image: Img,
        } = pdfModule;

        return (
            <Doc>
                <Pg
                    size="A4"
                    orientation="landscape"
                    style={styles.page}
                >
                    <Vw style={styles.innerBorder}>
                        <Img
                            src={logoUrl}
                            style={styles.logo}
                        />
                        <Tx style={styles.header}>Jorbites Community</Tx>
                        <Tx style={styles.subtitle}>{labels.completion}</Tx>
                        <Tx style={styles.presentation}>
                            {labels.presentedTo}
                        </Tx>
                        <Tx style={styles.recipient}>{recipientName}</Tx>
                        <Tx style={styles.course}>{labels.description}</Tx>
                        {badgePath && (
                            <Img
                                src={badgePath}
                                style={styles.badge}
                            />
                        )}
                        <Vw style={styles.footerRow}>
                            <Vw style={styles.footerCol}>
                                <Vw style={styles.signatureLine} />
                                <Tx style={styles.signatureText}>
                                    {labels.team}
                                </Tx>
                            </Vw>
                            <Vw style={styles.footerCol}>
                                <Tx style={styles.signatureText}>
                                    {labels.date}: {dateString}
                                </Tx>
                            </Vw>
                        </Vw>
                        <Tx style={styles.certInfo}>
                            {labels.certIdLabel}: {certId}
                        </Tx>
                    </Vw>
                </Pg>
            </Doc>
        );
    }
);

CertificatePDF.displayName = 'CertificatePDF';

interface CertificateDownloadLinkSectionProps {
    pdfModule: ReactPdfModule;
    styles: any;
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

const CertificateDownloadLinkSection: React.FC<
    CertificateDownloadLinkSectionProps
> = ({
    pdfModule,
    styles,
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
    // Memoize the document JSX to satisfy jsx-no-jsx-as-prop.
    const pdfDocument = useMemo(
        () => (
            <CertificatePDF
                pdfModule={pdfModule}
                styles={styles}
                recipientName={name}
                dateString={dateString}
                certId={certId}
                badgePath={absoluteBadgeUrl}
                logoUrl={logoUrl}
                labels={labels}
            />
        ),
        [
            pdfModule,
            styles,
            name,
            dateString,
            certId,
            absoluteBadgeUrl,
            logoUrl,
            labels,
        ]
    );

    const { PDFDownloadLink: DownloadLink } = pdfModule;

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <DownloadLink
                document={pdfDocument}
                fileName={`Jorbites_Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`}
                className="bg-green-450 inline-flex animate-none cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:opacity-90"
            >
                {({ loading }: { loading: boolean }) => (
                    <>
                        <FiDownload className="size-4" />
                        <span>{loading ? 'Generating...' : downloadLabel}</span>
                    </>
                )}
            </DownloadLink>

            <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
                <FiLinkedin className="size-4 text-[#0A66C2]" />
                <span>{shareLinkedInLabel}</span>
            </a>
        </div>
    );
};

export default CertificateDownloadLinkSection;
