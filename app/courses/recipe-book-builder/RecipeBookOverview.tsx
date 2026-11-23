'use client';

import React from 'react';
import CourseOverviewStep, {
    CourseOverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';

const OVERVIEW_ITEMS: CourseOverviewItem[] = [
    {
        key: 'styles',
        labelKey: 'recipe_book_course_details.req_styles_label',
        descKey: 'recipe_book_course_details.req_styles_desc',
        checklistKey: 'recipe_book_course_details.checklist_styles',
    },
    {
        key: 'selection',
        labelKey: 'recipe_book_course_details.req_selection_label',
        descKey: 'recipe_book_course_details.req_selection_desc',
        checklistKey: 'recipe_book_course_details.checklist_selection',
    },
    {
        key: 'limits',
        labelKey: 'recipe_book_course_details.req_limits_label',
        descKey: 'recipe_book_course_details.req_limits_desc',
        checklistKey: 'recipe_book_course_details.checklist_limits',
    },
    {
        key: 'download',
        labelKey: 'recipe_book_course_details.req_download_label',
        descKey: 'recipe_book_course_details.req_download_desc',
        checklistKey: 'recipe_book_course_details.checklist_download',
    },
];

interface RecipeBookOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const RecipeBookOverview: React.FC<RecipeBookOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => (
    <CourseOverviewStep
        completedModules={completedModules}
        markModuleCompleted={markModuleCompleted}
        onNext={onNext}
        moduleId="requirements"
        titleKey="recipe_book_course_details.requirements_title"
        introKey="recipe_book_course_details.requirements_intro"
        actionRequiredKey="recipe_book_course_details.action_required"
        items={OVERVIEW_ITEMS}
    />
);

export default RecipeBookOverview;
