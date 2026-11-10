'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface JorbitesBasicsInteractionsStepProps {
    onComplete: () => void;
}

export const JorbitesBasicsInteractionsStep: React.FC<
    JorbitesBasicsInteractionsStepProps
> = ({ onComplete }) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('jorbites_basics_course_details.slots_desc1') ||
            'Interacting with recipes helps the community grow. When you click the heart icon on a recipe page, you save it to your liked content and contribute to its standing in the "Top Recipe Vote". You can also click the pin button on a recipe, which promotes it directly onto your user profile cover header.',
        t('jorbites_basics_course_details.slots_desc2') ||
            'To keep recipes organized, visit your profile page and create a new Recipe List collection. You can specify a list title, description, and search/add recipes to it, making it easy to create theme folders like "Quick Breakfasts" or "Sunday Desserts".',
    ];

    return (
        <CourseInfoStep
            title={
                t('jorbites_basics_course_details.interactions_info_title') ||
                'Likes, Pins, & Custom Lists'
            }
            icon={FiCheckCircle}
            paragraphs={paragraphs}
            onComplete={onComplete}
        />
    );
};

export default JorbitesBasicsInteractionsStep;
