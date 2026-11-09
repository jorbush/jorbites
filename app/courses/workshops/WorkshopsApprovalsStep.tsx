'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiLock } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface WorkshopsApprovalsStepProps {
    onComplete: () => void;
}

export const WorkshopsApprovalsStep: React.FC<WorkshopsApprovalsStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    return (
        <CourseInfoStep
            title={
                t('workshops_course_details.approval_info_title') ||
                'Approvals & Capacity Management'
            }
            icon={FiLock}
            paragraphs={[
                t('workshops_course_details.approval_desc1') ||
                    'All newly created workshops require administrator review to ensure quality. Once approved, the workshop is published and users can register.',
                t('workshops_course_details.approval_desc2') ||
                    'The host can view the participant roster and accept or decline join requests manually. If a workshop reaches maximum capacity, it is automatically marked as full.',
            ]}
            onComplete={onComplete}
        />
    );
};

export default WorkshopsApprovalsStep;
