'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiAward } from 'react-icons/fi';
import CertificateGenerator from './CertificateGenerator';

interface CourseCompletedProps {
    courseTitle: string;
    currentUserNames?: string | null;
    badgePath: string;
}

const CourseCompleted: React.FC<CourseCompletedProps> = ({
    courseTitle,
    currentUserNames,
    badgePath,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-green-200 bg-green-50/20 p-6 text-center dark:border-green-950/20 dark:bg-green-950/5">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <FiAward className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {t('pass_message')}
                </h3>
            </div>

            <CertificateGenerator
                courseTitle={courseTitle}
                currentUserNames={currentUserNames}
                badgePath={badgePath}
            />
        </div>
    );
};

export default CourseCompleted;
