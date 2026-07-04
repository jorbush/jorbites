'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import SectionHeader from '@/app/components/utils/SectionHeader';
import CertificateCard from '@/app/components/courses/CertificateCard';
import { FcDiploma1 } from 'react-icons/fc';

import useIsMounted from '@/app/hooks/useIsMounted';

interface CoursesClientProps {
    currentUser?: SafeUser | null;
}

const CoursesClient: React.FC<CoursesClientProps> = ({
    currentUser: _currentUser,
}) => {
    const { t } = useTranslation();
    const [progress] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_contest_manager_progress:v2'
        );
        return stored ? parseInt(stored, 10) : 0;
    });
    const isMounted = useIsMounted();

    if (!isMounted) {
        return null;
    }

    return (
        <Container>
            <div className="px-4 py-8">
                <SectionHeader
                    icon={FcDiploma1}
                    title={t('courses')}
                    description={t('courses_description')}
                />

                <div className="mx-auto max-w-4xl space-y-6">
                    <CertificateCard
                        id="contest-manager"
                        title={t('contest_manager_course')}
                        description={t('contest_manager_description')}
                        duration="2 hours"
                        progress={progress}
                        slug="contest-manager"
                        badgeSrc="/badges/contest_manager_badge.jpg"
                    />
                </div>
            </div>
        </Container>
    );
};

export default CoursesClient;
