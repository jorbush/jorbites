'use client';

import React from 'react';
import CourseOverviewStep, {
    CourseOverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';

const OVERVIEW_ITEMS: CourseOverviewItem[] = [
    {
        key: 'recipes',
        labelKey: 'jorbites_basics_course_details.req_recipes_label',
        descKey: 'jorbites_basics_course_details.req_recipes_desc',
        checklistKey: 'jorbites_basics_course_details.checklist_recipes',
        checkboxId: 'recipes-checkbox',
    },
    {
        key: 'interactions',
        labelKey: 'jorbites_basics_course_details.req_interactions_label',
        descKey: 'jorbites_basics_course_details.req_interactions_desc',
        checklistKey: 'jorbites_basics_course_details.checklist_interactions',
        checkboxId: 'interactions-checkbox',
    },
    {
        key: 'lists',
        labelKey: 'jorbites_basics_course_details.req_lists_label',
        descKey: 'jorbites_basics_course_details.req_lists_desc',
        checklistKey: 'jorbites_basics_course_details.checklist_lists',
        checkboxId: 'lists-checkbox',
    },
    {
        key: 'settings',
        labelKey: 'jorbites_basics_course_details.req_settings_label',
        descKey: 'jorbites_basics_course_details.req_settings_desc',
        checklistKey: 'jorbites_basics_course_details.checklist_settings',
        checkboxId: 'settings-checkbox',
    },
];

interface JorbitesBasicsOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const JorbitesBasicsOverview: React.FC<JorbitesBasicsOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => (
    <CourseOverviewStep
        completedModules={completedModules}
        markModuleCompleted={markModuleCompleted}
        onNext={onNext}
        moduleId="requirements"
        titleKey="jorbites_basics_course_details.requirements_title"
        introKey="jorbites_basics_course_details.requirements_intro"
        actionRequiredKey="jorbites_basics_course_details.action_required"
        items={OVERVIEW_ITEMS}
    />
);

export default JorbitesBasicsOverview;
