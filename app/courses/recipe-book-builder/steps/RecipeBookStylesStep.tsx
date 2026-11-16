'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiSliders } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface RecipeBookStylesStepProps {
    onComplete: () => void;
}

export const RecipeBookStylesStep: React.FC<RecipeBookStylesStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('recipe_book_course_details.styles_desc1') ||
            'The configuration step allows you to select from three distinct cover layouts: "Minimal" (clean and modern), "Elegant" (refined serif typography), and "Cozy" (warm and decorative).',
        t('recipe_book_course_details.styles_desc2') ||
            'You can also control image display formatting: choose "Full Page" for large images, "Thumbnail" for compact list grids, or "No Images" to optimize for text-only printing.',
    ];

    return (
        <CourseInfoStep
            title={
                t('recipe_book_course_details.styles_info_title') ||
                'Customizing Styles & Themes'
            }
            icon={FiSliders}
            paragraphs={paragraphs}
            onComplete={onComplete}
        />
    );
};

export default RecipeBookStylesStep;
