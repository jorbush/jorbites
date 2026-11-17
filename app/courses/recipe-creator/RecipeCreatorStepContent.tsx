'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiBookOpen, FiFileText, FiSave } from 'react-icons/fi';
import { SafeCertificate, SafeUser } from '@/app/types';

import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';
import RecipeCreatorOverview from './RecipeCreatorOverview';
import RecipeCreatorTestStep from './RecipeCreatorTestStep';
import { StepId } from './useRecipeCreatorSteps';

interface RecipeCreatorStepContentProps {
    activeStep: StepId;
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    setActiveStep: (step: StepId) => void;
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

const RecipeCreatorStepContent: React.FC<RecipeCreatorStepContentProps> = ({
    activeStep,
    completedModules,
    markModuleCompleted,
    setActiveStep,
    isTestPassed,
    currentUser,
    initialCertificate,
}) => {
    const { t } = useTranslation();

    switch (activeStep) {
        case 'requirements':
            return (
                <RecipeCreatorOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            );

        case 'workflow':
            return (
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
            );

        case 'plaintext':
            return (
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
            );

        case 'drafts':
            return (
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
            );

        case 'test':
            return (
                <RecipeCreatorTestStep
                    isTestPassed={isTestPassed}
                    currentUser={currentUser}
                    initialCertificate={initialCertificate}
                    onPass={() => markModuleCompleted('test')}
                />
            );
    }
};

export default RecipeCreatorStepContent;
