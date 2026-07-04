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
                    {/* 1. Jorbites Basics */}
                    <CertificateCard
                        id="jorbites-basics"
                        title={t('course_jorbites_basics')}
                        description={t('course_jorbites_basics_desc')}
                        duration="15 mins"
                        progress={0}
                        slug="jorbites-basics"
                        comingSoon
                    />

                    {/* 2. Recipe Creator */}
                    <CertificateCard
                        id="recipe-creator"
                        title={t('course_recipe_creator')}
                        description={t('course_recipe_creator_desc')}
                        duration="30 mins"
                        progress={0}
                        slug="recipe-creator"
                        comingSoon
                    />

                    {/* 3. Recipe Lists */}
                    <CertificateCard
                        id="recipe-lists"
                        title={t('course_recipe_lists')}
                        description={t('course_recipe_lists_desc')}
                        duration="30 mins"
                        progress={0}
                        slug="recipe-lists"
                        comingSoon
                    />

                    {/* 4. Meal Planner */}
                    <CertificateCard
                        id="meal-planner"
                        title={t('course_meal_planner')}
                        description={t('course_meal_planner_desc')}
                        duration="45 mins"
                        progress={0}
                        slug="meal-planner"
                        comingSoon
                    />

                    {/* 5. Community Events */}
                    <CertificateCard
                        id="community-events"
                        title={t('course_community_events')}
                        description={t('course_community_events_desc')}
                        duration="45 mins"
                        progress={0}
                        slug="community-events"
                        comingSoon
                    />

                    {/* 6. Workshops & Classes */}
                    <CertificateCard
                        id="workshops"
                        title={t('course_workshops')}
                        description={t('course_workshops_desc')}
                        duration="1 hour"
                        progress={0}
                        slug="workshops"
                        comingSoon
                    />

                    {/* 7. Recipe Book Builder */}
                    <CertificateCard
                        id="recipe-book-builder"
                        title={t('course_recipe_book_builder')}
                        description={t('course_recipe_book_builder_desc')}
                        duration="1 hour"
                        progress={0}
                        slug="recipe-book-builder"
                        comingSoon
                    />

                    {/* 8. Contest Manager */}
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
