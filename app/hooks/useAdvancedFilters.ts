'use client';

import { useReducer, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { advancedFiltersReducer } from '@/app/components/navbar/advancedFiltersReducer';
import useAdvancedFiltersModal from '@/app/hooks/useAdvancedFiltersModal';
import { parseListParam } from '@/app/utils/filter';

export interface AdvancedFilterValues {
    minCalories: string;
    maxCalories: string;
    minYield: string;
    maxYield: string;
    recipeCuisine: string;
    startDate: string;
    endDate: string;
    difficulty: string;
    dietaryTags: string[];
    excludeAllergens: string[];
    minProtein: string;
    maxCarbohydrates: string;
    maxFat: string;
}

export const EMPTY_ADVANCED_FILTERS: AdvancedFilterValues = {
    minCalories: '',
    maxCalories: '',
    minYield: '',
    maxYield: '',
    recipeCuisine: '',
    startDate: '',
    endDate: '',
    difficulty: '',
    dietaryTags: [],
    excludeAllergens: [],
    minProtein: '',
    maxCarbohydrates: '',
    maxFat: '',
};

export const FILTER_KEY_MAP: Array<{
    key: keyof AdvancedFilterValues;
    param: string;
}> = [
    { key: 'minCalories', param: 'minCalories' },
    { key: 'maxCalories', param: 'maxCalories' },
    { key: 'minYield', param: 'minYield' },
    { key: 'maxYield', param: 'maxYield' },
    { key: 'recipeCuisine', param: 'recipeCuisine' },
    { key: 'startDate', param: 'startDate' },
    { key: 'endDate', param: 'endDate' },
    { key: 'difficulty', param: 'difficulty' },
    { key: 'dietaryTags', param: 'dietaryTags' },
    { key: 'excludeAllergens', param: 'excludeAllergens' },
    { key: 'minProtein', param: 'minProtein' },
    { key: 'maxCarbohydrates', param: 'maxCarbohydrates' },
    { key: 'maxFat', param: 'maxFat' },
];

export const extractFilterValues = (
    searchParams: ReturnType<typeof useSearchParams>
): AdvancedFilterValues => {
    const get = (key: string) => searchParams?.get(key) || '';
    return {
        minCalories: get('minCalories'),
        maxCalories: get('maxCalories'),
        minYield: get('minYield'),
        maxYield: get('maxYield'),
        recipeCuisine: get('recipeCuisine'),
        startDate: get('startDate'),
        endDate: get('endDate'),
        difficulty: get('difficulty'),
        dietaryTags: parseListParam(get('dietaryTags')),
        excludeAllergens: parseListParam(get('excludeAllergens')),
        minProtein: get('minProtein'),
        maxCarbohydrates: get('maxCarbohydrates'),
        maxFat: get('maxFat'),
    };
};

export const hasAnyFilterSet = (
    filters: Partial<AdvancedFilterValues>
): boolean => {
    return Object.values(filters).some((value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value)
    );
};

export const isFilterablePath = (pathname: string | null): boolean => {
    return pathname === '/' || pathname === '/favorites';
};

export const getNextCuisine = (
    currentCuisine: string,
    selectedCuisine: string
): string => {
    return currentCuisine.toLowerCase() === selectedCuisine.toLowerCase()
        ? ''
        : selectedCuisine;
};

export const getNextDifficulty = (
    currentDifficulty: string,
    selectedDifficulty: string
): string => {
    return currentDifficulty.toLowerCase() === selectedDifficulty.toLowerCase()
        ? ''
        : selectedDifficulty;
};

export const buildFilterUrl = (
    pathname: string | null,
    currentSearchParams: ReturnType<typeof useSearchParams>,
    filters: AdvancedFilterValues
): string => {
    const validPathname = pathname || '/';
    const params = new URLSearchParams(currentSearchParams?.toString() || '');

    for (const { key, param } of FILTER_KEY_MAP) {
        const val = filters[key];
        const serialized = Array.isArray(val) ? val.join(',') : val;
        if (serialized) {
            params.set(param, serialized);
        } else {
            params.delete(param);
        }
    }

    params.delete('page'); // Reset pagination to page 1

    const queryString = params.toString();
    if (validPathname === '/') {
        return queryString ? `/?${queryString}` : '/';
    }

    return queryString ? `${validPathname}?${queryString}` : validPathname;
};

export const useAdvancedFilters = (
    searchParams: ReturnType<typeof useSearchParams>
) => {
    const { replace } = useRouter() || {};
    const pathname = usePathname();
    const isOpen = useAdvancedFiltersModal((state) => state.isOpen);
    const onClose = useAdvancedFiltersModal((state) => state.onClose);

    const isFilterablePage = isFilterablePath(pathname);
    const currentFilters = extractFilterValues(searchParams);
    const hasActiveFilters = hasAnyFilterSet(currentFilters);
    const dietaryTagsKey = currentFilters.dietaryTags.join(',');
    const excludeAllergensKey = currentFilters.excludeAllergens.join(',');

    const [state, dispatch] = useReducer(advancedFiltersReducer, {
        tempMinCalories: currentFilters.minCalories,
        tempMaxCalories: currentFilters.maxCalories,
        tempMinYield: currentFilters.minYield,
        tempMaxYield: currentFilters.maxYield,
        tempCuisine: currentFilters.recipeCuisine,
        tempStartDate: currentFilters.startDate,
        tempEndDate: currentFilters.endDate,
        tempDifficulty: currentFilters.difficulty,
        tempDietaryTags: currentFilters.dietaryTags,
        tempExcludeAllergens: currentFilters.excludeAllergens,
        tempMinProtein: currentFilters.minProtein,
        tempMaxCarbohydrates: currentFilters.maxCarbohydrates,
        tempMaxFat: currentFilters.maxFat,
    });

    const {
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
    } = state;

    // Sync state with URL params on open or url changes
    useEffect(() => {
        dispatch({
            type: 'SYNC_FILTERS',
            payload: {
                minCalories: currentFilters.minCalories,
                maxCalories: currentFilters.maxCalories,
                minYield: currentFilters.minYield,
                maxYield: currentFilters.maxYield,
                recipeCuisine: currentFilters.recipeCuisine,
                startDate: currentFilters.startDate,
                endDate: currentFilters.endDate,
                difficulty: currentFilters.difficulty,
                dietaryTags: parseListParam(dietaryTagsKey),
                excludeAllergens: parseListParam(excludeAllergensKey),
                minProtein: currentFilters.minProtein,
                maxCarbohydrates: currentFilters.maxCarbohydrates,
                maxFat: currentFilters.maxFat,
            },
        });
    }, [
        isOpen,
        currentFilters.minCalories,
        currentFilters.maxCalories,
        currentFilters.minYield,
        currentFilters.maxYield,
        currentFilters.recipeCuisine,
        currentFilters.startDate,
        currentFilters.endDate,
        currentFilters.difficulty,
        dietaryTagsKey,
        excludeAllergensKey,
        currentFilters.minProtein,
        currentFilters.maxCarbohydrates,
        currentFilters.maxFat,
    ]);

    const applyFiltersToUrl = useCallback(
        (filters: AdvancedFilterValues) => {
            if (!isFilterablePage || !replace) return;
            const newUrl = buildFilterUrl(pathname, searchParams, filters);
            replace(newUrl);
        },
        [isFilterablePage, replace, pathname, searchParams]
    );

    const handleApply = useCallback(() => {
        applyFiltersToUrl({
            minCalories: tempMinCalories,
            maxCalories: tempMaxCalories,
            minYield: tempMinYield,
            maxYield: tempMaxYield,
            recipeCuisine: tempCuisine,
            startDate: tempStartDate,
            endDate: tempEndDate,
            difficulty: tempDifficulty,
            dietaryTags: tempDietaryTags,
            excludeAllergens: tempExcludeAllergens,
            minProtein: tempMinProtein,
            maxCarbohydrates: tempMaxCarbohydrates,
            maxFat: tempMaxFat,
        });
        onClose();
    }, [
        applyFiltersToUrl,
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
        onClose,
    ]);

    const handleClear = useCallback(() => {
        dispatch({ type: 'CLEAR_FILTERS' });
        if (hasActiveFilters) {
            applyFiltersToUrl(EMPTY_ADVANCED_FILTERS);
            onClose();
        }
    }, [dispatch, hasActiveFilters, applyFiltersToUrl, onClose]);

    const handleCuisinePillClick = useCallback(
        (cuisineName: string) => {
            dispatch({
                type: 'SET_CUISINE',
                payload: getNextCuisine(tempCuisine, cuisineName),
            });
        },
        [dispatch, tempCuisine]
    );

    const handleDifficultyPillClick = useCallback(
        (difficultyLevel: string) => {
            dispatch({
                type: 'SET_DIFFICULTY',
                payload: getNextDifficulty(tempDifficulty, difficultyLevel),
            });
        },
        [dispatch, tempDifficulty]
    );

    const handleDietaryTagToggle = useCallback(
        (tag: string) => {
            dispatch({
                type: 'TOGGLE_DIETARY_TAG',
                payload: tag,
            });
        },
        [dispatch]
    );

    const handleAllergenToggle = useCallback(
        (allergen: string) => {
            dispatch({
                type: 'TOGGLE_EXCLUDE_ALLERGEN',
                payload: allergen,
            });
        },
        [dispatch]
    );

    const isAnyTempFilterSet = hasAnyFilterSet({
        minCalories: tempMinCalories,
        maxCalories: tempMaxCalories,
        minYield: tempMinYield,
        maxYield: tempMaxYield,
        recipeCuisine: tempCuisine,
        startDate: tempStartDate,
        endDate: tempEndDate,
        difficulty: tempDifficulty,
        dietaryTags: tempDietaryTags,
        excludeAllergens: tempExcludeAllergens,
        minProtein: tempMinProtein,
        maxCarbohydrates: tempMaxCarbohydrates,
        maxFat: tempMaxFat,
    });

    return {
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
        handleClose: onClose,
        handleApply,
        handleClear,
        handleCuisinePillClick,
        handleDifficultyPillClick,
        handleDietaryTagToggle,
        handleAllergenToggle,
    };
};
