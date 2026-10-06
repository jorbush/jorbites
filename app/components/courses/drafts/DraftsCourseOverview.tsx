'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiLayers, FiClock, FiUsers, FiFolder } from 'react-icons/fi';
import Button from '@/app/components/buttons/Button';

interface DraftsCourseOverviewProps {
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    onNext: () => void;
}

const DraftsCourseOverview: React.FC<DraftsCourseOverviewProps> = ({
    completedModules,
    markModuleCompleted,
    onNext,
}) => {
    const { t } = useTranslation();
    const isCompleted = !!completedModules['requirements'];

    const [checkedState, setCheckedState] = useState({
        solo: false,
        retention: false,
        cocooks: false,
        navigation: false,
    });

    const handleCheck = (key: keyof typeof checkedState) => {
        if (isCompleted) return;
        const next = { ...checkedState, [key]: !checkedState[key] };
        setCheckedState(next);

        const allChecked = Object.values(next).every((v) => v);
        if (allChecked) {
            markModuleCompleted('requirements');
        }
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-6 flex items-center gap-3">
                <FiCheck className="size-8 text-green-600 dark:text-green-400" />
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                    {t('drafts_course_details.requirements_title')}
                </h2>
            </div>

            <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
                {t('drafts_course_details.requirements_intro')}
            </p>

            {/* 4 Feature Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                    <div className="mb-2 flex items-center gap-2">
                        <FiLayers className="size-5 text-green-600 dark:text-green-400" />
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {t('drafts_course_details.req_solo_label')}
                        </h4>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {t('drafts_course_details.req_solo_desc')}
                    </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                    <div className="mb-2 flex items-center gap-2">
                        <FiClock className="size-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {t('drafts_course_details.req_retention_label')}
                        </h4>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {t('drafts_course_details.req_retention_desc')}
                    </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                    <div className="mb-2 flex items-center gap-2">
                        <FiUsers className="size-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {t('drafts_course_details.req_cocooks_label')}
                        </h4>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {t('drafts_course_details.req_cocooks_desc')}
                    </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                    <div className="mb-2 flex items-center gap-2">
                        <FiFolder className="size-5 text-amber-600 dark:text-amber-400" />
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {t('drafts_course_details.req_navigation_label')}
                        </h4>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {t('drafts_course_details.req_navigation_desc')}
                    </p>
                </div>
            </div>

            {/* Checklist Section */}
            <div className="rounded-xl bg-neutral-50 p-6 dark:bg-neutral-800/40">
                <h4 className="mb-4 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                    {t('drafts_course_details.action_required')}
                </h4>
                <div className="space-y-3">
                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={isCompleted || checkedState.solo}
                            onChange={() => handleCheck('solo')}
                            className="mt-0.5 accent-green-600"
                        />
                        <span className="text-xs text-neutral-700 dark:text-neutral-300">
                            {t('drafts_course_details.checklist_solo')}
                        </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={isCompleted || checkedState.retention}
                            onChange={() => handleCheck('retention')}
                            className="mt-0.5 accent-green-600"
                        />
                        <span className="text-xs text-neutral-700 dark:text-neutral-300">
                            {t('drafts_course_details.checklist_retention')}
                        </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={isCompleted || checkedState.cocooks}
                            onChange={() => handleCheck('cocooks')}
                            className="mt-0.5 accent-green-600"
                        />
                        <span className="text-xs text-neutral-700 dark:text-neutral-300">
                            {t('drafts_course_details.checklist_cocooks')}
                        </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={isCompleted || checkedState.navigation}
                            onChange={() => handleCheck('navigation')}
                            className="mt-0.5 accent-green-600"
                        />
                        <span className="text-xs text-neutral-700 dark:text-neutral-300">
                            {t('drafts_course_details.checklist_navigation')}
                        </span>
                    </label>
                </div>
            </div>

            {/* Next Button */}
            <div className="mt-6 flex justify-end border-t border-neutral-100 pt-6 dark:border-neutral-800">
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
    );
};

export default DraftsCourseOverview;
