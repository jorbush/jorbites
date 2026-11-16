'use client';

import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { FcTodoList } from 'react-icons/fc';

interface QuestsHeaderProps {
    title: string;
    subtitle: string;
    requestRecipeLabel: string;
    onRequestRecipe: () => void;
}

export const QuestsHeader: React.FC<QuestsHeaderProps> = ({
    title,
    subtitle,
    requestRecipeLabel,
    onRequestRecipe,
}) => (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                <FcTodoList size={28} />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                    {title}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {subtitle}
                </p>
            </div>
        </div>
        <div className="hidden md:block md:flex-shrink-0">
            <button
                type="button"
                onClick={onRequestRecipe}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                data-cy="request-recipe-button"
            >
                <FiPlus size={18} />
                <span>{requestRecipeLabel}</span>
            </button>
        </div>
    </div>
);

export default QuestsHeader;
