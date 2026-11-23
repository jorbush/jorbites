'use client';

import React from 'react';
import CourseOverviewStep, {
    CourseOverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';

const OVERVIEW_ITEMS: CourseOverviewItem[] = [
    {
        key: 'inputs',
        labelKey: 'recipe_creator_course_details.req_inputs_label',
        descKey: 'recipe_creator_course_details.req_inputs_desc',
        checklistKey: 'recipe_creator_course_details.checklist_inputs',
    },
    {
        key: 'plaintext',
        labelKey: 'recipe_creator_course_details.req_plaintext_label',
        descKey: 'recipe_creator_course_details.req_plaintext_desc',
        checklistKey: 'recipe_creator_course_details.checklist_plaintext',
    },
    {
        key: 'draft',
        labelKey: 'recipe_creator_course_details.req_draft_label',
        descKey: 'recipe_creator_course_details.req_draft_desc',
        checklistKey: 'recipe_creator_course_details.checklist_draft',
    },
    {
        key: 'editing',
        labelKey: 'recipe_creator_course_details.req_editing_label',
        descKey: 'recipe_creator_course_details.req_editing_desc',
        checklistKey: 'recipe_creator_course_details.checklist_editing',
    },
];

interface RecipeCreatorOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const RecipeCreatorOverview: React.FC<RecipeCreatorOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => (
    <CourseOverviewStep
        completedModules={completedModules}
        markModuleCompleted={markModuleCompleted}
        onNext={onNext}
        moduleId="requirements"
        titleKey="recipe_creator_course_details.requirements_title"
        introKey="recipe_creator_course_details.requirements_intro"
        actionRequiredKey="recipe_creator_course_details.action_required"
        items={OVERVIEW_ITEMS}
    />
);

export default RecipeCreatorOverview;
