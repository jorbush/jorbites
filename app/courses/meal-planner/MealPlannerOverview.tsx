'use client';

import React from 'react';
import CourseOverviewStep, {
    OverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';

const OVERVIEW_ITEMS: OverviewItem[] = [
    {
        key: 'privacy',
        labelKey: 'meal_planner_course_details.req_privacy_label',
        descKey: 'meal_planner_course_details.req_privacy_desc',
        checklistKey: 'meal_planner_course_details.checklist_privacy',
    },
    {
        key: 'slots',
        labelKey: 'meal_planner_course_details.req_slots_label',
        descKey: 'meal_planner_course_details.req_slots_desc',
        checklistKey: 'meal_planner_course_details.checklist_slots',
    },
    {
        key: 'shopping',
        labelKey: 'meal_planner_course_details.req_shopping_label',
        descKey: 'meal_planner_course_details.req_shopping_desc',
        checklistKey: 'meal_planner_course_details.checklist_shopping',
    },
    {
        key: 'calendar',
        labelKey: 'meal_planner_course_details.req_calendar_label',
        descKey: 'meal_planner_course_details.req_calendar_desc',
        checklistKey: 'meal_planner_course_details.checklist_calendar',
    },
];

interface MealPlannerOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const MealPlannerOverview: React.FC<MealPlannerOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => (
    <CourseOverviewStep
        moduleId="requirements"
        titleKey="meal_planner_course_details.requirements_title"
        introKey="meal_planner_course_details.requirements_intro"
        actionRequiredKey="meal_planner_course_details.action_required"
        items={OVERVIEW_ITEMS}
        completedModules={completedModules}
        markModuleCompleted={markModuleCompleted}
        onNext={onNext}
    />
);

export default MealPlannerOverview;
