'use client';

import { useReducer, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { advancedFiltersReducer } from '@/app/components/navbar/advancedFiltersReducer';

export const useAdvancedFilters = (
    searchParams: ReturnType<typeof useSearchParams>
) => {
    const { replace } = useRouter() || {};
    const get = searchParams ? searchParams.get.bind(searchParams) : () => null;
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isMainPage = pathname === '/';
    const isFavoritesPage = pathname === '/favorites';
    const isFilterablePage = isMainPage || isFavoritesPage;

    const currentMinCalories = get('minCalories') || '';
    const currentMaxCalories = get('maxCalories') || '';
    const currentMinYield = get('minYield') || '';
    const currentMaxYield = get('maxYield') || '';
    const currentCuisine = get('recipeCuisine') || '';
    const currentStartDate = get('startDate') || '';
    const currentEndDate = get('endDate') || '';

    const hasActiveFilters = !!(
        currentMinCalories ||
        currentMaxCalories ||
        currentMinYield ||
        currentMaxYield ||
        currentCuisine ||
        currentStartDate ||
        currentEndDate
    );

    const [state, dispatch] = useReducer(advancedFiltersReducer, {
        isOpen: false,
        tempMinCalories: currentMinCalories,
        tempMaxCalories: currentMaxCalories,
        tempMinYield: currentMinYield,
        tempMaxYield: currentMaxYield,
        tempCuisine: currentCuisine,
        tempStartDate: currentStartDate,
        tempEndDate: currentEndDate,
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
                minCalories: currentMinCalories,
                maxCalories: currentMaxCalories,
                minYield: currentMinYield,
                maxYield: currentMaxYield,
                recipeCuisine: currentCuisine,
                startDate: currentStartDate,
                endDate: currentEndDate,
            },
        });
    }, [
        isOpen,
        currentMinCalories,
        currentMaxCalories,
        currentMinYield,
        currentMaxYield,
        currentCuisine,
        currentStartDate,
        currentEndDate,
    ]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                dispatch({ type: 'SET_OPEN', payload: false });
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const updateUrlWithFilters = (
        minCal: string,
        maxCal: string,
        minYld: string,
        maxYld: string,
        cuisine: string,
        startDate: string,
        endDate: string
    ) => {
        if (!isFilterablePage) return;

        const params = new URLSearchParams(searchParams?.toString() || '');

        if (minCal) params.set('minCalories', minCal);
        else params.delete('minCalories');

        if (maxCal) params.set('maxCalories', maxCal);
        else params.delete('maxCalories');

        if (minYld) params.set('minYield', minYld);
        else params.delete('minYield');

        if (maxYld) params.set('maxYield', maxYld);
        else params.delete('maxYield');

        if (cuisine) params.set('recipeCuisine', cuisine);
        else params.delete('recipeCuisine');

        if (startDate) params.set('startDate', startDate);
        else params.delete('startDate');

        if (endDate) params.set('endDate', endDate);
        else params.delete('endDate');

        params.delete('page'); // Reset pagination to page 1

        const newUrl = isMainPage
            ? params.toString()
                ? `/?${params.toString()}`
                : '/'
            : params.toString()
              ? `${pathname}?${params.toString()}`
              : pathname;

        replace(newUrl);
    };

    const handleApply = () => {
        updateUrlWithFilters(
            tempMinCalories,
            tempMaxCalories,
            tempMinYield,
            tempMaxYield,
            tempCuisine,
            tempStartDate,
            tempEndDate
        );
        dispatch({ type: 'SET_OPEN', payload: false });
    };

    const handleClear = () => {
        dispatch({ type: 'CLEAR_FILTERS' });
        if (isFilterablePage) {
            updateUrlWithFilters('', '', '', '', '', '', '');
        }
    };

    const handleCuisinePillClick = (cuisineName: string) => {
        if (tempCuisine.toLowerCase() === cuisineName.toLowerCase()) {
            dispatch({ type: 'SET_CUISINE', payload: '' });
        } else {
            dispatch({ type: 'SET_CUISINE', payload: cuisineName });
        }
    };

    const isAnyTempFilterSet = !!(
        tempMinCalories ||
        tempMaxCalories ||
        tempMinYield ||
        tempMaxYield ||
        tempCuisine ||
        tempStartDate ||
        tempEndDate
    );

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
