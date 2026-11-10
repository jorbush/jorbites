'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiBookOpen } from 'react-icons/fi';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';

interface JorbitesBasicsWorkflowStepProps {
    onComplete: () => void;
}

export const JorbitesBasicsWorkflowStep: React.FC<
    JorbitesBasicsWorkflowStepProps
> = ({ onComplete }) => {
    const { t } = useTranslation();

    return (
        <CourseWorkflowStep
            title={
                t('jorbites_basics_course_details.workflow_title') ||
                'Basics Explorer Workflow'
            }
            icon={FiBookOpen}
            stepPrefix="jorbites_basics_course_details.workflow_step"
            totalSteps={5}
            onComplete={onComplete}
        />
    );
};

export default JorbitesBasicsWorkflowStep;
