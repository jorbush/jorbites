'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DesktopSearch from './DesktopSearch';
import MobileSearch from './MobileSearch';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import Logo from './Logo';
import useRecentSearches from '@/app/hooks/useRecentSearches';
import { SafeUser } from '@/app/types';

export const SearchFallback = () => {
    return (
        <div className="flex flex-row items-center gap-1 md:gap-3">
            <Logo />
            <div className="bg-green-450/10 dark:bg-green-450/20 relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full p-2" />
        </div>
    );
};

interface SearchProps {
    currentUser?: SafeUser | null;
    onFilterToggle?: () => void;
    isFilterOpen?: boolean;
    onSearchModeChange?: (isSearchMode: boolean) => void;
}

const SearchComponent: React.FC<SearchProps> = ({
    currentUser,
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
    const [isSearchMode, setIsSearchMode] = useState(Boolean(currentSearch));
    const [searchQuery, setSearchQuery] = useState(currentSearch);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const onSearchModeChangeRef = useRef(onSearchModeChange);

    const {
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
    } = useRecentSearches(currentUser?.id);

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
    const hasActiveFilters =
        isFiltering ||
        currentStartDate ||
        currentEndDate ||
        currentMinCalories ||
        currentMaxCalories ||
        currentMinYield ||
        currentMaxYield ||
        currentCuisine;

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

    const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
        if (e) {
            e.preventDefault();
        }
        if (!isFilterablePage) return;
        const targetQuery = customQuery !== undefined ? customQuery : searchQuery;

        if (targetQuery.trim()) {
            addRecentSearch(targetQuery.trim());
        }

        const params = new URLSearchParams(searchParams?.toString() || '');
        if (targetQuery.trim()) {
            params.set('search', targetQuery.trim());
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
        replace(newUrl);
        setIsInputFocused(false);
    };

    const handleSearchToggle = () => {
        if (isSearchMode) {
            setIsSearchMode(false);
            setIsInputFocused(false);
            onSearchModeChange?.(false);
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
            onSearchModeChange?.(true);
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

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setIsInputFocused(false);
        }, 150);
    };

    const handleSelectRecentSearch = (query: string) => {
        setSearchQuery(query);
        handleSearchSubmit(undefined, query);
    };

    const handleRemoveRecentSearch = (query: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        removeRecentSearch(query);
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
                isInputFocused={isInputFocused}
                onInputFocus={handleInputFocus}
                onInputBlur={handleInputBlur}
                recentSearches={recentSearches}
                onSelectRecentSearch={handleSelectRecentSearch}
                onRemoveRecentSearch={handleRemoveRecentSearch}
                onClearAllRecentSearches={clearRecentSearches}
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
            isInputFocused={isInputFocused}
            onInputFocus={handleInputFocus}
            onInputBlur={handleInputBlur}
            recentSearches={recentSearches}
            onSelectRecentSearch={handleSelectRecentSearch}
            onRemoveRecentSearch={handleRemoveRecentSearch}
            onClearAllRecentSearches={clearRecentSearches}
        />
    );
};

const Search: React.FC<SearchProps> = (props) => (
    <Suspense fallback={<SearchFallback />}>
        <SearchComponent {...props} />
    </Suspense>
);

export default Search;
