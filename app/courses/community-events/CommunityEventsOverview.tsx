'use client';

import React from 'react';
import CourseOverviewStep, {
    OverviewItem,
} from '@/app/components/courses/steps/CourseOverviewStep';

const OVERVIEW_ITEMS: OverviewItem[] = [
    {
        key: 'challenge',
        labelKey: 'community_events_course_details.evt_challenge_label',
        descKey: 'community_events_course_details.evt_challenge_desc',
        checklistKey: 'community_events_course_details.checklist_challenge',
    },
    {
        key: 'contest',
        labelKey: 'community_events_course_details.evt_contest_label',
        descKey: 'community_events_course_details.evt_contest_desc',
        checklistKey: 'community_events_course_details.checklist_contest',
    },
    {
        key: 'calendar',
        labelKey: 'community_events_course_details.evt_temp_label',
        descKey: 'community_events_course_details.evt_temp_desc',
        checklistKey: 'community_events_course_details.checklist_temp',
    },
    {
        key: 'voting',
        labelKey: 'community_events_course_details.evt_voting_label',
        descKey: 'community_events_course_details.evt_voting_desc',
        checklistKey: 'community_events_course_details.checklist_voting',
    },
];

interface CommunityEventsOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const CommunityEventsOverview: React.FC<CommunityEventsOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => (
    <CourseOverviewStep
        moduleId="overview"
        titleKey="community_events_course_details.overview_title"
        actionRequiredKey="community_events_course_details.action_required"
        items={OVERVIEW_ITEMS}
        completedModules={completedModules}
        markModuleCompleted={markModuleCompleted}
        onNext={onNext}
    />
);

export default CommunityEventsOverview;
