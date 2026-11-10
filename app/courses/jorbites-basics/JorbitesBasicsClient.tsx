'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FcDiploma1 } from 'react-icons/fc';
import { SafeCertificate, SafeUser } from '@/app/types';

import CourseLayout from '@/app/components/courses/core/CourseLayout';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import useIsMounted from '@/app/hooks/useIsMounted';

import {
    useJorbitesBasicsSteps,
    JORBITES_BASICS_STEP_IDS,
    StepId,
} from './steps/useJorbitesBasicsSteps';
import JorbitesBasicsStepContent from './steps/JorbitesBasicsStepContent';

interface JorbitesBasicsClientProps {
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

const MODULES_KEY = 'jorbites_course_basics_modules:v2';
const PROGRESS_KEY = 'jorbites_course_basics_progress:v2';

const JorbitesBasicsClient: React.FC<JorbitesBasicsClientProps> = ({
    currentUser,
    initialCertificate,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(() => [...JORBITES_BASICS_STEP_IDS], []);

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(
            MODULES_KEY,
            PROGRESS_KEY,
            allStepIds,
            Boolean(initialCertificate)
        );

    const steps = useJorbitesBasicsSteps(completedModules, isTestPassed);

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
            <JorbitesBasicsStepContent
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

export default JorbitesBasicsClient;
