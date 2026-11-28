'use client';

import { Suspense } from 'react';
import { FiRotateCcw, FiSliders } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import Modal from '@/app/components/modals/Modal';
import Tooltip from '@/app/components/utils/Tooltip';
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
} from '@/app/components/navbar/AdvancedFilterSections';

const AdvancedFiltersModalContent: React.FC = () => {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const {
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
        handleClose,
        handleApply,
        handleClear,
        handleCuisinePillClick,
        handleDifficultyPillClick,
        handleDietaryTagToggle,
        handleAllergenToggle,
    } = useAdvancedFilters(searchParams);

    const clearLabel = String(t('clear_all_filters') || 'Clear all filters');

    const bodyContent = (
        <div
            className="flex flex-col gap-5 md:max-h-[60vh] md:overflow-y-auto md:pr-1"
            data-testid="advanced-filters-modal"
            data-cy="advanced-filters-modal"
        >
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
    );

    const topButton =
        hasActiveFilters || isAnyTempFilterSet ? (
            <Tooltip
                text={clearLabel}
                position="left"
            >
                <button
                    type="button"
                    onClick={handleClear}
                    className="hover:text-green-450 dark:hover:text-green-450 flex cursor-pointer items-center justify-center rounded-full p-1 text-black transition dark:text-neutral-100"
                    aria-label={clearLabel}
                    data-testid="clear-filters-button"
                    data-cy="clear-filters-button"
                >
                    <FiRotateCcw size={18} />
                </button>
            </Tooltip>
        ) : undefined;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleApply}
            title={String(t('filter_options') || 'Filter options')}
            icon={FiSliders}
            body={bodyContent}
            actionLabel={String(t('apply') || 'Apply')}
            actionDisabled={!isAnyTempFilterSet && !hasActiveFilters}
            secondaryAction={handleClose}
            secondaryActionLabel={String(t('cancel') || 'Cancel')}
            topButton={topButton}
        />
    );
};

const AdvancedFiltersModal: React.FC = () => (
    <Suspense fallback={null}>
        <AdvancedFiltersModalContent />
    </Suspense>
);

export default AdvancedFiltersModal;
