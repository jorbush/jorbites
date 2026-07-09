'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import SectionHeader from '@/app/components/utils/SectionHeader';
import CertificateCard from '@/app/components/courses/certificate/CertificateCard';
import { FcDiploma1 } from 'react-icons/fc';

import useIsMounted from '@/app/hooks/useIsMounted';

interface CoursesClientProps {
    currentUser?: SafeUser | null;
}

const CoursesClient: React.FC<CoursesClientProps> = ({
    currentUser: _currentUser,
}) => {
    const { t } = useTranslation();

    const [progressContest] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_contest_manager_progress:v2'
        );
        return stored ? parseInt(stored, 10) : 0;
    });

    const [progressLists] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_recipe_lists_progress:v2'
        );
        return stored ? parseInt(stored, 10) : 0;
    });

    const [progressEvents] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_community_events_progress:v2'
        );
        return stored ? parseInt(stored, 10) : 0;
    });

    const [progressWorkshops] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_workshops_progress:v2'
        );
        return stored ? parseInt(stored, 10) : 0;
    });

    const [progressQuests] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_quests_progress:v2'
        );
        return stored ? parseInt(stored, 10) : 0;
    });

    const [progressRecipeCreator] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_recipe_creator_progress:v2'
        );
        return stored ? parseInt(stored, 10) : 0;
    });

    const [progressRecipeBook] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_recipe_book_progress:v2'
        );
        return stored ? parseInt(stored, 10) : 0;
    });

    const [progressMealPlanner] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_meal_planner_progress:v2'
        );
        return stored ? parseInt(stored, 10) : 0;
    });

    const [progressBasics] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const stored = localStorage.getItem(
            'jorbites_course_basics_progress:v2'
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
                        duration={t('duration_minutes', { count: 15 })}
                        progress={progressBasics}
                        slug="jorbites-basics"
                        badgeSrc="/badges/basics_badge.webp"
                    />

                    {/* 2. Recipe Creator */}
                    <CertificateCard
                        id="recipe-creator"
                        title={t('course_recipe_creator')}
                        description={t('course_recipe_creator_desc')}
                        duration={t('duration_minutes', { count: 30 })}
                        progress={progressRecipeCreator}
                        slug="recipe-creator"
                        badgeSrc="/badges/recipe_creator_badge.webp"
                    />

                    {/* 3. Recipe Lists */}
                    <CertificateCard
                        id="recipe-lists"
                        title={t('course_recipe_lists')}
                        description={t('course_recipe_lists_desc')}
                        duration={t('duration_minutes', { count: 30 })}
                        progress={progressLists}
                        slug="recipe-lists"
                        badgeSrc="/badges/recipe_lists_badge.webp"
                    />

                    {/* 4. Meal Planner */}
                    <CertificateCard
                        id="meal-planner"
                        title={t('course_meal_planner')}
                        description={t('course_meal_planner_desc')}
                        duration={t('duration_minutes', { count: 45 })}
                        progress={progressMealPlanner}
                        slug="meal-planner"
                        badgeSrc="/badges/meal_planner_badge.webp"
                    />

                    {/* 5. Community Events */}
                    <CertificateCard
                        id="community-events"
                        title={t('course_community_events')}
                        description={t('course_community_events_desc')}
                        duration={t('duration_minutes', { count: 45 })}
                        progress={progressEvents}
                        slug="community-events"
                        badgeSrc="/badges/community_events_badge.webp"
                    />

                    {/* 6. Workshops & Classes */}
                    <CertificateCard
                        id="workshops"
                        title={t('course_workshops')}
                        description={t('course_workshops_desc')}
                        duration={t('duration_hours', { count: 1 })}
                        progress={progressWorkshops}
                        slug="workshops"
                        badgeSrc="/badges/workshops_badge.webp"
                    />

                    {/* 6b. Recipe Quests */}
                    <CertificateCard
                        id="quests"
                        title={t('course_quests') || 'Recipe Quests'}
                        description={t('course_quests_desc')}
                        duration={t('duration_minutes', { count: 30 })}
                        progress={progressQuests}
                        slug="quests"
                        badgeSrc="/badges/quests_badge.webp"
                    />

                    {/* 7. Recipe Book Builder */}
                    <CertificateCard
                        id="recipe-book-builder"
                        title={t('course_recipe_book_builder')}
                        description={t('course_recipe_book_builder_desc')}
                        duration={t('duration_hours', { count: 1 })}
                        progress={progressRecipeBook}
                        slug="recipe-book-builder"
                        badgeSrc="/badges/recipe_book_badge.webp"
                    />

                    {/* 8. Contest Manager */}
                    <CertificateCard
                        id="contest-manager"
                        title={t('contest_manager_course')}
                        description={t('contest_manager_description')}
                        duration={t('duration_hours', { count: 2 })}
                        progress={progressContest}
                        slug="contest-manager"
                        badgeSrc="/badges/contest_manager_badge.webp"
                    />
                </div>
            </div>
        </Container>
    );
};

export default CoursesClient;
