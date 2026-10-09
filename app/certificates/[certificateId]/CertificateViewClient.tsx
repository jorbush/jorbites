'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
    FiCheckCircle,
    FiLinkedin,
    FiCopy,
    FiArrowLeft,
    FiAward,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

import Container from '@/app/components/utils/Container';
import Button from '@/app/components/buttons/Button';
import { SafeCertificate } from '@/app/types';
import { formatDate } from '@/app/utils/date-utils';

const CertificateDownloadSection = dynamic(
    () =>
        import('@/app/components/courses/certificate/CertificateDownloadSection'),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-12 w-full items-center justify-center text-sm font-semibold text-neutral-500">
                Loading download options…
            </div>
        ),
    }
);

interface CertificateViewClientProps {
    certificate: SafeCertificate;
}

const CertificateViewClient: React.FC<CertificateViewClientProps> = ({
    certificate,
}) => {
    const { t, i18n } = useTranslation();
    const [copied, setCopied] = useState(false);

    const issueDate = useMemo(
        () => new Date(certificate.issuedAt),
        [certificate.issuedAt]
    );
    const dateString = formatDate(issueDate, i18n.language);
    const issueYear = issueDate.getFullYear().toString();
    const issueMonth = (issueDate.getMonth() + 1).toString();

    const certUrl = useMemo(() => {
        if (typeof window === 'undefined') {
            return `https://jorbites.com/certificates/${certificate.certId}`;
        }
        return `${window.location.origin}/certificates/${certificate.certId}`;
    }, [certificate.certId]);

    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
        certificate.courseTitle
    )}&organizationName=Jorbites&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
        certUrl
    )}&certId=${certificate.certId}`;

    const handleCopyLink = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(certUrl);
            setCopied(true);
            toast.success(
                t('link_copied') || 'Certificate link copied to clipboard!'
            );
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const labels = useMemo(
        () => ({
            completion: t('cert_completion') || 'CERTIFICATE OF COMPLETION',
            presentedTo:
                t('cert_presented_to') ||
                'This certificate is proudly presented to',
            description:
                t('cert_description', {
                    courseTitle: certificate.courseTitle,
                }) ||
                `For successfully completing the "${certificate.courseTitle}" formation, demonstrating proficiency and culinary excellence.`,
            team: t('cert_team') || 'Jorbites Team',
            date: t('cert_date') || 'Date',
            certIdLabel: t('cert_id') || 'Certificate ID',
        }),
        [t, certificate.courseTitle]
    );

    const logoUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/images/logo-nobg.png`
            : '/images/logo-nobg.png';

    const absoluteBadgeUrl =
        certificate.badgeUrl && typeof window !== 'undefined'
            ? `${window.location.origin}${certificate.badgeUrl}`
            : certificate.badgeUrl || undefined;

    return (
        <Container>
            <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
                {/* Back Link */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                        <FiArrowLeft className="size-4" />
                        <span>{t('explore_courses') || 'Explore Courses'}</span>
                    </Link>

                    {/* Verification Status Pill */}
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-950/40 dark:text-green-300">
                        <FiCheckCircle className="size-3.5 text-green-600 dark:text-green-400" />
                        <span>
                            {t('verified_certificate') ||
                                'Verified Certificate'}
                        </span>
                    </div>
                </div>

                {/* Main Certificate Visual Frame */}
                <div className="relative overflow-hidden rounded-3xl border-8 border-green-100 bg-[#FCFDF9] p-6 shadow-xl sm:p-10 md:p-14 dark:border-green-950/50 dark:bg-neutral-900">
                    <div className="flex flex-col items-center rounded-2xl border-2 border-green-200/60 p-6 text-center sm:p-8 md:p-12 dark:border-green-900/40">
                        {/* Jorbites Logo */}
                        <div className="relative mb-3 size-20">
                            <Image
                                src="/images/logo-nobg.png"
                                alt="Jorbites"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        <p className="text-xs font-bold tracking-widest text-neutral-500 uppercase sm:text-sm dark:text-neutral-400">
                            {t('cert_community') || 'Jorbites Community'}
                        </p>

                        <h2 className="mt-2 text-xl font-extrabold tracking-wider text-green-800 uppercase sm:text-2xl md:text-3xl dark:text-green-400">
                            {labels.completion}
                        </h2>

                        <p className="mt-4 text-xs text-neutral-500 italic sm:text-sm dark:text-neutral-400">
                            {labels.presentedTo}
                        </p>

                        {/* Recipient Name */}
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl dark:text-white">
                            {certificate.userName}
                        </h1>

                        <div className="my-4 h-0.5 w-24 bg-green-400/50 sm:w-32" />

                        <p className="max-w-xl text-xs text-neutral-600 sm:text-sm md:text-base dark:text-neutral-300">
                            {labels.description}
                        </p>

                        {/* Course Badge */}
                        {certificate.badgeUrl && (
                            <div className="relative my-6 size-24 overflow-hidden rounded-full border-4 border-white shadow-md sm:size-28 dark:border-neutral-800">
                                <Image
                                    src={certificate.badgeUrl}
                                    alt={certificate.courseTitle}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Footer Details */}
                        <div className="mt-6 flex w-full flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row dark:border-neutral-800 dark:text-neutral-400">
                            <div className="text-center sm:text-left">
                                <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                                    {labels.team}
                                </p>
                                <p className="text-[11px] text-neutral-400">
                                    {t('cert_authority') ||
                                        'Verified Issuing Authority'}
                                </p>
                            </div>

                            <div className="text-center sm:text-right">
                                <p>
                                    <span className="font-semibold">
                                        {labels.date}:
                                    </span>{' '}
                                    {dateString}
                                </p>
                                <p className="font-mono text-[11px] text-neutral-400">
                                    {labels.certIdLabel}: {certificate.certId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions & Sharing Banner */}
                <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                                {t('share_certificate') || 'Share Certificate'}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {t('certificate_verified_desc') ||
                                    'This certificate has been issued and verified by Jorbites.'}
                            </p>
                        </div>

                        {/* Copy Link button */}
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            <FiCopy className="size-3.5" />
                            <span>
                                {copied
                                    ? t('link_copied') || 'Copied!'
                                    : t('copy_link') || 'Copy Link'}
                            </span>
                        </button>
                    </div>

                    <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800">
                        <CertificateDownloadSection
                            name={certificate.userName}
                            dateString={dateString}
                            certId={certificate.certId}
                            absoluteBadgeUrl={absoluteBadgeUrl}
                            logoUrl={logoUrl}
                            labels={labels}
                            courseTitle={certificate.courseTitle}
                            downloadLabel={t('download_certificate')}
                            linkedInUrl={linkedInUrl}
                            shareLinkedInLabel={t('share_linkedin')}
                        />
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default CertificateViewClient;
