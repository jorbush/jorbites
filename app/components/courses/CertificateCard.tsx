'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiClock, FiAward, FiCheckCircle } from 'react-icons/fi';
import Button from '@/app/components/buttons/Button';

interface CertificateCardProps {
    id: string;
    title: string;
    description: string;
    duration: string;
    progress: number; // Percentage (e.g. 80)
    slug: string;
    badgeSrc?: string;
    comingSoon?: boolean;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
    title,
    description,
    duration,
    progress,
    slug,
    badgeSrc,
    comingSoon = false,
}) => {
    const { t } = useTranslation();
    const router = useRouter();

    const isCompleted = progress === 100;
    const hasStarted = progress > 0;

    return (
        <div
            className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900 ${
                comingSoon
                    ? 'opacity-85'
                    : 'hover:-translate-y-1 hover:shadow-md'
            }`}
        >
            <div className="flex flex-col md:flex-row">
                {/* Image/Badge section */}
                <div className="bg-green-450/10 dark:bg-green-450/5 relative flex min-h-[160px] items-center justify-center p-6 md:w-48 md:flex-shrink-0">
                    <div className="relative flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
                        {badgeSrc ? (
                            <Image
                                src={badgeSrc}
                                alt={title}
                                width={112}
                                height={112}
                                className={`object-cover ${comingSoon ? 'opacity-50 grayscale' : ''}`}
                            />
                        ) : (
                            <div
                                className={`bg-green-450 flex size-full items-center justify-center text-neutral-950 ${comingSoon ? 'opacity-50 grayscale' : ''}`}
                            >
                                <FiAward
                                    className={`size-12 ${comingSoon ? '' : 'animate-pulse'}`}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content section */}
                <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                <FiClock className="size-3.5" />
                                {duration}
                            </span>
                            {comingSoon ? (
                                <span className="dark:bg-neutral-850 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                    {t('coming_soon')}
                                </span>
                            ) : (
                                isCompleted && (
                                    <span className="bg-green-450/20 dark:bg-green-450/10 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:text-green-300">
                                        <FiCheckCircle className="size-3.5" />
                                        Completed
                                    </span>
                                )
                            )}
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
                            {title}
                        </h3>
                        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
                            {description}
                        </p>
                    </div>

                    {/* Progress & button */}
                    <div className="space-y-4">
                        {!comingSoon && hasStarted && (
                            <div>
                                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full border border-neutral-300/20 bg-neutral-200 dark:border-neutral-700/20 dark:bg-neutral-800">
                                    <div
                                        className="bg-green-450 h-full rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <div className="w-fit">
                                <Button
                                    label={
                                        comingSoon
                                            ? t('coming_soon')
                                            : isCompleted
                                              ? t('course_completed')
                                              : hasStarted
                                                ? t('continue_course')
                                                : t('start_course')
                                    }
                                    onClick={() => {
                                        if (!comingSoon) {
                                            router.push(`/courses/${slug}`);
                                        }
                                    }}
                                    disabled={comingSoon}
                                    small
                                    outline={isCompleted || comingSoon}
                                    dataCy={`start-course-${slug}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateCard;
