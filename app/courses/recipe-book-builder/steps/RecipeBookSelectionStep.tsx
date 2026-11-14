'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiList } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface RecipeBookSelectionStepProps {
    onComplete: () => void;
}

export const RecipeBookSelectionStep: React.FC<
    RecipeBookSelectionStepProps
> = ({ onComplete }) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('recipe_book_course_details.selection_desc1') ||
            'The selection step lists all recipes matching your current profile context. Check the boxes next to the recipes you wish to export into your PDF.',
        t('recipe_book_course_details.selection_desc2') ||
            'Please note that recipe book generation is subject to rate-limiting to prevent server overload. Make sure to review your selection before building.',
    ];

    return (
        <CourseInfoStep
            title={
                t('recipe_book_course_details.selection_info_title') ||
                'Recipe Selection & Limits'
            }
            icon={FiList}
            paragraphs={paragraphs}
            onComplete={onComplete}
        />
    );
};

export default RecipeBookSelectionStep;
