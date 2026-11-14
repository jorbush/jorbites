'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@/app/hooks/useMediaQuery';

interface UseNavbarSearchParams {
    onSearchModeChange?: (isSearchMode: boolean) => void;
    isFilterOpen?: boolean;
}

export const useNavbarSearch = ({
    onSearchModeChange,
    isFilterOpen,
}: UseNavbarSearchParams = {}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const get = searchParams ? searchParams.get.bind(searchParams) : () => null;
    const pathname = usePathname();
    const currentSearch = get('search') || '';
    const [isSearchMode, setIsSearchMode] = useState(Boolean(currentSearch));
    const [searchQuery, setSearchQuery] = useState(currentSearch);
    const inputRef = useRef<HTMLInputElement>(null);
    const onSearchModeChangeRef = useRef(onSearchModeChange);

    useEffect(() => {
        onSearchModeChangeRef.current = onSearchModeChange;
    }, [onSearchModeChange]);

    const isMobile = useMediaQuery('(max-width: 768px)');

    const isMainPage = pathname === '/';
    const isFavoritesPage = pathname === '/favorites';
    const isFilterablePage = isMainPage || isFavoritesPage;
    const isFiltering = get('category') || '';

    const currentStartDate = get('startDate') || '';
    const currentEndDate = get('endDate') || '';
    const currentMinCalories = get('minCalories') || '';
    const currentMaxCalories = get('maxCalories') || '';
    const currentMinYield = get('minYield') || '';
    const currentMaxYield = get('maxYield') || '';
    const currentCuisine = get('recipeCuisine') || '';
    const hasActiveFilters = Boolean(
        isFiltering ||
        currentStartDate ||
        currentEndDate ||
        currentMinCalories ||
        currentMaxCalories ||
        currentMinYield ||
        currentMaxYield ||
        currentCuisine
    );

    const prevCurrentSearchRef = useRef(currentSearch);

    useEffect(() => {
        if (currentSearch !== prevCurrentSearchRef.current) {
            prevCurrentSearchRef.current = currentSearch;
            setSearchQuery(currentSearch);
            if (currentSearch) {
                setIsSearchMode(true);
                onSearchModeChangeRef.current?.(true);
            } else {
                setIsSearchMode(false);
                onSearchModeChangeRef.current?.(false);
            }
        }
    }, [currentSearch]);

    const hasFiredInitialRef = useRef(false);
    useEffect(() => {
        if (!hasFiredInitialRef.current) {
            hasFiredInitialRef.current = true;
            if (currentSearch) {
                onSearchModeChangeRef.current?.(true);
            }
        }
    }, [currentSearch]);

    const handleSearchSubmit = useCallback(
        (e?: React.FormEvent) => {
            if (e) {
                e.preventDefault();
            }
            if (!isFilterablePage) return;
            const params = new URLSearchParams(searchParams?.toString() || '');
            if (searchQuery.trim()) {
                params.set('search', searchQuery.trim());
            } else {
                params.delete('search');
            }
            params.delete('page');
            const newUrl = isMainPage
                ? params.toString()
                    ? `/?${params.toString()}`
                    : '/'
                : params.toString()
                  ? `${pathname}?${params.toString()}`
                  : pathname;
            router?.replace(newUrl);
        },
        [
            isFilterablePage,
            isMainPage,
            pathname,
            router,
            searchParams,
            searchQuery,
        ]
    );

    const handleSearchToggle = useCallback(() => {
        if (isSearchMode) {
            setIsSearchMode(false);
            onSearchModeChangeRef.current?.(false);
            if (isFilterablePage && currentSearch) {
                const params = new URLSearchParams(
                    searchParams?.toString() || ''
                );
                params.delete('search');
                const newUrl = isMainPage
                    ? params.toString()
                        ? `/?${params.toString()}`
                        : '/'
                    : params.toString()
                      ? `${pathname}?${params.toString()}`
                      : pathname;
                router?.push(newUrl);
            }
        } else {
            setIsSearchMode(true);
            setTimeout(() => inputRef.current?.focus(), 200);
            onSearchModeChangeRef.current?.(true);
        }
    }, [
        currentSearch,
        isFilterablePage,
        isMainPage,
        isSearchMode,
        pathname,
        router,
        searchParams,
    ]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleSearchToggle();
            }
        },
        [handleSearchToggle]
    );

    const filtersState = {
        isOpen: isFilterOpen,
        isFiltering: Boolean(isFiltering),
        hasActive: hasActiveFilters,
    };

    return {
        isMobile,
        isSearchMode,
        searchQuery,
        inputRef,
        handleSearchToggle,
        handleSearchSubmit,
        handleSearchChange,
        handleKeyDown,
        filtersState,
        isFilterablePage,
        t,
    };
};
