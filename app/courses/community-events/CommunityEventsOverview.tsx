'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import Button from '@/app/components/buttons/Button';

type OverviewKey = 'challenge' | 'contest' | 'calendar' | 'voting';

interface OverviewItem {
    key: OverviewKey;
    labelKey: string;
    descKey: string;
    checklistKey: string;
}

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

const INITIAL_CHECKED_STATE: Record<OverviewKey, boolean> = {
    challenge: false,
    contest: false,
    calendar: false,
    voting: false,
};

interface CommunityEventsOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const CommunityEventsOverview: React.FC<CommunityEventsOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => {
    const { t } = useTranslation();
    const isCompleted = !!completedModules['overview'];

    // Checklist State
    const [overviewChecked, setOverviewChecked] = useState<
        Record<OverviewKey, boolean>
    >(INITIAL_CHECKED_STATE);

    const handleOverviewCheck = (key: OverviewKey) => {
        if (isCompleted) return;
        const next = { ...overviewChecked, [key]: !overviewChecked[key] };
        setOverviewChecked(next);
        const allChecked = Object.values(next).every((v) => v);
        if (allChecked) {
            markModuleCompleted('overview');
        }
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-6 flex items-center gap-3">
                <FiCheck className="size-8 text-neutral-700 dark:text-neutral-300" />
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                    {t('community_events_course_details.overview_title')}
                </h2>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {OVERVIEW_ITEMS.map((item) => (
                        <div
                            key={item.key}
                            className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                {t(item.labelKey)}
                            </h4>
                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                {t(item.descKey)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl bg-neutral-50 p-6 dark:bg-neutral-800/30">
                    <h4 className="mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        {t('community_events_course_details.action_required')}
                    </h4>
                    <div className="space-y-3">
                        {OVERVIEW_ITEMS.map((item) => (
                            <label
                                key={item.key}
                                className="flex cursor-pointer items-start gap-3"
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        isCompleted || overviewChecked[item.key]
                                    }
                                    onChange={() =>
                                        handleOverviewCheck(item.key)
                                    }
                                    className="mt-1 accent-green-600"
                                    aria-label={String(
                                        t(item.checklistKey) || ''
                                    )}
                                />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {t(item.checklistKey)}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end border-t border-neutral-100 pt-6 dark:border-neutral-800">
                    <div className="w-fit">
                        <Button
                            label={t(
                                'contest_manager_course_details.next_step'
                            )}
                            onClick={onNext}
                            disabled={!isCompleted}
                            small
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityEventsOverview;
