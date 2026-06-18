'use client';

import React, { Suspense } from 'react';
import { BiSearch, BiX } from 'react-icons/bi';
import { FiChevronLeft, FiFilter } from 'react-icons/fi';
import Logo from '@/app/components/navbar/Logo';
import OrderByDropdown from '@/app/components/navbar/OrderByDropdown';
import PeriodFilter from '@/app/components/navbar/PeriodFilter';

interface SearchFiltersState {
    isOpen?: boolean;
    isFiltering?: boolean;
    hasActive?: boolean;
}

interface MobileSearchProps {
    isSearchMode: boolean;
    searchQuery: string;
    onSearchToggle: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onFilterToggle?: () => void;
    filtersState?: SearchFiltersState;
    isFilterablePage: boolean;
    t: (key: string) => string;
}

const DEFAULT_FILTERS_STATE: SearchFiltersState = {};

export const MobileSearch: React.FC<MobileSearchProps> = ({
    isSearchMode,
    searchQuery,
    onSearchToggle,
    onSubmit,
    onChange,
    onKeyDown,
    inputRef,
    onFilterToggle,
    filtersState = DEFAULT_FILTERS_STATE,
    isFilterablePage,
    t,
}) => {
    const isFilterOpen = filtersState.isOpen;
    const isFiltering = filtersState.isFiltering;
    const hasActiveFilters = filtersState.hasActive;

    if (!isFilterablePage) {
        return (
            <div className="flex w-full flex-row items-center gap-1">
                <Logo />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-row items-center gap-1">
            {isSearchMode ? (
                <div className="animate-mobile-search-in flex w-full items-center gap-3">
                    <button
                        type="button"
                        onClick={onSearchToggle}
                        className="flex min-h-[40px] min-w-[40px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        aria-label={t('back') || 'Back'}
                    >
                        <FiChevronLeft size={20} />
                    </button>

                    <form
                        onSubmit={onSubmit}
                        className="flex-1"
                    >
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={t('search_recipes') + '...'}
                                aria-label={
                                    t('search_recipes') || 'Search recipes'
                                }
                                value={searchQuery}
                                onChange={(e) => onChange(e.target.value)}
                                onKeyDown={onKeyDown}
                                className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 text-md min-h-[40px] w-full rounded-full border border-neutral-300 bg-white py-2 pr-10 pl-4 transition-all outline-none focus:ring-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => onChange('')}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                                >
                                    <BiX size={16} />
                                </button>
                            )}
                        </div>
                    </form>

                    <Suspense fallback={null}>
                        <OrderByDropdown />
                    </Suspense>

                    <Suspense fallback={null}>
                        <PeriodFilter />
                    </Suspense>

                    <button
                        type="button"
                        onClick={onFilterToggle}
                        className={`relative cursor-pointer rounded-full p-2 shadow-xs transition hover:shadow-md ${
                            isFilterOpen
                                ? 'bg-green-450 dark:text-dark text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                        }`}
                        aria-label={
                            t('filter_categories') || 'Filter by categories'
                        }
                        aria-expanded={isFilterOpen}
                        data-testid="filter-button"
                    >
                        <FiFilter size={18} />
                        {isFiltering && (
                            <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex w-full flex-row items-center gap-1 md:gap-3">
                    <Logo />
                    <button
                        type="button"
                        onClick={onSearchToggle}
                        className="bg-green-450 dark:text-dark relative flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-full p-2 text-white shadow-xs transition hover:shadow-md"
                        aria-label={
                            t('search_and_filter') || 'Search and filter'
                        }
                    >
                        <BiSearch size={18} />
                        {hasActiveFilters && (
                            <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MobileSearch;
