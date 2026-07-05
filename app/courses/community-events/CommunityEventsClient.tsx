'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiShare2,
    FiHelpCircle,
    FiCalendar,
} from 'react-icons/fi';
import { SafeUser } from '@/app/types';

import CourseTest from '@/app/components/courses/CourseTest';
import CourseLayout from '@/app/components/courses/CourseLayout';
import CourseInfoStep from '@/app/components/courses/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/CourseWorkflowStep';
import CourseCompleted from '@/app/components/courses/CourseCompleted';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import { communityEventsQuestions } from './communityEventsQuestions';
import useIsMounted from '@/app/hooks/useIsMounted';

import CommunityEventsOverview from './CommunityEventsOverview';

interface CommunityEventsClientProps {
    currentUser?: SafeUser | null;
}

type StepId =
    | 'overview'
    | 'challenges'
    | 'voting'
    | 'notifications'
    | 'mechanics'
    | 'benefits'
    | 'test';

const MODULES_KEY = 'jorbites_course_community_events_modules:v2';
const PROGRESS_KEY = 'jorbites_course_community_events_progress:v2';

const CommunityEventsClient: React.FC<CommunityEventsClientProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('overview');

    const allStepIds = useMemo(
        () => [
            'overview',
            'challenges',
            'voting',
            'notifications',
            'mechanics',
            'benefits',
            'test',
        ],
        []
    );

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(MODULES_KEY, PROGRESS_KEY, allStepIds);

    // Steps list configuration
    const steps = [
        {
            id: 'overview',
            title: t('requirements'),
            icon: FiCheck,
            isCompleted: !!completedModules['overview'],
        },
        {
            id: 'challenges',
            title: t('weekly_challenge'),
            icon: FiCalendar,
            isCompleted: !!completedModules['challenges'],
        },
        {
            id: 'voting',
            title: t('voting'),
            icon: FiShare2,
            isCompleted: !!completedModules['voting'],
        },
        {
            id: 'notifications',
            title: t('calendar_alerts'),
            icon: FiCalendar,
            isCompleted: !!completedModules['notifications'],
        },
        {
            id: 'mechanics',
            title: t('contest_mechanics'),
            icon: FiCheck,
            isCompleted: !!completedModules['mechanics'],
        },
        {
            id: 'benefits',
            title: t('benefits'),
            icon: FiAward,
            isCompleted: !!completedModules['benefits'],
        },
        {
            id: 'test',
            title: t('final_test'),
            icon: FiHelpCircle,
            isCompleted: isTestPassed,
        },
    ];

    if (!isMounted) {
        return null;
    }

    return (
        <CourseLayout
            courseTitle={t('community_events_course')}
            courseDescription={t(
                'community_events_course_details.course_description'
            )}
            headerIcon={FiBookOpen}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            {/* 1. Overview Checklist panel */}
            {activeStep === 'overview' && (
                <CommunityEventsOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('challenges')}
                />
            )}

            {/* 2. Challenges walkthrough panel */}
            {activeStep === 'challenges' && (
                <CourseWorkflowStep
                    title={t(
                        'community_events_course_details.challenges_title'
                    )}
                    icon={FiCalendar}
                    stepPrefix="community_events_course_details.challenges_step"
                    totalSteps={3}
                    onComplete={() => {
                        markModuleCompleted('challenges');
                        setActiveStep('voting');
                    }}
                />
            )}

            {/* 3. Voting panel */}
            {activeStep === 'voting' && (
                <CourseInfoStep
                    title={t('community_events_course_details.voting_title')}
                    icon={FiShare2}
                    paragraphs={[
                        t('community_events_course_details.voting_desc1'),
                        t('community_events_course_details.voting_desc2'),
                    ]}
                    onComplete={() => {
                        markModuleCompleted('voting');
                        setActiveStep('notifications');
                    }}
                />
            )}

            {/* 4. Calendar & Alerts panel */}
            {activeStep === 'notifications' && (
                <CourseInfoStep
                    title={t(
                        'community_events_course_details.notifications_title'
                    )}
                    icon={FiCalendar}
                    paragraphs={[
                        t(
                            'community_events_course_details.notifications_desc1'
                        ),
                        t(
                            'community_events_course_details.notifications_desc2'
                        ),
                    ]}
                    onComplete={() => {
                        markModuleCompleted('notifications');
                        setActiveStep('mechanics');
                    }}
                />
            )}

            {/* 5. Mechanics & Support panel */}
            {activeStep === 'mechanics' && (
                <CourseInfoStep
                    title={t('community_events_course_details.mechanics_title')}
                    icon={FiCheck}
                    paragraphs={[
                        t('community_events_course_details.mechanics_desc1'),
                        t('community_events_course_details.mechanics_desc2'),
                    ]}
                    onComplete={() => {
                        markModuleCompleted('mechanics');
                        setActiveStep('benefits');
                    }}
                />
            )}

            {/* 6. Benefits panel */}
            {activeStep === 'benefits' && (
                <CourseInfoStep
                    title={t('community_events_course_details.benefits_title')}
                    icon={FiAward}
                    onComplete={() => {
                        markModuleCompleted('benefits');
                        setActiveStep('test');
                    }}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {t(
                                    'community_events_course_details.benefits_desc1'
                                )}
                            </p>
                        </div>
                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {t(
                                    'community_events_course_details.benefits_desc2'
                                )}
                            </p>
                        </div>
                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {t(
                                    'community_events_course_details.benefits_desc3'
                                )}
                            </p>
                        </div>
                    </div>
                </CourseInfoStep>
            )}

            {/* 7. Quiz panel */}
            {activeStep === 'test' && (
                <div className="space-y-6">
                    {!isTestPassed ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                            <CourseTest
                                questions={communityEventsQuestions}
                                description={
                                    t(
                                        'community_events_course_details.final_test_description'
                                    ) as string
                                }
                                onPass={() => markModuleCompleted('test')}
                            />
                        </div>
                    ) : (
                        <CourseCompleted
                            courseTitle="Community Events Certificate"
                            currentUserNames={currentUser?.name}
                            badgePath="/badges/community_events_badge.jpg"
                        />
                    )}
                </div>
            )}
        </CourseLayout>
    );
};

export default CommunityEventsClient;
