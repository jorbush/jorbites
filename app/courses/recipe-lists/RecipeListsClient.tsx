'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiBookOpen, FiShare2, FiHelpCircle } from 'react-icons/fi';
import { PiListPlusBold } from 'react-icons/pi';
import { SafeUser } from '@/app/types';

import CourseTest from '@/app/components/courses/CourseTest';
import CourseLayout from '@/app/components/courses/CourseLayout';
import CourseInfoStep from '@/app/components/courses/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/CourseWorkflowStep';
import CourseCompleted from '@/app/components/courses/CourseCompleted';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import { recipeListsQuestions } from './recipeListsQuestions';
import useIsMounted from '@/app/hooks/useIsMounted';

import RecipeListsOverview from './RecipeListsOverview';

interface RecipeListsClientProps {
    currentUser?: SafeUser | null;
}

type StepId = 'overview' | 'creation' | 'sharing' | 'test';

const MODULES_KEY = 'jorbites_course_recipe_lists_modules:v2';
const PROGRESS_KEY = 'jorbites_course_recipe_lists_progress:v2';

const RecipeListsClient: React.FC<RecipeListsClientProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('overview');

    const allStepIds = useMemo(
        () => ['overview', 'creation', 'sharing', 'test'],
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
            id: 'creation',
            title: t('workflow'),
            icon: PiListPlusBold,
            isCompleted: !!completedModules['creation'],
        },
        {
            id: 'sharing',
            title: t('sharing'),
            icon: FiShare2,
            isCompleted: !!completedModules['sharing'],
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
            courseTitle={t('recipe_lists_course')}
            courseDescription={t(
                'recipe_lists_course_details.course_description'
            )}
            headerIcon={FiBookOpen}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            {/* 1. Overview Checklist panel */}
            {activeStep === 'overview' && (
                <RecipeListsOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('creation')}
                />
            )}

            {/* 2. Creation walkthrough panel */}
            {activeStep === 'creation' && (
                <CourseWorkflowStep
                    title={t('recipe_lists_course_details.workflow_title')}
                    icon={PiListPlusBold}
                    stepPrefix="recipe_lists_course_details.workflow_step"
                    totalSteps={5}
                    onComplete={() => {
                        markModuleCompleted('creation');
                        setActiveStep('sharing');
                    }}
                />
            )}

            {/* 3. Sharing panel */}
            {activeStep === 'sharing' && (
                <CourseInfoStep
                    title={t('recipe_lists_course_details.sharing_title')}
                    icon={FiShare2}
                    paragraphs={[
                        t('recipe_lists_course_details.sharing_desc1'),
                        t('recipe_lists_course_details.sharing_desc2'),
                    ]}
                    onComplete={() => {
                        markModuleCompleted('sharing');
                        setActiveStep('test');
                    }}
                />
            )}

            {/* 4. Quiz panel */}
            {activeStep === 'test' && (
                <div className="space-y-6">
                    {!isTestPassed ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                            <CourseTest
                                questions={recipeListsQuestions}
                                description={
                                    t(
                                        'recipe_lists_course_details.final_test_description'
                                    ) as string
                                }
                                onPass={() => markModuleCompleted('test')}
                            />
                        </div>
                    ) : (
                        <CourseCompleted
                            courseTitle="Recipe Lists Certificate"
                            currentUserNames={currentUser?.name}
                            badgePath="/badges/recipe_lists_badge.jpg"
                        />
                    )}
                </div>
            )}
        </CourseLayout>
    );
};

export default RecipeListsClient;
