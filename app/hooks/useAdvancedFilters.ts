'use client';

import { useReducer, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { advancedFiltersReducer } from '@/app/components/navbar/advancedFiltersReducer';

export interface AdvancedFilterValues {
    minCalories: string;
    maxCalories: string;
    minYield: string;
    maxYield: string;
    recipeCuisine: string;
    startDate: string;
    endDate: string;
}

export const EMPTY_ADVANCED_FILTERS: AdvancedFilterValues = {
    minCalories: '',
    maxCalories: '',
    minYield: '',
    maxYield: '',
    recipeCuisine: '',
    startDate: '',
    endDate: '',
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
    };
};

export const hasAnyFilterSet = (
    filters: Partial<AdvancedFilterValues>
): boolean => {
    return Object.values(filters).some(Boolean);
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

export const buildFilterUrl = (
    pathname: string | null,
    currentSearchParams: ReturnType<typeof useSearchParams>,
    filters: AdvancedFilterValues
): string => {
    const validPathname = pathname || '/';
    const params = new URLSearchParams(currentSearchParams?.toString() || '');

    for (const { key, param } of FILTER_KEY_MAP) {
        const val = filters[key];
        if (val) {
            params.set(param, val);
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

export const useDropdownOutsideClick = (
    ref: React.RefObject<HTMLDivElement | null>,
    isOpen: boolean,
    onClose: () => void
) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, ref, onClose]);
};

export const useAdvancedFilters = (
    searchParams: ReturnType<typeof useSearchParams>
) => {
    const { replace } = useRouter() || {};
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isFilterablePage = isFilterablePath(pathname);
    const currentFilters = extractFilterValues(searchParams);
    const hasActiveFilters = hasAnyFilterSet(currentFilters);

    const [state, dispatch] = useReducer(advancedFiltersReducer, {
        isOpen: false,
        tempMinCalories: currentFilters.minCalories,
        tempMaxCalories: currentFilters.maxCalories,
        tempMinYield: currentFilters.minYield,
        tempMaxYield: currentFilters.maxYield,
        tempCuisine: currentFilters.recipeCuisine,
        tempStartDate: currentFilters.startDate,
        tempEndDate: currentFilters.endDate,
    });

    const {
        isOpen,
        tempMinCalories,
        tempMaxCalories,
        tempMinYield,
        tempMaxYield,
        tempCuisine,
        tempStartDate,
        tempEndDate,
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
    ]);

    const handleClose = useCallback(() => {
        dispatch({ type: 'SET_OPEN', payload: false });
    }, [dispatch]);

    useDropdownOutsideClick(dropdownRef, isOpen, handleClose);

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
        });
        handleClose();
    }, [
        applyFiltersToUrl,
        tempMinCalories,
        tempMaxCalories,
        tempMinYield,
        tempMaxYield,
        tempCuisine,
        tempStartDate,
        tempEndDate,
        handleClose,
    ]);

    const handleClear = useCallback(() => {
        dispatch({ type: 'CLEAR_FILTERS' });
        applyFiltersToUrl(EMPTY_ADVANCED_FILTERS);
    }, [dispatch, applyFiltersToUrl]);

    const handleCuisinePillClick = useCallback(
        (cuisineName: string) => {
            dispatch({
                type: 'SET_CUISINE',
                payload: getNextCuisine(tempCuisine, cuisineName),
            });
        },
        [dispatch, tempCuisine]
    );

    const isAnyTempFilterSet = hasAnyFilterSet({
        minCalories: tempMinCalories,
        maxCalories: tempMaxCalories,
        minYield: tempMinYield,
        maxYield: tempMaxYield,
        recipeCuisine: tempCuisine,
        startDate: tempStartDate,
        endDate: tempEndDate,
    });

    return {
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
    };
};
