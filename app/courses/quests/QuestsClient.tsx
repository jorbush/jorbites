'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiAward, FiBookOpen, FiLink, FiClock } from 'react-icons/fi';
import { FcTodoList } from 'react-icons/fc';
import { SafeUser } from '@/app/types';

import CourseTest from '@/app/components/courses/CourseTest';
import CourseLayout from '@/app/components/courses/CourseLayout';
import CourseInfoStep from '@/app/components/courses/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/CourseWorkflowStep';
import CourseCompleted from '@/app/components/courses/CourseCompleted';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import { questsQuestions } from './questsQuestions';
import useIsMounted from '@/app/hooks/useIsMounted';

import QuestsOverview from './QuestsOverview';

interface QuestsClientProps {
    currentUser?: SafeUser | null;
}

type StepId = 'requirements' | 'workflow' | 'linking' | 'statuses' | 'test';

const MODULES_KEY = 'jorbites_course_quests_modules:v2';
const PROGRESS_KEY = 'jorbites_course_quests_progress:v2';

const QuestsClient: React.FC<QuestsClientProps> = ({ currentUser }) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(
        () => ['requirements', 'workflow', 'linking', 'statuses', 'test'],
        []
    );

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(MODULES_KEY, PROGRESS_KEY, allStepIds);

    const steps = [
        {
            id: 'requirements',
            title: t('requirements'),
            icon: FiCheck,
            isCompleted: !!completedModules['requirements'],
        },
        {
            id: 'workflow',
            title: t('workflow'),
            icon: FiBookOpen,
            isCompleted: !!completedModules['workflow'],
        },
        {
            id: 'linking',
            title: t('linking') || 'Linking',
            icon: FiLink,
            isCompleted: !!completedModules['linking'],
        },
        {
            id: 'statuses',
            title: t('status') || 'Status',
            icon: FiClock,
            isCompleted: !!completedModules['statuses'],
        },
        {
            id: 'test',
            title: t('final_test'),
            icon: FiAward,
            isCompleted: isTestPassed,
        },
    ];

    if (!isMounted) {
        return null;
    }

    return (
        <CourseLayout
            courseTitle={t('course_quests') || 'Recipe Quests'}
            courseDescription={
                t('quests_course_details.course_description') ||
                'Learn how to request recipes, fulfill community quests, link recipes to open requests, and earn badges.'
            }
            headerIcon={FcTodoList}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            {/* 1. Requirements Checklist */}
            {activeStep === 'requirements' && (
                <QuestsOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            )}

            {/* 2. Walkthrough Steps */}
            {activeStep === 'workflow' && (
                <CourseWorkflowStep
                    title={
                        t('quests_course_details.workflow_title') ||
                        'Quests Workflow'
                    }
                    icon={FiBookOpen}
                    stepPrefix="quests_course_details.workflow_step"
                    totalSteps={5}
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('linking');
                    }}
                />
            )}

            {/* 3. Linking Solutions */}
            {activeStep === 'linking' && (
                <CourseInfoStep
                    title={
                        t('quests_course_details.linking_info_title') ||
                        'Linking Recipes & Solutions'
                    }
                    icon={FiLink}
                    paragraphs={[
                        t('quests_course_details.linking_desc1') ||
                            'To fulfill a quest, click into the specific quest details and use the "Link Recipe" option. You can search your published recipes and select the one that matches the request.',
                        t('quests_course_details.linking_desc2') ||
                            'Once linked, the quest status changes to In Progress, and the host is notified to review your cooking guide.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('linking');
                        setActiveStep('statuses');
                    }}
                />
            )}

            {/* 4. Status transitions */}
            {activeStep === 'statuses' && (
                <CourseInfoStep
                    title={
                        t('quests_course_details.status_info_title') ||
                        'Managing Quest Statuses'
                    }
                    icon={FiClock}
                    paragraphs={[
                        t('quests_course_details.status_desc1') ||
                            'Only the quest creator (host) can accept a linked recipe to close the quest. Accepting a recipe automatically transitions the quest status to Completed.',
                        t('quests_course_details.status_desc2') ||
                            'Completed quests remain visible in the archive, allowing the entire community to view and cook the successful recipes.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('statuses');
                        setActiveStep('test');
                    }}
                />
            )}

            {/* 5. Final Test */}
            {activeStep === 'test' && (
                <div className="space-y-6">
                    {!isTestPassed ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                            <CourseTest
                                questions={questsQuestions}
                                description={
                                    (t(
                                        'quests_course_details.final_test_description'
                                    ) as string) ||
                                    'Test your knowledge with 5 multiple-choice questions. You need at least 80% (4 correct answers) to pass and receive the Quests Certificate.'
                                }
                                onPass={() => markModuleCompleted('test')}
                            />
                        </div>
                    ) : (
                        <CourseCompleted
                            courseTitle="Recipe Quests Certificate"
                            currentUserNames={currentUser?.name}
                            badgePath="/badges/community_events_badge.jpg"
                        />
                    )}
                </div>
            )}
        </CourseLayout>
    );
};

export default QuestsClient;
