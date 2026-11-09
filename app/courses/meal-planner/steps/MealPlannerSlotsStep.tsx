'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCalendar } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface MealPlannerSlotsStepProps {
    onComplete: () => void;
}

export const MealPlannerSlotsStep: React.FC<MealPlannerSlotsStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('meal_planner_course_details.slots_desc1') ||
            'The planner is structured as a 7-day grid (Monday to Sunday) containing 4 meal slots: Breakfast, Lunch, Dinner, and Snack. Click the "+" button in any slot to search and add a recipe.',
        t('meal_planner_course_details.slots_desc2') ||
            'You can add up to 4 recipes per slot. Owners can edit names/descriptions, toggle privacy settings, and remove recipes by clicking the trash icon next to the recipe name.',
    ];

    return (
        <CourseInfoStep
            title={
                t('meal_planner_course_details.slots_info_title') ||
                'Scheduling & Diet Slots'
            }
            icon={FiCalendar}
            paragraphs={paragraphs}
            onComplete={onComplete}
        />
    );
};

export default MealPlannerSlotsStep;
