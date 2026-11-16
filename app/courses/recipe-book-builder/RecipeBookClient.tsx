'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FcFolder } from 'react-icons/fc';
import { SafeCertificate, SafeUser } from '@/app/types';

import CourseLayout from '@/app/components/courses/core/CourseLayout';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import useIsMounted from '@/app/hooks/useIsMounted';

import {
    useRecipeBookSteps,
    RECIPE_BOOK_STEP_IDS,
    StepId,
} from './steps/useRecipeBookSteps';
import RecipeBookStepContent from './steps/RecipeBookStepContent';

interface RecipeBookClientProps {
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

const MODULES_KEY = 'jorbites_course_recipe_book_modules:v2';
const PROGRESS_KEY = 'jorbites_course_recipe_book_progress:v2';

const RecipeBookClient: React.FC<RecipeBookClientProps> = ({
    currentUser,
    initialCertificate,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(() => [...RECIPE_BOOK_STEP_IDS], []);

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(
            MODULES_KEY,
            PROGRESS_KEY,
            allStepIds,
            Boolean(initialCertificate)
        );

    const steps = useRecipeBookSteps(completedModules, isTestPassed);

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
            <RecipeBookStepContent
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

export default RecipeBookClient;
