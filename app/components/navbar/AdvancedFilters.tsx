'use client';

import { Suspense } from 'react';
import { FiSliders, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Button from '../buttons/Button';
import { useSearchParams } from 'next/navigation';
import { useAdvancedFilters } from '@/app/hooks/useAdvancedFilters';
import {
    CalorieFilterSection,
    CuisineFilterSection,
    DateFilterSection,
    DietaryTagsFilterSection,
    DifficultyFilterSection,
    ExcludeAllergensFilterSection,
    MacrosFilterSection,
    YieldFilterSection,
} from './AdvancedFilterSections';

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
        tempDifficulty,
        tempDietaryTags,
        tempExcludeAllergens,
        tempMinProtein,
        tempMaxCarbohydrates,
        tempMaxFat,
        isAnyTempFilterSet,
        dispatch,
        handleApply,
        handleClear,
        handleCuisinePillClick,
        handleDifficultyPillClick,
        handleDietaryTagToggle,
        handleAllergenToggle,
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
                aria-label={String(t('filter_options') || 'Filter options')}
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
                    className="dark:bg-dark/97 absolute top-12 right-0 z-50 flex max-h-[75vh] w-[min(calc(100vw-2rem),360px)] flex-col rounded-xl border border-neutral-200/40 bg-white/97 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.03)] backdrop-blur-lg transition duration-300 dark:border-neutral-800/40 dark:shadow-[0_2px_20px_rgba(0,0,0,0.15)]"
                    style={{
                        animation: 'dropdownFadeIn 0.15s ease-out forwards',
                    }}
                    data-testid="advanced-filters-dropdown"
                >
                    <div className="flex items-center justify-between pb-3">
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                            {t('filter_options') || 'Filter options'}
                        </h3>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="cursor-pointer rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                                aria-label={String(
                                    t('clear_all_filters') ||
                                        'Clear all filters'
                                )}
                                data-testid="clear-filters-button"
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                        <DifficultyFilterSection
                            difficulty={tempDifficulty}
                            onPillClick={handleDifficultyPillClick}
                            t={t}
                        />

                        <DietaryTagsFilterSection
                            selectedTags={tempDietaryTags}
                            onToggleTag={handleDietaryTagToggle}
                            t={t}
                        />

                        <ExcludeAllergensFilterSection
                            excludedAllergens={tempExcludeAllergens}
                            onToggleAllergen={handleAllergenToggle}
                            t={t}
                        />

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

                        <MacrosFilterSection
                            minProtein={tempMinProtein}
                            maxCarbohydrates={tempMaxCarbohydrates}
                            maxFat={tempMaxFat}
                            onChangeMinProtein={(val) =>
                                dispatch({
                                    type: 'SET_MIN_PROTEIN',
                                    payload: val,
                                })
                            }
                            onChangeMaxCarbohydrates={(val) =>
                                dispatch({
                                    type: 'SET_MAX_CARBOHYDRATES',
                                    payload: val,
                                })
                            }
                            onChangeMaxFat={(val) =>
                                dispatch({
                                    type: 'SET_MAX_FAT',
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
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-neutral-200/60 pt-3 dark:border-neutral-800/60">
                        <div className="flex-1">
                            <Button
                                label={String(t('cancel') || 'Cancel')}
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
                                label={String(t('apply') || 'Apply')}
                                onClick={handleApply}
                                disabled={
                                    !isAnyTempFilterSet && !hasActiveFilters
                                }
                                small
                                dataCy="apply-filters-button"
                            />
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
    <div className="relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-neutral-100 p-2 dark:bg-neutral-800">
        <div className="size-5 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
    </div>
);

export default AdvancedFilters;
