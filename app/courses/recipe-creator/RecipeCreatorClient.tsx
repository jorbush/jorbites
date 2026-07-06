'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiFileText,
    FiSave,
} from 'react-icons/fi';
import { FcSupport } from 'react-icons/fc';
import { SafeUser } from '@/app/types';

import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseLayout from '@/app/components/courses/core/CourseLayout';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import { recipeCreatorQuestions } from './recipeCreatorQuestions';
import useIsMounted from '@/app/hooks/useIsMounted';

import RecipeCreatorOverview from './RecipeCreatorOverview';

interface RecipeCreatorClientProps {
    currentUser?: SafeUser | null;
}

type StepId = 'requirements' | 'workflow' | 'plaintext' | 'drafts' | 'test';

const MODULES_KEY = 'jorbites_course_recipe_creator_modules:v2';
const PROGRESS_KEY = 'jorbites_course_recipe_creator_progress:v2';

const RecipeCreatorClient: React.FC<RecipeCreatorClientProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(
        () => ['requirements', 'workflow', 'plaintext', 'drafts', 'test'],
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
            id: 'plaintext',
            title:
                t('recipe_creator_course_details.req_plaintext_label') ||
                'Plain Text Mode',
            icon: FiFileText,
            isCompleted: !!completedModules['plaintext'],
        },
        {
            id: 'drafts',
            title:
                t('recipe_creator_course_details.req_draft_label') ||
                'Drafts & Edits',
            icon: FiSave,
            isCompleted: !!completedModules['drafts'],
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
            courseTitle={t('course_recipe_creator') || 'Recipe Creator'}
            courseDescription={
                t('recipe_creator_course_details.course_description') ||
                'Learn how to build cooking guides, utilize plain text copy-paste parsing mode, persist creation drafts, and edit published recipes.'
            }
            headerIcon={FcSupport}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            {/* 1. Requirements Checklist */}
            {activeStep === 'requirements' && (
                <RecipeCreatorOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            )}

            {/* 2. Walkthrough Steps */}
            {activeStep === 'workflow' && (
                <CourseWorkflowStep
                    title={
                        t('recipe_creator_course_details.workflow_title') ||
                        'Recipe Creator Workflow'
                    }
                    icon={FiBookOpen}
                    stepPrefix="recipe_creator_course_details.workflow_step"
                    totalSteps={5}
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('plaintext');
                    }}
                />
            )}

            {/* 3. Plain Text copy-paste mode */}
            {activeStep === 'plaintext' && (
                <CourseInfoStep
                    title={
                        t(
                            'recipe_creator_course_details.plaintext_info_title'
                        ) || 'Plain Text Copy-Paste Mode'
                    }
                    icon={FiFileText}
                    paragraphs={[
                        t('recipe_creator_course_details.slots_desc1') ||
                            'Entering ingredients or cooking steps one-by-one can be slow. In both the Ingredients and Steps tabs, you can toggle "Plain Text Mode" to show a single textarea. This is perfect for copy-pasting posts directly from Instagram, Facebook, or recipe blogs.',
                        t('recipe_creator_course_details.slots_desc2') ||
                            'Jorbites automatically parses line breaks and numbered lists into clean, structured arrays. Toggling back to structured mode allows you to tweak individual items before saving.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('plaintext');
                        setActiveStep('drafts');
                    }}
                />
            )}

            {/* 4. Drafts & Edits */}
            {activeStep === 'drafts' && (
                <CourseInfoStep
                    title={
                        t('recipe_creator_course_details.drafts_info_title') ||
                        'Drafts & Editing Published Recipes'
                    }
                    icon={FiSave}
                    paragraphs={[
                        t('recipe_creator_course_details.exports_desc1') ||
                            'If you get interrupted, click the "Save Draft" button. This uploads your recipe state to the database under `/api/draft`. The next time you open the Recipe modal, Jorbites loads your draft and places you back at your last step.',
                        t('recipe_creator_course_details.exports_desc2') ||
                            "Once published, you can edit your recipe anytime. Clicking the Edit button opens the modal pre-filled with the recipe's current data, letting you modify ingredients, update pictures, or add co-cooks.",
                    ]}
                    onComplete={() => {
                        markModuleCompleted('drafts');
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
                                questions={recipeCreatorQuestions}
                                description={
                                    (t(
                                        'recipe_creator_course_details.final_test_description'
                                    ) as string) ||
                                    'Test your knowledge with 5 multiple-choice questions. You need at least 80% (4 correct answers) to pass and receive the Recipe Creator Certificate.'
                                }
                                onPass={() => markModuleCompleted('test')}
                            />
                        </div>
                    ) : (
                        <CourseCompleted
                            courseTitle="Recipe Creator Certificate"
                            currentUserNames={currentUser?.name}
                            badgePath="/badges/recipe_lists_badge_1783155223621.jpg"
                        />
                    )}
                </div>
            )}
        </CourseLayout>
    );
};

export default RecipeCreatorClient;
