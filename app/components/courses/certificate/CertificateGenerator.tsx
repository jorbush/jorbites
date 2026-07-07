'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { useForm, FieldValues } from 'react-hook-form';

import Button from '@/app/components/buttons/Button';
import Input from '@/app/components/inputs/Input';

// Load CertificateDownloadSection dynamically. Since it statically imports
// @react-pdf/renderer, that entire heavy library is successfully split
// into a separate code chunk and only loaded on-demand.
const CertificateDownloadSection = dynamic(
    () => import('./CertificateDownloadSection'),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-12 w-full items-center justify-center text-sm font-semibold text-neutral-500">
                Loading download options...
            </div>
        ),
    }
);

interface CertificateGeneratorProps {
    courseTitle: string;
    currentUserNames?: string | null;
    badgePath?: string;
}

interface CertificateLabels {
    completion: string;
    presentedTo: string;
    description: string;
    team: string;
    date: string;
    certIdLabel: string;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
    courseTitle,
    currentUserNames,
    badgePath,
}) => {
    const { t, i18n } = useTranslation();
    const [name, setName] = useState(currentUserNames || '');
    const [submitted, setSubmitted] = useState(!!currentUserNames);

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
        'https://jorbites.com/courses'
    )}&certId=${certId}`;

    const handleConfirmName = (data: FieldValues) => {
        const finalName = data.certificateName.trim();
        if (finalName) {
            setName(finalName);
            setSubmitted(true);
        }
    };

    // Prepare translated labels for PDF (memoized correctly)
    const labels = useMemo<CertificateLabels>(
        () => ({
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
        }),
        [t, courseTitle]
    );

    const [pngBadgeUrl, setPngBadgeUrl] = useState<string | undefined>(
        undefined
    );

    React.useEffect(() => {
        if (!badgePath || typeof window === 'undefined') return;
        const absoluteUrl = `${window.location.origin}${badgePath}`;

        const loadAndTranscode = (): Promise<string> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth || img.width;
                        canvas.height = img.naturalHeight || img.height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0);
                            resolve(canvas.toDataURL('image/png'));
                        } else {
                            resolve(absoluteUrl);
                        }
                    } catch (err) {
                        console.error('Error transcoding badge to PNG:', err);
                        resolve(absoluteUrl);
                    }
                };
                img.onerror = () => {
                    resolve(absoluteUrl);
                };
                img.src = absoluteUrl;
            });
        };

        loadAndTranscode().then(setPngBadgeUrl);
    }, [badgePath]);

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
            <h3 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
                {t('contest_manager_course_details.download_your_certificate')}
            </h3>

            {!submitted ? (
                <form
                    onSubmit={handleSubmit(handleConfirmName)}
                    className="space-y-4"
                >
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t(
                            'contest_manager_course_details.enter_certificate_name_desc'
                        )}
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="grow">
                            <Input
                                id="certificateName"
                                label={t(
                                    'contest_manager_course_details.your_full_name'
                                )}
                                register={register}
                                errors={errors}
                                required
                            />
                        </div>
                        <div className="w-40 shrink-0">
                            <Button
                                label={t(
                                    'contest_manager_course_details.confirm'
                                )}
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
                                {t(
                                    'contest_manager_course_details.name_confirmed'
                                )}
                                : {name}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setValue('certificateName', name);
                                    setSubmitted(false);
                                }}
                                className="text-xs text-green-600 underline hover:text-green-700 dark:text-green-400"
                            >
                                {t(
                                    'contest_manager_course_details.change_name'
                                )}
                            </button>
                        </div>
                    </div>

                    <CertificateDownloadSection
                        name={name}
                        dateString={dateString}
                        certId={certId}
                        absoluteBadgeUrl={pngBadgeUrl || absoluteBadgeUrl}
                        logoUrl={logoUrl}
                        labels={labels}
                        courseTitle={courseTitle}
                        downloadLabel={t('download_certificate')}
                        linkedInUrl={linkedInUrl}
                        shareLinkedInLabel={t('share_linkedin')}
                    />
                </div>
            )}
        </div>
    );
};

export default CertificateGenerator;
