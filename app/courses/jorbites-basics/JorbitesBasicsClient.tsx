'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiCheckCircle,
    FiSettings,
    FiSmartphone,
} from 'react-icons/fi';
import { FcDiploma1 } from 'react-icons/fc';
import { SafeUser } from '@/app/types';

import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseLayout from '@/app/components/courses/core/CourseLayout';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import { jorbitesBasicsQuestions } from './jorbitesBasicsQuestions';
import useIsMounted from '@/app/hooks/useIsMounted';

import JorbitesBasicsOverview from './JorbitesBasicsOverview';

interface JorbitesBasicsClientProps {
    currentUser?: SafeUser | null;
}

type StepId =
    | 'requirements'
    | 'workflow'
    | 'interactions'
    | 'settings'
    | 'pwa'
    | 'test';

const MODULES_KEY = 'jorbites_course_basics_modules:v2';
const PROGRESS_KEY = 'jorbites_course_basics_progress:v2';

const JorbitesBasicsClient: React.FC<JorbitesBasicsClientProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(
        () => [
            'requirements',
            'workflow',
            'interactions',
            'settings',
            'pwa',
            'test',
        ],
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
            id: 'interactions',
            title:
                t('jorbites_basics_course_details.req_interactions_label') ||
                'Interactions',
            icon: FiCheckCircle,
            isCompleted: !!completedModules['interactions'],
        },
        {
            id: 'settings',
            title: t('settings') || 'Settings & Theme',
            icon: FiSettings,
            isCompleted: !!completedModules['settings'],
        },
        {
            id: 'pwa',
            title:
                t('jorbites_basics_course_details.pwa_info_title') ||
                'PWA App & Notifications',
            icon: FiSmartphone,
            isCompleted: !!completedModules['pwa'],
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
            courseTitle={t('course_jorbites_basics') || 'Jorbites Basics'}
            courseDescription={
                t('jorbites_basics_course_details.course_description') ||
                'Master the fundamentals of Jorbites: searching recipes, liking and pinning content, organizing custom lists, and managing all profile preferences.'
            }
            headerIcon={FcDiploma1}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            {/* 1. Requirements Checklist */}
            {activeStep === 'requirements' && (
                <JorbitesBasicsOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            )}

            {/* 2. Walkthrough Steps */}
            {activeStep === 'workflow' && (
                <CourseWorkflowStep
                    title={
                        t('jorbites_basics_course_details.workflow_title') ||
                        'Basics Explorer Workflow'
                    }
                    icon={FiBookOpen}
                    stepPrefix="jorbites_basics_course_details.workflow_step"
                    totalSteps={5}
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('interactions');
                    }}
                />
            )}

            {/* 3. Likes, Pins, and Custom Lists */}
            {activeStep === 'interactions' && (
                <CourseInfoStep
                    title={
                        t(
                            'jorbites_basics_course_details.interactions_info_title'
                        ) || 'Likes, Pins, & Custom Lists'
                    }
                    icon={FiCheckCircle}
                    paragraphs={[
                        t('jorbites_basics_course_details.slots_desc1') ||
                            'Interacting with recipes helps the community grow. When you click the heart icon on a recipe page, you save it to your liked content and contribute to its standing in the "Top Recipe Vote". You can also click the pin button on a recipe, which promotes it directly onto your user profile cover header.',
                        t('jorbites_basics_course_details.slots_desc2') ||
                            'To keep recipes organized, visit your profile page and create a new Recipe List collection. You can specify a list title, description, and search/add recipes to it, making it easy to create theme folders like "Quick Breakfasts" or "Sunday Desserts".',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('interactions');
                        setActiveStep('settings');
                    }}
                />
            )}

            {/* 4. Settings Panel */}
            {activeStep === 'settings' && (
                <CourseInfoStep
                    title={
                        t(
                            'jorbites_basics_course_details.settings_info_title'
                        ) || 'Name, Themes, Languages & Notifications'
                    }
                    icon={FiSettings}
                    paragraphs={[
                        t('jorbites_basics_course_details.exports_desc1') ||
                            'The Jorbites Settings modal (accessible from the navigation dropdown menu) houses all user preferences. You can update your display name, toggle display languages (English, Spanish, or Catalan), and select your visual theme: Light Mode (clean white), Dark Mode (sleek premium navy/black), or System Default.',
                        t('jorbites_basics_course_details.exports_desc2') ||
                            'You can also manage Email Notifications in settings. Jorbites allows you to select which automated notifications you receive: toggle alert updates for community workshops, comment replies on your recipes, quest details, weekly digests, or newsletters to match your inbox preferences.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('settings');
                        setActiveStep('pwa');
                    }}
                />
            )}

            {/* 5. PWA Application */}
            {activeStep === 'pwa' && (
                <CourseInfoStep
                    title={
                        t('jorbites_basics_course_details.pwa_info_title') ||
                        'PWA Installation & App Notifications'
                    }
                    icon={FiSmartphone}
                    paragraphs={[
                        t('jorbites_basics_course_details.pwa_desc1') ||
                            "Jorbites is a Progressive Web App (PWA), meaning you can install it directly onto your smartphone's home screen. On iOS, open Safari, tap the 'Share' icon, scroll down, and select 'Add to Home Screen'. On Android, open Google Chrome, tap the three-dot menu button in the upper right corner, and select 'Install app' or 'Add to Home screen'.",
                        t('jorbites_basics_course_details.pwa_desc2') ||
                            'Once installed on your phone, Jorbites functions like a native application. Under settings, you can enable native Mobile Push Notifications to get instant updates about new workshops, comments replies, and active quest reminders directly on your lock screen.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('pwa');
                        setActiveStep('test');
                    }}
                />
            )}

            {/* 6. Final Test */}
            {activeStep === 'test' && (
                <div className="space-y-6">
                    {!isTestPassed ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                            <CourseTest
                                questions={jorbitesBasicsQuestions}
                                description={
                                    (t(
                                        'jorbites_basics_course_details.final_test_description'
                                    ) as string) ||
                                    'Test your knowledge with 6 multiple-choice questions. You need at least 80% (5 correct answers) to pass and receive the Jorbites Basics Certificate.'
                                }
                                onPass={() => markModuleCompleted('test')}
                            />
                        </div>
                    ) : (
                        <CourseCompleted
                            courseTitle="Jorbites Basics Certificate"
                            currentUserNames={currentUser?.name}
                            badgePath="/badges/recipe_lists_badge_1783155223621.jpg"
                        />
                    )}
                </div>
            )}
        </CourseLayout>
    );
};

export default JorbitesBasicsClient;
