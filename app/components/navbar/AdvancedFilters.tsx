'use client';

import { Suspense } from 'react';
import { FiSliders, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Button from '../buttons/Button';
import { RECIPE_CUISINES } from '@/app/utils/constants';
import { useSearchParams } from 'next/navigation';
import { CuisineIcon } from '../recipes/CuisineIcon';
import { useAdvancedFilters } from '@/app/hooks/useAdvancedFilters';

interface CalorieFilterSectionProps {
    minCalories: string;
    maxCalories: string;
    onChangeMin: (val: string) => void;
    onChangeMax: (val: string) => void;
    t: (key: string, options?: { defaultValue?: string }) => string;
}

const CalorieFilterSection: React.FC<CalorieFilterSectionProps> = ({
    minCalories,
    maxCalories,
    onChangeMin,
    onChangeMax,
    t,
}) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('calories') || 'Calories'} (kcal)
        </span>
        <div className="flex items-center gap-2">
            <input
                type="number"
                min="0"
                placeholder={t('min_calories') || 'Min'}
                aria-label={t('min_calories') || 'Min calories'}
                value={minCalories}
                onChange={(e) => onChangeMin(e.target.value)}
                className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                data-testid="min-calories-input"
            />
            <span className="text-neutral-400">-</span>
            <input
                type="number"
                min="0"
                placeholder={t('max_calories') || 'Max'}
                aria-label={t('max_calories') || 'Max calories'}
                value={maxCalories}
                onChange={(e) => onChangeMax(e.target.value)}
                className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                data-testid="max-calories-input"
            />
        </div>
    </div>
);

interface YieldFilterSectionProps {
    minYield: string;
    maxYield: string;
    onChangeMin: (val: string) => void;
    onChangeMax: (val: string) => void;
    t: (key: string, options?: { defaultValue?: string }) => string;
}

const YieldFilterSection: React.FC<YieldFilterSectionProps> = ({
    minYield,
    maxYield,
    onChangeMin,
    onChangeMax,
    t,
}) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('yield') || 'Servings'}
        </span>
        <div className="flex items-center gap-2">
            <input
                type="number"
                min="1"
                placeholder={t('min_yield') || 'Min'}
                aria-label={t('min_yield') || 'Min servings'}
                value={minYield}
                onChange={(e) => onChangeMin(e.target.value)}
                className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                data-testid="min-yield-input"
            />
            <span className="text-neutral-400">-</span>
            <input
                type="number"
                min="1"
                placeholder={t('max_yield') || 'Max'}
                aria-label={t('max_yield') || 'Max servings'}
                value={maxYield}
                onChange={(e) => onChangeMax(e.target.value)}
                className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                data-testid="max-yield-input"
            />
        </div>
    </div>
);

interface CuisineFilterSectionProps {
    cuisine: string;
    onPillClick: (val: string) => void;
    t: (key: string, options?: { defaultValue?: string }) => string;
}

