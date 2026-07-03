'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownload, FiLinkedin, FiUser, FiCheck } from 'react-icons/fi';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
    Image,
    Font,
} from '@react-pdf/renderer';
import { useForm, FieldValues } from 'react-hook-form';

import Button from '@/app/components/buttons/Button';
import Input from '@/app/components/inputs/Input';

interface CertificateGeneratorProps {
    courseTitle: string;
    currentUserNames?: string | null;
    badgePath?: string;
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

// PDF styles
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

interface CertificateLabels {
    completion: string;
    presentedTo: string;
    description: string;
    team: string;
    date: string;
    certIdLabel: string;
}

// PDF document component
const CertificatePDF = ({
    recipientName,
    courseTitle,
    dateString,
    certId,
    badgePath,
    logoUrl,
    labels,
}: {
    recipientName: string;
    courseTitle: string;
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

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
    courseTitle,
    currentUserNames,
    badgePath,
}) => {
    const { t, i18n } = useTranslation();
    const [name, setName] = useState(currentUserNames || '');
    const [submitted, setSubmitted] = useState(!!currentUserNames);

    // Dynamic Font loading on instantiation
    registerFonts();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FieldValues>({
        defaultValues: {
            certificateName: name,
        },
    });

    const watchName = watch('certificateName');

    const today = new Date();
    const currentLang = i18n.language || 'en';
    const dateString = today.toLocaleDateString(
        currentLang === 'ca'
            ? 'ca-ES'
            : currentLang === 'es'
              ? 'es-ES'
              : 'en-US',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }
    );

    const issueYear = today.getFullYear().toString();
    const issueMonth = (today.getMonth() + 1).toString();

    // Unique certificate ID generator
    const certId = React.useMemo(() => {
        const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `JRBT-${issueYear}-${hash}`;
    }, [issueYear]);

    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
        courseTitle
    )}&organizationName=Jorbites&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
        'https://jorbites.com/certificates'
    )}&certId=${certId}`;

    const handleConfirmName = (data: FieldValues) => {
        const finalName = data.certificateName.trim();
        if (finalName) {
            setName(finalName);
            setSubmitted(true);
        }
    };

    // Prepare translated labels for PDF
    const labels: CertificateLabels = {
        completion: t('cert_completion') || 'CERTIFICATE OF COMPLETION',
        presentedTo:
            t('cert_presented_to') ||
            'This certificate is proudly presented to',
        description:
            t('cert_description', { courseTitle }) ||
            `For successfully completing the "${courseTitle}" formation, demonstrating proficiency in organizing and managing community events.`,
        team: t('cert_team') || 'Jorbites Team',
        date: t('cert_date') || 'Date',
        certIdLabel: t('cert_id') || 'Certificate ID',
    };

    // Construct full URLs with current window origin for development/production accuracy
    const logoUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/images/logo-nobg.png`
            : '/images/logo-nobg.png';

    const absoluteBadgeUrl =
        badgePath && typeof window !== 'undefined'
            ? `${window.location.origin}${badgePath}`
            : badgePath;

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
                Download Your Certificate
            </h3>

            {!submitted ? (
                <form
                    onSubmit={handleSubmit(handleConfirmName)}
                    className="space-y-4"
                >
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Please enter the name you want to appear on the official
                        certificate:
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="grow">
                            <Input
                                id="certificateName"
                                label="Your full name"
                                register={register}
                                errors={errors}
                                required
                            />
                        </div>
                        <div className="w-40 shrink-0">
                            <Button
                                label="Confirm"
                                type="submit"
                                disabled={!watchName?.trim()}
                                className="py-5"
                            />
                        </div>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-green-450/20 dark:bg-green-450/10 flex items-center gap-2 rounded-xl p-4 text-green-800 dark:text-green-300">
                        <FiCheck className="size-5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold">
                                Name confirmed: {name}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setValue('certificateName', name);
                                    setSubmitted(false);
                                }}
                                className="text-xs text-green-600 underline hover:text-green-700 dark:text-green-400"
                            >
                                Change Name
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <PDFDownloadLink
                            document={
                                <CertificatePDF
                                    recipientName={name}
                                    courseTitle={courseTitle}
                                    dateString={dateString}
                                    certId={certId}
                                    badgePath={absoluteBadgeUrl}
                                    logoUrl={logoUrl}
                                    labels={labels}
                                />
                            }
                            fileName={`Jorbites_Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`}
                            className="bg-green-450 inline-flex animate-none cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:opacity-90"
                        >
                            {({ loading }) => (
                                <>
                                    <FiDownload className="size-4" />
                                    <span>
                                        {loading
                                            ? 'Generating...'
                                            : t('download_certificate')}
                                    </span>
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
                            <span>{t('share_linkedin')}</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificateGenerator;
