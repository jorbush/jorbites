'use client';

import React from 'react';
import CourseOverviewStep, {
    CourseOverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';

const OVERVIEW_ITEMS: CourseOverviewItem[] = [
    {
        key: 'auto',
        labelKey: 'recipe_lists_course_details.req_auto_label',
        descKey: 'recipe_lists_course_details.req_auto_desc',
        checklistKey: 'recipe_lists_course_details.checklist_auto',
    },
    {
        key: 'custom',
        labelKey: 'recipe_lists_course_details.req_custom_label',
        descKey: 'recipe_lists_course_details.req_custom_desc',
        checklistKey: 'recipe_lists_course_details.checklist_custom',
    },
    {
        key: 'privacy',
        labelKey: 'recipe_lists_course_details.req_privacy_label',
        descKey: 'recipe_lists_course_details.req_privacy_desc',
        checklistKey: 'recipe_lists_course_details.checklist_privacy',
    },
    {
        key: 'multi',
        labelKey: 'recipe_lists_course_details.req_multi_label',
        descKey: 'recipe_lists_course_details.req_multi_desc',
        checklistKey: 'recipe_lists_course_details.checklist_multi',
    },
];

interface RecipeListsOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const RecipeListsOverview: React.FC<RecipeListsOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => (
    <CourseOverviewStep
        completedModules={completedModules}
        markModuleCompleted={markModuleCompleted}
        onNext={onNext}
        moduleId="overview"
        titleKey="recipe_lists_course_details.requirements_title"
        actionRequiredKey="recipe_lists_course_details.action_required"
        items={OVERVIEW_ITEMS}
    />
);

export default RecipeListsOverview;
