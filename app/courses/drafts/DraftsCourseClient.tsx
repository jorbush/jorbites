'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FcDocument } from 'react-icons/fc';
import { SafeCertificate, SafeUser } from '@/app/types';

import CourseLayout from '@/app/components/courses/core/CourseLayout';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import useIsMounted from '@/app/hooks/useIsMounted';

import {
    useDraftsSteps,
    DRAFTS_STEP_IDS,
    StepId,
} from '@/app/components/courses/drafts/steps/useDraftsSteps';
import DraftsStepContent from '@/app/components/courses/drafts/steps/DraftsStepContent';

interface DraftsCourseClientProps {
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

const MODULES_KEY = 'jorbites_course_drafts_modules:v2';
const PROGRESS_KEY = 'jorbites_course_drafts_progress:v2';

const DraftsCourseClient: React.FC<DraftsCourseClientProps> = ({
    currentUser,
    initialCertificate,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();
    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(() => [...DRAFTS_STEP_IDS], []);

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(
            MODULES_KEY,
            PROGRESS_KEY,
            allStepIds,
            Boolean(initialCertificate)
        );

    const steps = useDraftsSteps(completedModules, isTestPassed);

    if (!isMounted) {
        return null;
    }

    return (
        <CourseLayout
            courseTitle={t('course_drafts') || 'Recipe Drafts & Collaboration'}
            courseDescription={
                t('course_drafts_desc') ||
                'Learn how to manage multiple recipe drafts, invite friends to cook together, assign roles, and collaborate seamlessly without overwriting work.'
            }
            headerIcon={FcDocument}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            <DraftsStepContent
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

export default DraftsCourseClient;
