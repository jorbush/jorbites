'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiSmartphone } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface JorbitesBasicsPwaStepProps {
    onComplete: () => void;
}

export const JorbitesBasicsPwaStep: React.FC<JorbitesBasicsPwaStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('jorbites_basics_course_details.pwa_desc1') ||
            "Jorbites is a Progressive Web App (PWA), meaning you can install it directly onto your smartphone's home screen. On iOS, open Safari, tap the 'Share' icon, scroll down, and select 'Add to Home Screen'. On Android, open Google Chrome, tap the three-dot menu button in the upper right corner, and select 'Install app' or 'Add to Home screen'.",
        t('jorbites_basics_course_details.pwa_desc2') ||
            'Once installed on your phone, Jorbites functions like a native application. Under settings, you can enable native Mobile Push Notifications to get instant updates about new workshops, comments replies, and active quest reminders directly on your lock screen.',
    ];

    return (
        <CourseInfoStep
            title={
                t('jorbites_basics_course_details.pwa_info_title') ||
                'PWA Installation & App Notifications'
            }
            icon={FiSmartphone}
            paragraphs={paragraphs}
            onComplete={onComplete}
        />
    );
};

export default JorbitesBasicsPwaStep;
