'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiSettings } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface JorbitesBasicsSettingsStepProps {
    onComplete: () => void;
}

export const JorbitesBasicsSettingsStep: React.FC<
    JorbitesBasicsSettingsStepProps
> = ({ onComplete }) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('jorbites_basics_course_details.exports_desc1') ||
            'The Jorbites Settings modal (accessible from the navigation dropdown menu) houses all user preferences. You can update your display name, toggle display languages (English, Spanish, or Catalan), and select your visual theme: Light Mode (clean white), Dark Mode (sleek premium navy/black), or System Default.',
        t('jorbites_basics_course_details.exports_desc2') ||
            'You can also manage Email Notifications in settings. Jorbites allows you to select which automated notifications you receive: toggle alert updates for community workshops, comment replies on your recipes, quest details, weekly digests, or newsletters to match your inbox preferences.',
    ];

    return (
        <CourseInfoStep
            title={
                t('jorbites_basics_course_details.settings_info_title') ||
                'Name, Themes, Languages & Notifications'
            }
            icon={FiSettings}
            paragraphs={paragraphs}
            onComplete={onComplete}
        />
    );
};

export default JorbitesBasicsSettingsStep;
