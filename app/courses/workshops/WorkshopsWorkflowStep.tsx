'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiBookOpen } from 'react-icons/fi';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';

interface WorkshopsWorkflowStepProps {
    onComplete: () => void;
}

export const WorkshopsWorkflowStep: React.FC<WorkshopsWorkflowStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    return (
        <CourseWorkflowStep
            title={
                t('workshops_course_details.workflow_title') ||
                'Creation Walkthrough'
            }
            icon={FiBookOpen}
            stepPrefix="workshops_course_details.workflow_step"
            totalSteps={5}
            onComplete={onComplete}
        />
    );
};

export default WorkshopsWorkflowStep;
