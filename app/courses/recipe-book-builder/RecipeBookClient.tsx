'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiSliders,
    FiList,
} from 'react-icons/fi';
import { FcFolder } from 'react-icons/fc';
import { SafeUser } from '@/app/types';

import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseLayout from '@/app/components/courses/core/CourseLayout';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import { recipeBookQuestions } from './recipeBookQuestions';
import useIsMounted from '@/app/hooks/useIsMounted';

import RecipeBookOverview from './RecipeBookOverview';

interface RecipeBookClientProps {
    currentUser?: SafeUser | null;
}

type StepId = 'requirements' | 'workflow' | 'styles' | 'selection' | 'test';

const MODULES_KEY = 'jorbites_course_recipe_book_modules:v2';
const PROGRESS_KEY = 'jorbites_course_recipe_book_progress:v2';

const RecipeBookClient: React.FC<RecipeBookClientProps> = ({ currentUser }) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(
        () => ['requirements', 'workflow', 'styles', 'selection', 'test'],
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
            id: 'styles',
            title: t('recipe_book_course_details.req_styles_label') || 'Styles',
            icon: FiSliders,
            isCompleted: !!completedModules['styles'],
        },
        {
            id: 'selection',
            title:
                t('recipe_book_course_details.req_selection_label') ||
                'Selection',
            icon: FiList,
            isCompleted: !!completedModules['selection'],
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
            courseTitle={
                t('course_recipe_book_builder') || 'Recipe Book Builder'
            }
            courseDescription={
                t('recipe_book_course_details.course_description') ||
                'Learn how to customize layouts, choose fonts, select recipes, and compile a custom recipe book PDF.'
            }
            headerIcon={FcFolder}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            {/* 1. Requirements Checklist */}
            {activeStep === 'requirements' && (
                <RecipeBookOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            )}

            {/* 2. Walkthrough Steps */}
            {activeStep === 'workflow' && (
                <CourseWorkflowStep
                    title={
                        t('recipe_book_course_details.workflow_title') ||
                        'Book Builder Workflow'
                    }
                    icon={FiBookOpen}
                    stepPrefix="recipe_book_course_details.workflow_step"
                    totalSteps={5}
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('styles');
                    }}
                />
            )}

            {/* 3. Styles Config */}
            {activeStep === 'styles' && (
                <CourseInfoStep
                    title={
                        t('recipe_book_course_details.styles_info_title') ||
                        'Customizing Styles & Themes'
                    }
                    icon={FiSliders}
                    paragraphs={[
                        t('recipe_book_course_details.styles_desc1') ||
                            'The configuration step allows you to select from three distinct cover layouts: "Minimal" (clean and modern), "Elegant" (refined serif typography), and "Cozy" (warm and decorative).',
                        t('recipe_book_course_details.styles_desc2') ||
                            'You can also control image display formatting: choose "Full Page" for large images, "Thumbnail" for compact list grids, or "No Images" to optimize for text-only printing.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('styles');
                        setActiveStep('selection');
                    }}
                />
            )}

            {/* 4. Selection & Limits */}
            {activeStep === 'selection' && (
                <CourseInfoStep
                    title={
                        t('recipe_book_course_details.selection_info_title') ||
                        'Recipe Selection & Limits'
                    }
                    icon={FiList}
                    paragraphs={[
                        t('recipe_book_course_details.selection_desc1') ||
                            'The selection step lists all recipes matching your current profile context. Check the boxes next to the recipes you wish to export into your PDF.',
                        t('recipe_book_course_details.selection_desc2') ||
                            'Please note that recipe book generation is subject to rate-limiting to prevent server overload. Make sure to review your selection before building.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('selection');
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
                                questions={recipeBookQuestions}
                                description={
                                    (t(
                                        'recipe_book_course_details.final_test_description'
                                    ) as string) ||
                                    'Test your knowledge with 5 multiple-choice questions. You need at least 80% (4 correct answers) to pass and receive the Recipe Book Builder Certificate.'
                                }
                                onPass={() => markModuleCompleted('test')}
                            />
                        </div>
                    ) : (
                        <CourseCompleted
                            courseTitle="Recipe Book Builder Certificate"
                            currentUserNames={currentUser?.name}
                            badgePath="/badges/recipe_lists_badge_1783155223621.jpg"
                        />
                    )}
                </div>
            )}
        </CourseLayout>
    );
};

export default RecipeBookClient;
