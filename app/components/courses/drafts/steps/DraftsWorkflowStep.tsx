'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiBookOpen } from 'react-icons/fi';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';

interface DraftsWorkflowStepProps {
    onComplete: () => void;
}

export const DraftsWorkflowStep: React.FC<DraftsWorkflowStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    return (
        <CourseWorkflowStep
            title={
                t('drafts_course_details.workflow_title') ||
                'Managing Multiple Drafts'
            }
            icon={FiBookOpen}
            stepPrefix="drafts_course_details.workflow_step"
            totalSteps={5}
            onComplete={onComplete}
        />
    );
};

export default DraftsWorkflowStep;
