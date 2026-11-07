'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeCertificate, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import CertificateCard from '@/app/components/courses/certificate/CertificateCard';
import { FcDiploma1 } from 'react-icons/fc';

import useIsMounted from '@/app/hooks/useIsMounted';
import { useAllCoursesProgress } from '@/app/hooks/useAllCoursesProgress';

interface CoursesClientProps {
    currentUser?: SafeUser | null;
    certificates?: SafeCertificate[];
}

const CoursesClient: React.FC<CoursesClientProps> = ({
    currentUser: _currentUser,
    certificates,
}) => {
    const { t } = useTranslation();
    const { progress } = useAllCoursesProgress(certificates);

    const certMap = useMemo(() => {
        const map = new Map<string, SafeCertificate>();
        (certificates || []).forEach((cert) => {
            map.set(cert.courseId, cert);
        });
        return map;
    }, [certificates]);

    const isMounted = useIsMounted();

    if (!isMounted) {
        return null;
    }

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4">
                {/* Header */}
                <div className="flex items-center gap-3.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                        <FcDiploma1 size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                            {t('courses')}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t('courses_description')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* 1. Jorbites Basics */}
                    <CertificateCard
                        id="jorbites-basics"
                        title={t('course_jorbites_basics')}
                        description={t('course_jorbites_basics_desc')}
                        duration={t('duration_minutes', { count: 15 })}
                        progress={
                            certMap.has('jorbites-basics')
                                ? 100
                                : progress.basics
                        }
                        slug="jorbites-basics"
                        badgeSrc="/badges/basics_badge.webp"
                        certificateId={certMap.get('jorbites-basics')?.certId}
                    />

                    {/* 2. Recipe Creator */}
                    <CertificateCard
                        id="recipe-creator"
                        title={t('course_recipe_creator')}
                        description={t('course_recipe_creator_desc')}
                        duration={t('duration_minutes', { count: 30 })}
                        progress={
                            certMap.has('recipe-creator')
                                ? 100
                                : progress.recipeCreator
                        }
                        slug="recipe-creator"
                        badgeSrc="/badges/recipe_creator_badge.webp"
                        certificateId={certMap.get('recipe-creator')?.certId}
                    />

                    {/* 3. Recipe Lists */}
                    <CertificateCard
                        id="recipe-lists"
                        title={t('course_recipe_lists')}
                        description={t('course_recipe_lists_desc')}
                        duration={t('duration_minutes', { count: 30 })}
                        progress={
                            certMap.has('recipe-lists') ? 100 : progress.lists
                        }
                        slug="recipe-lists"
                        badgeSrc="/badges/recipe_lists_badge.webp"
                        certificateId={certMap.get('recipe-lists')?.certId}
                    />

                    {/* 4. Meal Planner */}
                    <CertificateCard
                        id="meal-planner"
                        title={t('course_meal_planner')}
                        description={t('course_meal_planner_desc')}
                        duration={t('duration_minutes', { count: 45 })}
                        progress={
                            certMap.has('meal-planner')
                                ? 100
                                : progress.mealPlanner
                        }
                        slug="meal-planner"
                        badgeSrc="/badges/meal_planner_badge.webp"
                        certificateId={certMap.get('meal-planner')?.certId}
                    />

                    {/* 5. Community Events */}
                    <CertificateCard
                        id="community-events"
                        title={t('course_community_events')}
                        description={t('course_community_events_desc')}
                        duration={t('duration_minutes', { count: 45 })}
                        progress={
                            certMap.has('community-events')
                                ? 100
                                : progress.events
                        }
                        slug="community-events"
                        badgeSrc="/badges/community_events_badge.webp"
                        certificateId={certMap.get('community-events')?.certId}
                    />

                    {/* 6. Workshops & Classes */}
                    <CertificateCard
                        id="workshops"
                        title={t('course_workshops')}
                        description={t('course_workshops_desc')}
                        duration={t('duration_hours', { count: 1 })}
                        progress={
                            certMap.has('workshops') ? 100 : progress.workshops
                        }
                        slug="workshops"
                        badgeSrc="/badges/workshops_badge.webp"
                        certificateId={certMap.get('workshops')?.certId}
                    />

                    {/* 6b. Recipe Quests */}
                    <CertificateCard
                        id="quests"
                        title={t('course_quests') || 'Recipe Quests'}
                        description={t('course_quests_desc')}
                        duration={t('duration_minutes', { count: 30 })}
                        progress={certMap.has('quests') ? 100 : progress.quests}
                        slug="quests"
                        badgeSrc="/badges/quests_badge.webp"
                        certificateId={certMap.get('quests')?.certId}
                    />

                    {/* 7. Recipe Book Builder */}
                    <CertificateCard
                        id="recipe-book-builder"
                        title={t('course_recipe_book_builder')}
                        description={t('course_recipe_book_builder_desc')}
                        duration={t('duration_hours', { count: 1 })}
                        progress={
                            certMap.has('recipe-book-builder')
                                ? 100
                                : progress.recipeBook
                        }
                        slug="recipe-book-builder"
                        badgeSrc="/badges/recipe_book_badge.webp"
                        certificateId={
                            certMap.get('recipe-book-builder')?.certId
                        }
                    />

                    {/* 8. Contest Manager */}
                    <CertificateCard
                        id="contest-manager"
                        title={t('contest_manager_course')}
                        description={t('contest_manager_description')}
                        duration={t('duration_hours', { count: 2 })}
                        progress={
                            certMap.has('contest-manager')
                                ? 100
                                : progress.contest
                        }
                        slug="contest-manager"
                        badgeSrc="/badges/contest_manager_badge.webp"
                        certificateId={certMap.get('contest-manager')?.certId}
                    />

                    {/* 9. Recipe Drafts & Collaboration */}
                    <CertificateCard
                        id="drafts"
                        title={t('course_drafts')}
                        description={t('course_drafts_desc')}
                        duration={t('duration_hours', { count: 2 })}
                        progress={certMap.has('drafts') ? 100 : progress.drafts}
                        slug="drafts"
                        badgeSrc="/badges/drafts_badge.webp"
                        certificateId={certMap.get('drafts')?.certId}
                    />
                </div>
            </div>
        </Container>
    );
};

export default CoursesClient;
