'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiBookOpen } from 'react-icons/fi';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';

interface MealPlannerWorkflowStepProps {
    onComplete: () => void;
}

export const MealPlannerWorkflowStep: React.FC<
    MealPlannerWorkflowStepProps
> = ({ onComplete }) => {
    const { t } = useTranslation();

    return (
        <CourseWorkflowStep
            title={
                t('meal_planner_course_details.workflow_title') ||
                'Meal Planner Workflow'
            }
            icon={FiBookOpen}
            stepPrefix="meal_planner_course_details.workflow_step"
            totalSteps={5}
            onComplete={onComplete}
        />
    );
};

export default MealPlannerWorkflowStep;
