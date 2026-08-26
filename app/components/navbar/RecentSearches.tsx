'use client';

import React from 'react';
import { BiX, BiHistory } from 'react-icons/bi';

interface RecentSearchesProps {
    recentSearches: string[];
    onSelectSearch: (query: string) => void;
    onRemoveSearch: (query: string, e: React.MouseEvent) => void;
    onClearAll: () => void;
    t: (key: string) => string;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
    recentSearches,
    onSelectSearch,
    onRemoveSearch,
    onClearAll,
    t,
}) => {
    if (!recentSearches || recentSearches.length === 0) {
        return null;
    }

    return (
        <div
            data-testid="recent-searches-container"
            className="absolute top-full left-0 z-30 mt-2 w-full min-w-[240px] rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95"
            onMouseDown={(e) => e.preventDefault()}
        >
            <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    <BiHistory className="size-4" />
                    <span>{t('recent_searches') || 'Recent searches'}</span>
                </div>
                <button
                    type="button"
                    onClick={onClearAll}
                    className="cursor-pointer text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
                    aria-label={t('clear_all') || 'Clear all'}
                    data-testid="clear-all-recent-searches"
                >
                    {t('clear_all') || 'Clear all'}
                </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((query) => (
                    <div
                        key={query}
                        className="group flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100/80 px-2.5 py-1 text-xs text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-200/80 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/80"
                    >
                        <button
                            type="button"
                            onClick={() => onSelectSearch(query)}
                            className="max-w-[150px] cursor-pointer truncate font-medium hover:underline"
                            title={query}
                        >
                            {query}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => onRemoveSearch(query, e)}
                            className="cursor-pointer rounded-full p-0.5 text-neutral-400 hover:bg-neutral-300/60 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-600/60 dark:hover:text-neutral-200"
                            aria-label={`${t('clear') || 'Remove'} ${query}`}
                            data-testid={`remove-recent-search-${query}`}
                        >
                            <BiX className="size-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentSearches;
