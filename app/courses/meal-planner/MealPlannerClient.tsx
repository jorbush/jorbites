'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FcPlanner } from 'react-icons/fc';
import { SafeCertificate, SafeUser } from '@/app/types';

import CourseLayout from '@/app/components/courses/core/CourseLayout';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import useIsMounted from '@/app/hooks/useIsMounted';

import {
    useMealPlannerSteps,
    MEAL_PLANNER_STEP_IDS,
    StepId,
} from './steps/useMealPlannerSteps';
import MealPlannerStepContent from './steps/MealPlannerStepContent';

interface MealPlannerClientProps {
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

const MODULES_KEY = 'jorbites_course_meal_planner_modules:v2';
const PROGRESS_KEY = 'jorbites_course_meal_planner_progress:v2';

const MealPlannerClient: React.FC<MealPlannerClientProps> = ({
    currentUser,
    initialCertificate,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(() => [...MEAL_PLANNER_STEP_IDS], []);

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(
            MODULES_KEY,
            PROGRESS_KEY,
            allStepIds,
            Boolean(initialCertificate)
        );

    const steps = useMealPlannerSteps(completedModules, isTestPassed);

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
            <MealPlannerStepContent
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

export default MealPlannerClient;
