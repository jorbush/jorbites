'use client';

import React from 'react';
import { FcPlanner } from 'react-icons/fc';
import { BiPlus } from 'react-icons/bi';

export interface PlanningsHeaderProps {
    onCreateClick: () => void;
    t: any;
}

export const PlanningsHeader: React.FC<PlanningsHeaderProps> = ({
    onCreateClick,
    t,
}) => {
    return (
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-row items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                    <FcPlanner size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                        {t('meal_planner')}
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {t('meal_planner_subtitle') ||
                            'Design, customize, and share your week diets with the community.'}
                    </p>
                </div>
            </div>

            <div className="hidden md:block md:shrink-0">
                <button
                    type="button"
                    onClick={onCreateClick}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                    data-testid="create-meal-plan-button"
                    data-cy="create-meal-plan-button"
                >
                    <BiPlus size={18} />
                    <span>{t('create_meal_plan')}</span>
                </button>
            </div>
        </div>
    );
};

export default PlanningsHeader;
