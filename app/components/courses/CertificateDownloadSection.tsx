'use client';

import React, { useMemo } from 'react';
import { FiDownload, FiLinkedin } from 'react-icons/fi';
import {
    PDFDownloadLink,
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from '@react-pdf/renderer';

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

let fontsRegistered = false;
const registerFonts = () => {
    if (!fontsRegistered) {
        Font.register({
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
        fontsRegistered = true;
    }
};

const styles = StyleSheet.create({
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

const CertificatePDF = ({
    recipientName,
    dateString,
    certId,
    badgePath,
    logoUrl,
    labels,
}: {
    recipientName: string;
    dateString: string;
    certId: string;
    badgePath?: string;
    logoUrl: string;
    labels: CertificateLabels;
}) => (
    <Document>
        <Page
            size="A4"
            orientation="landscape"
            style={styles.page}
        >
            <View style={styles.innerBorder}>
                <Image
                    src={logoUrl}
                    style={styles.logo}
                />
                <Text style={styles.header}>Jorbites Community</Text>
                <Text style={styles.subtitle}>{labels.completion}</Text>

                <Text style={styles.presentation}>{labels.presentedTo}</Text>
                <Text style={styles.recipient}>{recipientName}</Text>

                <Text style={styles.course}>{labels.description}</Text>

                {badgePath && (
                    <Image
                        src={badgePath}
                        style={styles.badge}
                    />
                )}

                <View style={styles.footerRow}>
                    <View style={styles.footerCol}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>{labels.team}</Text>
                    </View>
                    <View style={styles.footerCol}>
                        <Text style={styles.signatureText}>
                            {labels.date}: {dateString}
                        </Text>
                    </View>
                </View>

                <Text style={styles.certInfo}>
                    {labels.certIdLabel}: {certId}
                </Text>
            </View>
        </Page>
    </Document>
);

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
    // Dynamic Font loading on instantiation
    registerFonts();

    // Memoize the PDF document to prevent recreating it on every render of this section
    const pdfDocument = useMemo(
        () => (
            <CertificatePDF
                recipientName={name}
                dateString={dateString}
                certId={certId}
                badgePath={absoluteBadgeUrl}
                logoUrl={logoUrl}
                labels={labels}
            />
        ),
        [name, dateString, certId, absoluteBadgeUrl, logoUrl, labels]
    );

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <PDFDownloadLink
                document={pdfDocument}
                fileName={`Jorbites_Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`}
                className="bg-green-450 inline-flex animate-none cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:opacity-90"
            >
                {({ loading }) => (
                    <>
                        <FiDownload className="size-4" />
                        <span>{loading ? 'Generating...' : downloadLabel}</span>
                    </>
                )}
            </PDFDownloadLink>

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

export default CertificateDownloadSection;
