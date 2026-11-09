'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FcConferenceCall } from 'react-icons/fc';
import { SafeCertificate, SafeUser } from '@/app/types';

import CourseLayout from '@/app/components/courses/core/CourseLayout';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import useIsMounted from '@/app/hooks/useIsMounted';

import {
    useWorkshopsSteps,
    WORKSHOPS_STEP_IDS,
    StepId,
} from './useWorkshopsSteps';
import WorkshopsStepContent from './WorkshopsStepContent';

interface WorkshopsClientProps {
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

const MODULES_KEY = 'jorbites_course_workshops_modules:v2';
const PROGRESS_KEY = 'jorbites_course_workshops_progress:v2';

const WorkshopsClient: React.FC<WorkshopsClientProps> = ({
    currentUser,
    initialCertificate,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(() => [...WORKSHOPS_STEP_IDS], []);

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(
            MODULES_KEY,
            PROGRESS_KEY,
            allStepIds,
            Boolean(initialCertificate)
        );

    const steps = useWorkshopsSteps(completedModules, isTestPassed);

    if (!isMounted) {
        return null;
    }

    return (
        <CourseLayout
            courseTitle={t('course_workshops') || 'Workshops & Classes'}
            courseDescription={
                t('workshops_course_details.course_description') ||
                'Discover how to host workshops, manage student whitelists, request approvals, and join live cooking classes.'
            }
            headerIcon={FcConferenceCall}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            <WorkshopsStepContent
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

export default WorkshopsClient;
