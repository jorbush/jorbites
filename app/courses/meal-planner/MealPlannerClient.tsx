'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiCalendar,
    FiDownload,
} from 'react-icons/fi';
import { FcPlanner } from 'react-icons/fc';
import { SafeUser } from '@/app/types';

import CourseTest from '@/app/components/courses/CourseTest';
import CourseLayout from '@/app/components/courses/CourseLayout';
import CourseInfoStep from '@/app/components/courses/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/CourseWorkflowStep';
import CourseCompleted from '@/app/components/courses/CourseCompleted';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import { mealPlannerQuestions } from './mealPlannerQuestions';
import useIsMounted from '@/app/hooks/useIsMounted';

import MealPlannerOverview from './MealPlannerOverview';

interface MealPlannerClientProps {
    currentUser?: SafeUser | null;
}

type StepId = 'requirements' | 'workflow' | 'slots' | 'exports' | 'test';

const MODULES_KEY = 'jorbites_course_meal_planner_modules:v2';
const PROGRESS_KEY = 'jorbites_course_meal_planner_progress:v2';

const MealPlannerClient: React.FC<MealPlannerClientProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(
        () => ['requirements', 'workflow', 'slots', 'exports', 'test'],
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
            id: 'slots',
            title: t('meals') || 'Diet Slots',
            icon: FiCalendar,
            isCompleted: !!completedModules['slots'],
        },
        {
            id: 'exports',
            title: t('calendar_alerts') || 'Sync & Lists',
            icon: FiDownload,
            isCompleted: !!completedModules['exports'],
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
            courseTitle={t('course_meal_planner') || 'Meal Planner'}
            courseDescription={
                t('meal_planner_course_details.course_description') ||
                'Learn how to build weekly meal plans, assign recipes to breakfast/lunch/dinner, generate automated shopping lists, and sync with external calendars.'
            }
            headerIcon={FcPlanner}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            {/* 1. Requirements Checklist */}
            {activeStep === 'requirements' && (
                <MealPlannerOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            )}

            {/* 2. Walkthrough Steps */}
            {activeStep === 'workflow' && (
                <CourseWorkflowStep
                    title={
                        t('meal_planner_course_details.workflow_title') ||
                        'Meal Planner Workflow'
                    }
                    icon={FiBookOpen}
                    stepPrefix="meal_planner_course_details.workflow_step"
                    totalSteps={5}
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('slots');
                    }}
                />
            )}

            {/* 3. Diet Grid Slots */}
            {activeStep === 'slots' && (
                <CourseInfoStep
                    title={
                        t('meal_planner_course_details.slots_info_title') ||
                        'Scheduling & Diet Slots'
                    }
                    icon={FiCalendar}
                    paragraphs={[
                        t('meal_planner_course_details.slots_desc1') ||
                            'The planner is structured as a 7-day grid (Monday to Sunday) containing 4 meal slots: Breakfast, Lunch, Dinner, and Snack. Click the "+" button in any slot to search and add a recipe.',
                        t('meal_planner_course_details.slots_desc2') ||
                            'You can add up to 4 recipes per slot. Owners can edit names/descriptions, toggle privacy settings, and remove recipes by clicking the trash icon next to the recipe name.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('slots');
                        setActiveStep('exports');
                    }}
                />
            )}

            {/* 4. Lists & Syncing */}
            {activeStep === 'exports' && (
                <CourseInfoStep
                    title={
                        t('meal_planner_course_details.exports_info_title') ||
                        'Shopping Lists & Calendar Syncing'
                    }
                    icon={FiDownload}
                    paragraphs={[
                        t('meal_planner_course_details.exports_desc1') ||
                            'The Shopping List tool compiles all ingredients from all recipes added to your plan. You can view the list, print it, or use it while grocery shopping.',
                        t('meal_planner_course_details.exports_desc2') ||
                            'To stay on track, use "Export Calendar" to sync your diet plan with Google Calendar or Apple Calendar. Jorbites sends notifications on Mondays for the new week and warnings 3 days prior.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('exports');
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
                                questions={mealPlannerQuestions}
                                description={
                                    (t(
                                        'meal_planner_course_details.final_test_description'
                                    ) as string) ||
                                    'Test your knowledge with 5 multiple-choice questions. You need at least 80% (4 correct answers) to pass and receive the Meal Planner Certificate.'
                                }
                                onPass={() => markModuleCompleted('test')}
                            />
                        </div>
                    ) : (
                        <CourseCompleted
                            courseTitle="Meal Planner Certificate"
                            currentUserNames={currentUser?.name}
                            badgePath="/badges/recipe_lists_badge_1783155223621.jpg"
                        />
                    )}
                </div>
            )}
        </CourseLayout>
    );
};

export default MealPlannerClient;
