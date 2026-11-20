'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import Button from '@/app/components/buttons/Button';

type OverviewKey = 'recipes' | 'interactions' | 'lists' | 'settings';

interface OverviewItem {
    key: OverviewKey;
    labelKey: string;
    descKey: string;
    checklistKey: string;
}

const OVERVIEW_ITEMS: OverviewItem[] = [
    {
        key: 'recipes',
        labelKey: 'jorbites_basics_course_details.req_recipes_label',
        descKey: 'jorbites_basics_course_details.req_recipes_desc',
        checklistKey: 'jorbites_basics_course_details.checklist_recipes',
    },
    {
        key: 'interactions',
        labelKey: 'jorbites_basics_course_details.req_interactions_label',
        descKey: 'jorbites_basics_course_details.req_interactions_desc',
        checklistKey: 'jorbites_basics_course_details.checklist_interactions',
    },
    {
        key: 'lists',
        labelKey: 'jorbites_basics_course_details.req_lists_label',
        descKey: 'jorbites_basics_course_details.req_lists_desc',
        checklistKey: 'jorbites_basics_course_details.checklist_lists',
    },
    {
        key: 'settings',
        labelKey: 'jorbites_basics_course_details.req_settings_label',
        descKey: 'jorbites_basics_course_details.req_settings_desc',
        checklistKey: 'jorbites_basics_course_details.checklist_settings',
    },
];

const INITIAL_CHECKED_STATE: Record<OverviewKey, boolean> = {
    recipes: false,
    interactions: false,
    lists: false,
    settings: false,
};

interface JorbitesBasicsOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const JorbitesBasicsOverview: React.FC<JorbitesBasicsOverviewProps> = ({
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
                    {t('jorbites_basics_course_details.requirements_title')}
                </h2>
            </div>

            <div className="space-y-6">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t('jorbites_basics_course_details.requirements_intro')}
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
                        {t('jorbites_basics_course_details.action_required')}
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
                                    id={`${item.key}-checkbox`}
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

export default JorbitesBasicsOverview;
