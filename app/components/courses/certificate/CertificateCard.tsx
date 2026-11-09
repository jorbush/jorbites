'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { FiClock } from 'react-icons/fi';
import CertificateBadge from '@/app/components/courses/certificate/CertificateBadge';
import CertificateProgress from '@/app/components/courses/certificate/CertificateProgress';
import CertificateActions from '@/app/components/courses/certificate/CertificateActions';

interface CertificateCardProps {
    id: string;
    title: string;
    description: string;
    duration: string;
    progress: number; // Percentage (e.g. 80)
    slug: string;
    badgeSrc?: string;
    comingSoon?: boolean;
    certificateId?: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
    title,
    description,
    duration,
    progress,
    slug,
    badgeSrc,
    comingSoon = false,
    certificateId,
}) => {
    const { t } = useTranslation();
    const { push } = useRouter();

    const isCompleted = progress === 100;
    const hasStarted = progress > 0 && progress < 100;
    const showProgressBar = !comingSoon && hasStarted;

    const handleNavigateCourse = () => {
        if (!comingSoon) {
            push(`/courses/${slug}`);
        }
    };

    const handleViewCertificate = () => {
        if (certificateId) {
            push(`/certificates/${certificateId}`);
        }
    };

    return (
        <div
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-2xs backdrop-blur-xs transition-[transform,border-color,box-shadow] duration-300 ease-out dark:border-neutral-800/80 dark:bg-neutral-900/60 ${
                comingSoon
                    ? 'opacity-80'
                    : 'hover:scale-102 hover:border-neutral-300 hover:shadow-xs dark:hover:border-neutral-700'
            }`}
            data-testid="certificate-card"
        >
            <div className="flex flex-col gap-4">
                {/* Image/Badge Header Showcase */}
                <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-100/80 bg-gradient-to-b from-neutral-50/90 to-neutral-100/60 p-5 dark:border-neutral-800/60 dark:from-neutral-800/50 dark:to-neutral-800/20">
                    {/* Duration Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/95 px-2.5 py-1 text-xs font-medium text-neutral-600 shadow-2xs backdrop-blur-xs dark:border-neutral-700/80 dark:bg-neutral-900/90 dark:text-neutral-300">
                        <FiClock className="size-3 text-neutral-500 dark:text-neutral-400" />
                        <span data-testid="card-duration">{duration}</span>
                    </div>

                    {/* Status Pill on Top-Right */}
                    {comingSoon && (
                        <div className="absolute top-3 right-3 rounded-full border border-neutral-200/80 bg-white/95 px-2.5 py-1 text-xs font-semibold text-neutral-600 shadow-2xs backdrop-blur-xs dark:border-neutral-700/80 dark:bg-neutral-900/90 dark:text-neutral-400">
                            {String(t('coming_soon'))}
                        </div>
                    )}

                    {/* Badge Emblem */}
                    <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-neutral-800 dark:bg-neutral-800">
                        <CertificateBadge
                            badgeSrc={badgeSrc}
                            title={title}
                            comingSoon={comingSoon}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                    <h3
                        className="line-clamp-1 text-lg font-bold tracking-tight text-neutral-900 dark:text-white"
                        data-testid="card-title"
                    >
                        {title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {description}
                    </p>
                </div>
            </div>

            {/* Progress & Actions Section */}
            <div className="mt-5 space-y-4">
                {showProgressBar && <CertificateProgress progress={progress} />}

                <CertificateActions
                    slug={slug}
                    certificateId={certificateId}
                    isCompleted={isCompleted}
                    hasStarted={hasStarted}
                    comingSoon={comingSoon}
                    onViewCertificate={handleViewCertificate}
                    onNavigateCourse={handleNavigateCourse}
                />
            </div>
        </div>
    );
};

export default CertificateCard;
