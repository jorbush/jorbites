'use client';

import React from 'react';
import CourseOverviewStep, {
    CourseOverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';

const OVERVIEW_ITEMS: CourseOverviewItem[] = [
    {
        key: 'capacity',
        labelKey: 'workshops_course_details.req_capacity_label',
        descKey: 'workshops_course_details.req_capacity_desc',
        checklistKey: 'workshops_course_details.checklist_capacity',
    },
    {
        key: 'privacy',
        labelKey: 'workshops_course_details.req_privacy_label',
        descKey: 'workshops_course_details.req_privacy_desc',
        checklistKey: 'workshops_course_details.checklist_privacy',
    },
    {
        key: 'whitelist',
        labelKey: 'workshops_course_details.req_whitelist_label',
        descKey: 'workshops_course_details.req_whitelist_desc',
        checklistKey: 'workshops_course_details.checklist_whitelist',
    },
    {
        key: 'prereqs',
        labelKey: 'workshops_course_details.req_prereqs_label',
        descKey: 'workshops_course_details.req_prereqs_desc',
        checklistKey: 'workshops_course_details.checklist_prereqs',
    },
];

interface WorkshopsOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const WorkshopsOverview: React.FC<WorkshopsOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => (
    <CourseOverviewStep
        completedModules={completedModules}
        markModuleCompleted={markModuleCompleted}
        onNext={onNext}
        moduleId="requirements"
        titleKey="workshops_course_details.requirements_title"
        introKey="workshops_course_details.requirements_intro"
        actionRequiredKey="workshops_course_details.action_required"
        items={OVERVIEW_ITEMS}
    />
);

export default WorkshopsOverview;
