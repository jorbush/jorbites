'use client';

import React from 'react';
import CourseOverviewStep, {
    OverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';

const OVERVIEW_ITEMS: OverviewItem[] = [
    {
        key: 'open',
        labelKey: 'quests_course_details.req_open_label',
        descKey: 'quests_course_details.req_open_desc',
        checklistKey: 'quests_course_details.checklist_open',
    },
    {
        key: 'fulfill',
        labelKey: 'quests_course_details.req_fulfill_label',
        descKey: 'quests_course_details.req_fulfill_desc',
        checklistKey: 'quests_course_details.checklist_fulfill',
    },
    {
        key: 'status',
        labelKey: 'quests_course_details.req_status_label',
        descKey: 'quests_course_details.req_status_desc',
        checklistKey: 'quests_course_details.checklist_status',
    },
    {
        key: 'likes',
        labelKey: 'quests_course_details.req_likes_label',
        descKey: 'quests_course_details.req_likes_desc',
        checklistKey: 'quests_course_details.checklist_likes',
    },
];

interface QuestsOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const QuestsOverview: React.FC<QuestsOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => (
    <CourseOverviewStep
        moduleId="requirements"
        titleKey="quests_course_details.requirements_title"
        introKey="quests_course_details.requirements_intro"
        actionRequiredKey="quests_course_details.action_required"
        items={OVERVIEW_ITEMS}
        completedModules={completedModules}
        markModuleCompleted={markModuleCompleted}
        onNext={onNext}
    />
);

export default QuestsOverview;
