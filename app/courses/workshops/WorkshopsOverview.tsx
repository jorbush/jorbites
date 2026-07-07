'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import Button from '@/app/components/buttons/Button';

interface WorkshopsOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const WorkshopsOverview: React.FC<WorkshopsOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => {
    const { t } = useTranslation();
    const isCompleted = !!completedModules['requirements'];

    // Checklist State
    const [overviewChecked, setOverviewChecked] = useState({
        capacity: false,
        privacy: false,
        whitelist: false,
        prereqs: false,
    });

    const handleOverviewCheck = (key: keyof typeof overviewChecked) => {
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
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {t('workshops_course_details.requirements_title')}
                </h2>
            </div>

            <div className="space-y-6">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t('workshops_course_details.requirements_intro')}
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                            {t('workshops_course_details.req_capacity_label')}
                        </h4>
                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                            {t('workshops_course_details.req_capacity_desc')}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                            {t('workshops_course_details.req_privacy_label')}
                        </h4>
                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                            {t('workshops_course_details.req_privacy_desc')}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                            {t('workshops_course_details.req_whitelist_label')}
                        </h4>
                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                            {t('workshops_course_details.req_whitelist_desc')}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                            {t('workshops_course_details.req_prereqs_label')}
                        </h4>
                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                            {t('workshops_course_details.req_prereqs_desc')}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl bg-neutral-50 p-6 dark:bg-neutral-800/30">
                    <h4 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        {t('workshops_course_details.action_required')}
                    </h4>
                    <div className="space-y-3">
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={
                                    isCompleted || overviewChecked.capacity
                                }
                                onChange={() => handleOverviewCheck('capacity')}
                                className="mt-1 accent-green-600"
                                aria-label={
                                    t(
                                        'workshops_course_details.checklist_capacity'
                                    ) || ''
                                }
                            />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {t(
                                    'workshops_course_details.checklist_capacity'
                                )}
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={isCompleted || overviewChecked.privacy}
                                onChange={() => handleOverviewCheck('privacy')}
                                className="mt-1 accent-green-600"
                                aria-label={
                                    t(
                                        'workshops_course_details.checklist_privacy'
                                    ) || ''
                                }
                            />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {t(
                                    'workshops_course_details.checklist_privacy'
                                )}
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={
                                    isCompleted || overviewChecked.whitelist
                                }
                                onChange={() =>
                                    handleOverviewCheck('whitelist')
                                }
                                className="mt-1 accent-green-600"
                                aria-label={
                                    t(
                                        'workshops_course_details.checklist_whitelist'
                                    ) || ''
                                }
                            />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {t(
                                    'workshops_course_details.checklist_whitelist'
                                )}
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={isCompleted || overviewChecked.prereqs}
                                onChange={() => handleOverviewCheck('prereqs')}
                                className="mt-1 accent-green-600"
                                aria-label={
                                    t(
                                        'workshops_course_details.checklist_prereqs'
                                    ) || ''
                                }
                            />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {t(
                                    'workshops_course_details.checklist_prereqs'
                                )}
                            </span>
                        </label>
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

export default WorkshopsOverview;
