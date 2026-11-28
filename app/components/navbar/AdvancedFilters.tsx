'use client';

import { Suspense } from 'react';
import { FiSliders } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import {
    extractFilterValues,
    hasAnyFilterSet,
} from '@/app/hooks/useAdvancedFilters';
import useAdvancedFiltersModal from '@/app/hooks/useAdvancedFiltersModal';

const AdvancedFiltersComponent: React.FC = () => {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const isOpen = useAdvancedFiltersModal((state) => state.isOpen);
    const onOpen = useAdvancedFiltersModal((state) => state.onOpen);
    const hasActiveFilters = hasAnyFilterSet(extractFilterValues(searchParams));

    return (
        <div
            className="relative"
            data-testid="advanced-filters-container"
        >
            <button
                type="button"
                onClick={onOpen}
                className={`relative cursor-pointer rounded-full p-2 shadow-xs transition hover:shadow-md ${
                    hasActiveFilters
                        ? 'bg-green-450 dark:text-dark text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
                aria-label={String(t('filter_options') || 'Filter options')}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                data-testid="advanced-filters-button"
            >
                <FiSliders size={18} />
                {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                )}
            </button>
        </div>
    );
};

const AdvancedFilters: React.FC = () => (
    <Suspense fallback={<AdvancedFiltersSkeleton />}>
        <AdvancedFiltersComponent />
    </Suspense>
);

export const AdvancedFiltersSkeleton = () => (
    <div className="relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-neutral-100 p-2 dark:bg-neutral-800">
        <div className="size-5 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
    </div>
);

export default AdvancedFilters;
