'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import Button from '@/app/components/buttons/Button';

type OverviewKey = 'privacy' | 'slots' | 'shopping' | 'calendar';

interface OverviewItem {
    key: OverviewKey;
    labelKey: string;
    descKey: string;
    checklistKey: string;
}

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

const INITIAL_CHECKED_STATE: Record<OverviewKey, boolean> = {
    privacy: false,
    slots: false,
    shopping: false,
    calendar: false,
};

interface MealPlannerOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const MealPlannerOverview: React.FC<MealPlannerOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => {
    const { t } = useTranslation();
    const isCompleted = !!completedModules['requirements'];

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
            markModuleCompleted('requirements');
        }
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-6 flex items-center gap-3">
                <FiCheck className="size-8 text-neutral-700 dark:text-neutral-300" />
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                    {t('meal_planner_course_details.requirements_title')}
                </h2>
            </div>

            <div className="space-y-6">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t('meal_planner_course_details.requirements_intro')}
                </p>

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
                        {t('meal_planner_course_details.action_required')}
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
                            label={
                                t('contest_manager_course_details.next_step') ||
                                'Next Step'
                            }
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

export default MealPlannerOverview;
