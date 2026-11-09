'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/app/components/buttons/Button';

export interface CertificateActionsProps {
    slug: string;
    certificateId?: string;
    isCompleted: boolean;
    hasStarted: boolean;
    comingSoon?: boolean;
    onViewCertificate?: () => void;
    onNavigateCourse?: () => void;
}

export const getActionLabel = (
    t: (key: string) => string,
    comingSoon: boolean,
    isCompleted: boolean,
    hasStarted: boolean
): string => {
    if (comingSoon) return String(t('coming_soon'));
    if (isCompleted) return String(t('course_completed'));
    if (hasStarted) return String(t('continue_course'));
    return String(t('start_course'));
};

const CertificateActions: React.FC<CertificateActionsProps> = ({
    slug,
    certificateId,
    isCompleted,
    hasStarted,
    comingSoon = false,
    onViewCertificate,
    onNavigateCourse,
}) => {
    const { t } = useTranslation();

    const actionLabel = getActionLabel(t, comingSoon, isCompleted, hasStarted);

    return (
        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
            {isCompleted && certificateId && (
                <div className="flex-1">
                    <Button
                        label={String(
                            t('view_certificate') || 'View Certificate'
                        )}
                        onClick={onViewCertificate}
                        small
                        outline
                        className="w-full"
                        dataCy={`view-certificate-${slug}`}
                    />
                </div>
            )}
            <div className="flex-1">
                <Button
                    label={actionLabel}
                    onClick={onNavigateCourse}
                    disabled={comingSoon}
                    small
                    outline={isCompleted || comingSoon}
                    className="w-full"
                    dataCy={`start-course-${slug}`}
                />
            </div>
        </div>
    );
};

export default CertificateActions;
