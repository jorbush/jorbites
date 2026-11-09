'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiUserPlus } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface WorkshopsWhitelistStepProps {
    onComplete: () => void;
}

export const WorkshopsWhitelistStep: React.FC<WorkshopsWhitelistStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    return (
        <CourseInfoStep
            title={
                t('workshops_course_details.whitelist_info_title') ||
                'Inviting Whitelisted Students'
            }
            icon={FiUserPlus}
            paragraphs={[
                t('workshops_course_details.whitelist_desc1') ||
                    'For private workshops, you can restrict access by selecting specific Jorbites users to join your session.',
                t('workshops_course_details.whitelist_desc2') ||
                    'Users who are whitelisted will be able to see the workshop on their dashboard and register. Public workshops are visible to the entire community.',
            ]}
            onComplete={onComplete}
        />
    );
};

export default WorkshopsWhitelistStep;
