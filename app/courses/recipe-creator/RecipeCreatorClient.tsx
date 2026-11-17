'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FcSupport } from 'react-icons/fc';
import { SafeCertificate, SafeUser } from '@/app/types';

import CourseLayout from '@/app/components/courses/core/CourseLayout';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import useIsMounted from '@/app/hooks/useIsMounted';

import {
    useRecipeCreatorSteps,
    RECIPE_CREATOR_STEP_IDS,
    StepId,
} from './useRecipeCreatorSteps';
import RecipeCreatorStepContent from './RecipeCreatorStepContent';

interface RecipeCreatorClientProps {
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

const MODULES_KEY = 'jorbites_course_recipe_creator_modules:v2';
const PROGRESS_KEY = 'jorbites_course_recipe_creator_progress:v2';

const RecipeCreatorClient: React.FC<RecipeCreatorClientProps> = ({
    currentUser,
    initialCertificate,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(() => [...RECIPE_CREATOR_STEP_IDS], []);

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(
            MODULES_KEY,
            PROGRESS_KEY,
            allStepIds,
            Boolean(initialCertificate)
        );

    const steps = useRecipeCreatorSteps(completedModules, isTestPassed);

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
            <RecipeCreatorStepContent
                activeStep={activeStep}
                completedModules={completedModules}
                markModuleCompleted={markModuleCompleted}
                setActiveStep={setActiveStep}
                isTestPassed={isTestPassed}
                currentUser={currentUser}
                initialCertificate={initialCertificate}
            />
        </CourseLayout>
    );
};

export default RecipeCreatorClient;