const CuisineFilterSection: React.FC<CuisineFilterSectionProps> = ({
    cuisine,
    onPillClick,
    t,
}) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('recipe_cuisine') || 'Cuisine'}
        </span>
        <div className="flex max-h-[160px] flex-wrap gap-1.5 overflow-y-auto pr-1">
            {RECIPE_CUISINES.map((popCuisine) => {
                const translationKey = `cuisine_${popCuisine.toLowerCase().replace(/\s+/g, '_')}`;
                const label = t(translationKey, {
                    defaultValue: popCuisine,
                });
                const isSelected =
                    cuisine.toLowerCase() === popCuisine.toLowerCase();

                return (
                    <button
                        key={popCuisine}
                        type="button"
                        onClick={() => onPillClick(popCuisine)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                            isSelected
                                ? 'bg-green-450 font-semibold text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                        }`}
                        data-testid={`cuisine-pill-${popCuisine.toLowerCase()}`}
                    >
                        <CuisineIcon
                            cuisine={popCuisine}
                            size={14}
                        />
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    </div>
);

interface DateFilterSectionProps {
    startDate: string;
    endDate: string;
    onChangeStart: (val: string) => void;
    onChangeEnd: (val: string) => void;
    t: (key: string, options?: { defaultValue?: string }) => string;
}

const DateFilterSection: React.FC<DateFilterSectionProps> = ({
    startDate,
    endDate,
    onChangeStart,
    onChangeEnd,
    t,
}) => {
    const today = new Date().toISOString().split('T')[0];
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('date') || 'Date'}
            </span>
            <div className="flex items-center gap-2">
                <input
                    id="advanced-filter-start-date"
                    aria-label={t('from_date') || 'From date'}
                    type="date"
                    value={startDate}
                    max={endDate || today}
                    onChange={(e) => onChangeStart(e.target.value)}
                    className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                    data-testid="start-date-input"
                />
                <span className="text-neutral-400">-</span>
                <input
                    id="advanced-filter-end-date"
                    aria-label={t('to_date') || 'To date'}
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={today}
                    onChange={(e) => onChangeEnd(e.target.value)}
                    className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                    data-testid="end-date-input"
                />
            </div>
        </div>
    );
};

const AdvancedFiltersComponent: React.FC = () => {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const {
        dropdownRef,
        isOpen,
        hasActiveFilters,
        tempMinCalories,
        tempMaxCalories,
        tempMinYield,
        tempMaxYield,
        tempCuisine,
        tempStartDate,
        tempEndDate,
        isAnyTempFilterSet,
        dispatch,
        handleApply,
        handleClear,
        handleCuisinePillClick,
    } = useAdvancedFilters(searchParams);

    return (
        <div
            className="relative"
            ref={dropdownRef}
            data-testid="advanced-filters-container"
        >
            <button
                type="button"
                onClick={() => dispatch({ type: 'SET_OPEN', payload: !isOpen })}
                className={`relative cursor-pointer rounded-full p-2 shadow-xs transition hover:shadow-md ${
                    hasActiveFilters
                        ? 'bg-green-450 dark:text-dark text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
                aria-label={t('filter_options') || 'Filter options'}
                aria-expanded={isOpen}
                data-testid="advanced-filters-button"
            >
                <FiSliders size={18} />
                {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                )}
            </button>

            {isOpen && (
                <div
                    className="dark:bg-dark/97 absolute top-12 right-0 z-50 max-w-[340px] min-w-[320px] rounded-xl border border-neutral-200/40 bg-white/97 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.03)] backdrop-blur-lg transition-all duration-300 dark:border-neutral-800/40 dark:shadow-[0_2px_20px_rgba(0,0,0,0.15)]"
                    style={{
                        animation: 'dropdownFadeIn 0.15s ease-out forwards',
                    }}
                    data-testid="advanced-filters-dropdown"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                                {t('filter_options') || 'Filter options'}
                            </h3>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                                    aria-label={
                                        t('clear_all_filters') ||
                                        'Clear all filters'
                                    }
                                    data-testid="clear-filters-button"
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>

                        <CalorieFilterSection
                            minCalories={tempMinCalories}
                            maxCalories={tempMaxCalories}
                            onChangeMin={(val) =>
                                dispatch({
                                    type: 'SET_MIN_CALORIES',
                                    payload: val,
                                })
                            }
                            onChangeMax={(val) =>
                                dispatch({
                                    type: 'SET_MAX_CALORIES',
                                    payload: val,
                                })
                            }
                            t={t}
                        />

                        <YieldFilterSection
                            minYield={tempMinYield}
                            maxYield={tempMaxYield}
                            onChangeMin={(val) =>
                                dispatch({
                                    type: 'SET_MIN_YIELD',
                                    payload: val,
                                })
                            }
                            onChangeMax={(val) =>
                                dispatch({
                                    type: 'SET_MAX_YIELD',
                                    payload: val,
                                })
                            }
                            t={t}
                        />

                        <DateFilterSection
                            startDate={tempStartDate}
                            endDate={tempEndDate}
                            onChangeStart={(val) =>
                                dispatch({
                                    type: 'SET_START_DATE',
                                    payload: val,
                                })
                            }
                            onChangeEnd={(val) =>
                                dispatch({
                                    type: 'SET_END_DATE',
                                    payload: val,
                                })
                            }
                            t={t}
                        />

                        <CuisineFilterSection
                            cuisine={tempCuisine}
                            onPillClick={handleCuisinePillClick}
                            t={t}
                        />

                        <div className="flex gap-2 pt-2">
                            <div className="flex-1">
                                <Button
                                    label={t('cancel') || 'Cancel'}
                                    onClick={() =>
                                        dispatch({
                                            type: 'SET_OPEN',
                                            payload: false,
                                        })
                                    }
                                    outline
                                    small
                                    dataCy="cancel-filters-button"
                                />
                            </div>
                            <div className="flex-1">
                                <Button
                                    label={t('apply') || 'Apply'}
                                    onClick={handleApply}
                                    disabled={!isAnyTempFilterSet}
                                    small
                                    dataCy="apply-filters-button"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdvancedFilters: React.FC = () => (
    <Suspense fallback={<AdvancedFiltersSkeleton />}>
        <AdvancedFiltersComponent />
    </Suspense>
);

export const AdvancedFiltersSkeleton = () => (
    <div className="bg-neutral-100 dark:bg-neutral-800 relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full p-2">
        <div className="size-5 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
    </div>
);

export default AdvancedFilters;
