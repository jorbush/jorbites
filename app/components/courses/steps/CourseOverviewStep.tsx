'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import Button from '@/app/components/buttons/Button';

export interface CourseOverviewItem {
    key: string;
    labelKey: string;
    descKey: string;
    checklistKey: string;
    checkboxId?: string;
}

export interface CourseOverviewStepProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
    moduleId: string;
    titleKey: string;
    introKey?: string;
    actionRequiredKey: string;
    items: CourseOverviewItem[];
}

const CourseOverviewStep: React.FC<CourseOverviewStepProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
    moduleId,
    titleKey,
    introKey,
    actionRequiredKey,
    items,
}) => {
    const { t } = useTranslation();
    const isCompleted = !!completedModules[moduleId];

    const [overviewChecked, setOverviewChecked] = useState<
        Record<string, boolean>
    >({});

    const handleOverviewCheck = (key: string) => {
        if (isCompleted) return;
        const next = { ...overviewChecked, [key]: !overviewChecked[key] };
        setOverviewChecked(next);
        const allChecked =
            items.length > 0 && items.every((item) => Boolean(next[item.key]));
        if (allChecked) {
            markModuleCompleted(moduleId);
        }
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-6 flex items-center gap-3">
                <FiCheck className="size-8 text-neutral-700 dark:text-neutral-300" />
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                    {t(titleKey)}
                </h2>
            </div>

            <div className="space-y-6">
                {introKey && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t(introKey)}
                    </p>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {items.map((item) => (
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
                        {t(actionRequiredKey)}
                    </h4>
                    <div className="space-y-3">
                        {items.map((item) => (
                            <label
                                key={item.key}
                                className="flex cursor-pointer items-start gap-3"
                            >
                                <input
                                    type="checkbox"
                                    id={item.checkboxId}
                                    checked={
                                        isCompleted ||
                                        !!overviewChecked[item.key]
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
                            label={String(
                                t('contest_manager_course_details.next_step') ||
                                    'Next Step'
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

export default CourseOverviewStep;
