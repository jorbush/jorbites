'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiBookOpen } from 'react-icons/fi';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';

interface RecipeBookWorkflowStepProps {
    onComplete: () => void;
}

export const RecipeBookWorkflowStep: React.FC<RecipeBookWorkflowStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    return (
        <CourseWorkflowStep
            title={
                t('recipe_book_course_details.workflow_title') ||
                'Book Builder Workflow'
            }
            icon={FiBookOpen}
            stepPrefix="recipe_book_course_details.workflow_step"
            totalSteps={5}
            onComplete={onComplete}
        />
    );
};

export default RecipeBookWorkflowStep;
