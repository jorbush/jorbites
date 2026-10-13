'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { useForm, FieldValues } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

import Button from '@/app/components/buttons/Button';
import Input from '@/app/components/inputs/Input';
import { formatDate } from '@/app/utils/date-utils';
import { SafeCertificate } from '@/app/types';

// Load CertificateDownloadSection dynamically. Since it statically imports
// @react-pdf/renderer, that entire heavy library is successfully split
// into a separate code chunk and only loaded on-demand.
const CertificateDownloadSection = dynamic(
    () => import('./CertificateDownloadSection'),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-12 w-full items-center justify-center text-sm font-semibold text-neutral-500">
                Loading download options…
            </div>
        ),
    }
);

interface CertificateGeneratorProps {
    courseTitle: string;
    currentUserNames?: string | null;
    badgePath?: string;
    courseId?: string;
    initialCertificate?: SafeCertificate | null;
}

interface CertificateLabels {
    completion: string;
    presentedTo: string;
    description: string;
    team: string;
    date: string;
    certIdLabel: string;
}

function getAbsoluteUrl(path: string): string {
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
}

function useTranscodedBadgeUrl(badgePath?: string): string | undefined {
    const [pngBadgeUrl, setPngBadgeUrl] = useState<string | undefined>(
        undefined
    );

    useEffect(() => {
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

    return pngBadgeUrl;
}

function useCertificateLabels(
    courseTitle: string,
    t: (key: string, options?: any) => string
): CertificateLabels {
    return useMemo<CertificateLabels>(
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
}

function useCertificateUrls(
    certificate: SafeCertificate | null,
    courseTitle: string,
    language: string
) {
    const issueDate = useMemo(() => {
        return certificate?.issuedAt
            ? new Date(certificate.issuedAt)
            : new Date();
    }, [certificate?.issuedAt]);

    const dateString = formatDate(issueDate, language);
    const issueYear = issueDate.getFullYear().toString();
    const issueMonth = (issueDate.getMonth() + 1).toString();

    const publicCertUrl = useMemo(() => {
        if (!certificate?.certId) return undefined;
        return typeof window === 'undefined'
            ? `https://jorbites.com/certificates/${certificate.certId}`
            : `${window.location.origin}/certificates/${certificate.certId}`;
    }, [certificate?.certId]);

    const linkedInUrl = useMemo(() => {
        if (!certificate?.certId || !publicCertUrl) return undefined;
        return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
            courseTitle
        )}&organizationName=Jorbites&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
            publicCertUrl
        )}&certId=${certificate.certId}`;
    }, [
        certificate?.certId,
        publicCertUrl,
        courseTitle,
        issueYear,
        issueMonth,
    ]);

    return { dateString, publicCertUrl, linkedInUrl };
}

interface CertificateNameFormProps {
    initialName: string;
    isSaving: boolean;
    onConfirm: (name: string) => void;
}

const CertificateNameForm: React.FC<CertificateNameFormProps> = ({
    initialName,
    isSaving,
    onConfirm,
}) => {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FieldValues>({
        defaultValues: {
            certificateName: initialName,
        },
    });

    useEffect(() => {
        setValue('certificateName', initialName);
    }, [initialName, setValue]);

    const watchName = watch('certificateName');

    const onSubmit = (data: FieldValues) => {
        const finalName = data.certificateName?.trim();
        if (finalName) {
            onConfirm(finalName);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
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
                        label={t('contest_manager_course_details.confirm')}
                        type="submit"
                        disabled={!watchName?.trim() || isSaving}
                        className="py-5"
                    />
                </div>
            </div>
        </form>
    );
};

interface CertificateConfirmedSectionProps {
    name: string;
    certificate: SafeCertificate | null;
    dateString: string;
    absoluteBadgeUrl?: string;
    logoUrl: string;
    labels: CertificateLabels;
    courseTitle: string;
    linkedInUrl?: string;
    publicCertUrl?: string;
    onEditName: () => void;
}

const CertificateConfirmedSection: React.FC<
    CertificateConfirmedSectionProps
> = ({
    name,
    certificate,
    dateString,
    absoluteBadgeUrl,
    logoUrl,
    labels,
    courseTitle,
    linkedInUrl,
    publicCertUrl,
    onEditName,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="bg-green-450/20 dark:bg-green-450/10 flex items-center gap-2 rounded-xl p-4 text-green-800 dark:text-green-300">
                <FiCheck className="size-5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-semibold">
                        {t('contest_manager_course_details.name_confirmed')}:{' '}
                        {name}
                    </p>
                    <button
                        type="button"
                        onClick={onEditName}
                        className="text-xs text-green-600 underline hover:text-green-700 dark:text-green-400"
                    >
                        {t('contest_manager_course_details.change_name')}
                    </button>
                </div>
            </div>

            {!certificate ? (
                <div className="flex h-12 w-full items-center justify-center text-sm font-semibold text-neutral-500">
                    {t('issuing_certificate') || 'Issuing certificate…'}
                </div>
            ) : (
                <CertificateDownloadSection
                    name={name}
                    dateString={dateString}
                    certId={certificate.certId}
                    absoluteBadgeUrl={absoluteBadgeUrl}
                    logoUrl={logoUrl}
                    labels={labels}
                    courseTitle={courseTitle}
                    downloadLabel={t('download_certificate')}
                    linkedInUrl={linkedInUrl}
                    shareLinkedInLabel={t('share_linkedin')}
                    publicCertUrl={publicCertUrl}
                    viewCertificateLabel={
                        t('view_public_certificate') || 'View Certificate'
                    }
                />
            )}
        </div>
    );
};

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
    courseTitle,
    currentUserNames,
    badgePath,
    courseId,
    initialCertificate,
}) => {
    const { t, i18n } = useTranslation();
    const [certificate, setCertificate] = useState<SafeCertificate | null>(
        initialCertificate ?? null
    );
    const [customName, setCustomName] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const name = customName ?? certificate?.userName ?? currentUserNames ?? '';
    const submitted =
        Boolean(customName || certificate?.userName || currentUserNames) &&
        !isEditing;

    const syncCertificate = useCallback(async () => {
        if (!courseId) return;

        if (initialCertificate) {
            setCertificate(initialCertificate);
            return;
        }

        try {
            const res = await axios.get(
                `/api/certificates?courseId=${encodeURIComponent(courseId)}`
            );
            if (res.data && res.data.length > 0) {
                setCertificate(res.data[0]);
            } else if (currentUserNames && submitted) {
                const createRes = await axios.post('/api/certificates', {
                    courseId,
                    userName: currentUserNames,
                });
                setCertificate(createRes.data);
            }
        } catch (err) {
            console.error('Error fetching or auto-issuing certificate:', err);
        }
    }, [courseId, initialCertificate, currentUserNames, submitted]);

    useEffect(() => {
        syncCertificate();
    }, [syncCertificate]);

    const handleConfirmName = async (finalName: string) => {
        setIsSaving(true);
        setCustomName(finalName);
        setIsEditing(false);

        if (courseId) {
            try {
                const res = await axios.post('/api/certificates', {
                    courseId,
                    userName: finalName,
                });
                setCertificate(res.data);
                toast.success(
                    t('certificate_saved') || 'Certificate issued successfully!'
                );
            } catch (err: any) {
                console.error('Error saving certificate:', err);
                toast.error(
                    t('error_saving_certificate') ||
                        'Failed to issue certificate. Please try again.'
                );
            } finally {
                setIsSaving(false);
            }
        }
    };

    const pngBadgeUrl = useTranscodedBadgeUrl(badgePath);
    const labels = useCertificateLabels(courseTitle, t);
    const { dateString, publicCertUrl, linkedInUrl } = useCertificateUrls(
        certificate,
        courseTitle,
        i18n.language
    );

    const logoUrl = getAbsoluteUrl('/images/logo-nobg.png');
    const absoluteBadgeUrl =
        pngBadgeUrl || (badgePath ? getAbsoluteUrl(badgePath) : undefined);

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
                {t('contest_manager_course_details.download_your_certificate')}
            </h3>

            {!submitted ? (
                <CertificateNameForm
                    initialName={name}
                    isSaving={isSaving}
                    onConfirm={handleConfirmName}
                />
            ) : (
                <CertificateConfirmedSection
                    name={name}
                    certificate={certificate}
                    dateString={dateString}
                    absoluteBadgeUrl={absoluteBadgeUrl}
                    logoUrl={logoUrl}
                    labels={labels}
                    courseTitle={courseTitle}
                    linkedInUrl={linkedInUrl}
                    publicCertUrl={publicCertUrl}
                    onEditName={() => setIsEditing(true)}
                />
            )}
        </div>
    );
};

export default CertificateGenerator;
