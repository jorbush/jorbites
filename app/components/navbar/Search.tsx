'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DesktopSearch from './DesktopSearch';
import MobileSearch from './MobileSearch';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import Logo from './Logo';

export const SearchFallback = () => {
    return (
        <div className="flex flex-row items-center gap-1 md:gap-3">
            <Logo />
            <div className="bg-green-450/10 dark:bg-green-450/20 relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full p-2" />
        </div>
    );
};

interface SearchProps {
    onFilterToggle?: () => void;
    isFilterOpen?: boolean;
    onSearchModeChange?: (isSearchMode: boolean) => void;
}

const SearchComponent: React.FC<SearchProps> = ({
    onSearchModeChange,
    onFilterToggle,
    isFilterOpen,
}) => {
    const { t } = useTranslation();
    const { push, replace } = useRouter() || {};
    const searchParams = useSearchParams();
    const get = searchParams ? searchParams.get.bind(searchParams) : () => null;
    const pathname = usePathname();
    const currentSearch = get('search') || '';

    const [prevCurrentSearch, setPrevCurrentSearch] = useState(currentSearch);
    const [isSearchMode, setIsSearchMode] = useState(Boolean(currentSearch));
    const [searchQuery, setSearchQuery] = useState(currentSearch);

    // Adjust state during render when currentSearch changes (e.g. browser native back button)
    if (currentSearch !== prevCurrentSearch) {
        setPrevCurrentSearch(currentSearch);
        setSearchQuery(currentSearch);
        setIsSearchMode(Boolean(currentSearch));
    }

    const inputRef = useRef<HTMLInputElement>(null);
    const onSearchModeChangeRef = useRef(onSearchModeChange);

    useEffect(() => {
        onSearchModeChangeRef.current = onSearchModeChange;
    }, [onSearchModeChange]);

    // Track isSearchMode and propagate change to parent cleanly without writing local state
    const prevIsSearchModeRef = useRef(isSearchMode);
    useEffect(() => {
        if (isSearchMode !== prevIsSearchModeRef.current) {
            prevIsSearchModeRef.current = isSearchMode;
            onSearchModeChangeRef.current?.(isSearchMode);
        }
    }, [isSearchMode]);

    // Handle initial load notification
    const hasFiredInitialRef = useRef(false);
    useEffect(() => {
        if (!hasFiredInitialRef.current) {
            hasFiredInitialRef.current = true;
            if (currentSearch) {
                onSearchModeChangeRef.current?.(true);
            }
        }
    }, [currentSearch]);

    const isMobile = useMediaQuery('(max-width: 768px)');

    const isMainPage = pathname === '/';
    const isFavoritesPage = pathname === '/favorites';
    const isFilterablePage = isMainPage || isFavoritesPage;
    const isFiltering = get('category') || '';

    const currentStartDate = get('startDate') || '';
    const currentEndDate = get('endDate') || '';
    const currentOrderBy = get('orderBy') || '';
    const currentMinCalories = get('minCalories') || '';
    const currentMaxCalories = get('maxCalories') || '';
    const currentMinYield = get('minYield') || '';
    const currentMaxYield = get('maxYield') || '';
    const currentCuisine = get('recipeCuisine') || '';
    const hasActiveFilters =
        isFiltering ||
        currentStartDate ||
        currentEndDate ||
        currentOrderBy ||
        currentMinCalories ||
        currentMaxCalories ||
        currentMinYield ||
        currentMaxYield ||
        currentCuisine;

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (!isFilterablePage) return;
        const params = new URLSearchParams(searchParams?.toString() || '');
        const query = searchQuery.trim();
        if (query) {
            params.set('search', query);
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

        if (!query) {
            setIsSearchMode(false);
        }
        replace(newUrl);
    };

    const handleSearchToggle = () => {
        if (isSearchMode) {
            setIsSearchMode(false);
            setSearchQuery('');
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
                push(newUrl);
            }
        } else {
            setIsSearchMode(true);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleSearchToggle();
        }
    };

    const filtersState = {
        isOpen: isFilterOpen,
        isFiltering: !!isFiltering,
        hasActive: !!hasActiveFilters,
    };

    if (!isMobile) {
        return (
            <DesktopSearch
                isSearchMode={isSearchMode}
                searchQuery={searchQuery}
                onSearchToggle={handleSearchToggle}
                onSubmit={handleSearchSubmit}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
                onFilterToggle={onFilterToggle}
                filtersState={filtersState}
                isFilterablePage={isFilterablePage}
                t={t}
            />
        );
    }

    return (
        <MobileSearch
            isSearchMode={isSearchMode}
            searchQuery={searchQuery}
            onSearchToggle={handleSearchToggle}
            onSubmit={handleSearchSubmit}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            onFilterToggle={onFilterToggle}
            filtersState={filtersState}
            isFilterablePage={isFilterablePage}
            t={t}
        />
    );
};

const Search: React.FC<SearchProps> = (props) => (
    <Suspense fallback={<SearchFallback />}>
        <SearchComponent {...props} />
    </Suspense>
);

export default Search;
