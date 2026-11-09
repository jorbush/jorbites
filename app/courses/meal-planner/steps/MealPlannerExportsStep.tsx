'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownload } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface MealPlannerExportsStepProps {
    onComplete: () => void;
}

export const MealPlannerExportsStep: React.FC<MealPlannerExportsStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('meal_planner_course_details.exports_desc1') ||
            'The Shopping List tool compiles all ingredients from all recipes added to your plan. You can view the list, print it, or use it while grocery shopping.',
        t('meal_planner_course_details.exports_desc2') ||
            'To stay on track, use "Export Calendar" to sync your diet plan with Google Calendar or Apple Calendar. Jorbites sends notifications on Mondays for the new week and warnings 3 days prior.',
    ];

    return (
        <CourseInfoStep
            title={
                t('meal_planner_course_details.exports_info_title') ||
                'Shopping Lists & Calendar Syncing'
            }
            icon={FiDownload}
            paragraphs={paragraphs}
            onComplete={onComplete}
        />
    );
};

export default MealPlannerExportsStep;
