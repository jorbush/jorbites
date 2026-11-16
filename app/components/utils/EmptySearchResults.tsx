'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';

export interface EmptySearchResultsProps {
    title: string;
    subtitle?: string;
    clearLabel?: string;
    onClearSearch?: () => void;
    className?: string;
    dataTestId?: string;
    dataCy?: string;
    clearTestId?: string;
    showIcon?: boolean;
}

const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
    title,
    subtitle,
    clearLabel = 'Clear search',
    onClearSearch,
    className = '',
    dataTestId,
    dataCy,
    clearTestId,
    showIcon = true,
}) => {
    return (
        <div
            className={`rounded-2xl border border-dashed border-neutral-300 bg-white/80 px-6 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900/60 ${className}`}
            data-testid={dataTestId}
            data-cy={dataCy}
        >
            {showIcon && (
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-400 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-500">
                    <FiSearch size={20} />
                </div>
            )}
            <p className="text-base font-semibold text-neutral-900 dark:text-white">
                {title}
            </p>
            {subtitle && (
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {subtitle}
                </p>
            )}
            {onClearSearch && (
                <button
                    type="button"
                    onClick={onClearSearch}
                    data-testid={clearTestId}
                    className="mt-4 cursor-pointer text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
                >
                    {clearLabel}
                </button>
            )}
        </div>
    );
};

export default EmptySearchResults;
