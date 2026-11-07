'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiRotateCcw } from 'react-icons/fi';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface RecipeChecklistHeaderProps {
    title: string;
    completedCount: number;
    totalCount: number;
    onReset: () => void;
    actionSlot?: React.ReactNode;
}

export const RecipeChecklistHeader: React.FC<RecipeChecklistHeaderProps> = ({
    title,
    completedCount,
    totalCount,
    onReset,
    actionSlot,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const resetLabel = String(
        mounted ? t('reset_checklist') || 'Reset' : 'Reset'
    );

    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {title}
                </h3>
                {completedCount > 0 && (
                    <span className="border-green-450/40 bg-green-450/15 dark:text-green-450 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold text-neutral-900">
                        {completedCount}/{totalCount}
                    </span>
                )}
            </div>

            {(completedCount > 0 || actionSlot) && (
                <div className="flex items-center gap-2.5">
                    {completedCount > 0 && (
                        <button
                            type="button"
                            onClick={onReset}
                            className="flex cursor-pointer items-center gap-1 text-xs font-medium text-neutral-400 transition-colors duration-200 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                            title={resetLabel}
                            aria-label={resetLabel}
                        >
                            <FiRotateCcw size={12} />
                            <span>{resetLabel}</span>
                        </button>
                    )}
                    {actionSlot}
                </div>
            )}
        </div>
    );
};

export default RecipeChecklistHeader;
