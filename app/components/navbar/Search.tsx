'use client';

import { useState, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
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
            <div className="relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full p-2 bg-green-450/10 dark:bg-green-450/20" />
        </div>
    );
};

interface SearchProps {
    onFilterToggle?: () => void;
    isFilterOpen?: boolean;
    onSearchModeChange?: (isSearchMode: boolean) => void;
}

const Search: React.FC<SearchProps> = ({
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
    const [isExplicitlyExiting, setIsExplicitlyExiting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const isMainPage = pathname === '/';
    const isFavoritesPage = pathname === '/favorites';
    const isFilterablePage = isMainPage || isFavoritesPage;
    const isFiltering = get('category') || '';

    const currentStartDate = get('startDate') || '';
    const currentEndDate = get('endDate') || '';
    const currentOrderBy = get('orderBy') || '';
    const hasActiveFilters =
        isFiltering || currentStartDate || currentEndDate || currentOrderBy;

    const replaceRef = useRef(replace);
    replaceRef.current = replace;

    const debouncedUrlUpdateRef = useRef<any>(null);
    if (debouncedUrlUpdateRef.current === null) {
        debouncedUrlUpdateRef.current = debounce(
            (
                value: string,
                searchParamsStr: string,
                isFilterable: boolean,
                isMain: boolean,
                path: string
            ) => {
                if (!isFilterable) return;
                const params = new URLSearchParams(searchParamsStr);
                if (value.trim()) {
                    params.set('search', value.trim());
                } else {
                    params.delete('search');
                }
                params.delete('page');
                const newUrl = isMain
                    ? params.toString()
                        ? `/?${params.toString()}`
                        : '/'
                    : params.toString()
                      ? `${path}?${params.toString()}`
                      : path;
                replaceRef.current(newUrl);
            },
            1000
        );
    }
    const debouncedUrlUpdate = debouncedUrlUpdateRef.current;

    useEffect(() => {
        return () => {
            if (typeof debouncedUrlUpdate.cancel === 'function') {
                debouncedUrlUpdate.cancel();
            }
        };
    }, [debouncedUrlUpdate]);

    const prevCurrentSearchRef = useRef(currentSearch);

    if (currentSearch !== prevCurrentSearchRef.current) {
        prevCurrentSearchRef.current = currentSearch;
        if (currentSearch) {
            setSearchQuery(currentSearch);
            if (!isSearchMode && !isExplicitlyExiting) {
                setIsSearchMode(true);
                onSearchModeChange?.(true);
            }
        } else {
            setSearchQuery('');
            if (isExplicitlyExiting) {
                setIsSearchMode(false);
                onSearchModeChange?.(false);
                setIsExplicitlyExiting(false);
            }
        }
    }

    const hasFiredInitialRef = useRef(false);
    useEffect(() => {
        if (!hasFiredInitialRef.current) {
            hasFiredInitialRef.current = true;
            if (currentSearch) {
                onSearchModeChange?.(true);
            }
        }
    }, [currentSearch, onSearchModeChange]);

    const handleSearchToggle = () => {
        if (isSearchMode) {
            setIsExplicitlyExiting(true);
            setSearchQuery('');
            if (isFilterablePage && searchQuery.trim()) {
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
            } else {
                setIsSearchMode(false);
                onSearchModeChange?.(false);
                setIsExplicitlyExiting(false);
            }
        } else {
            setIsSearchMode(true);
            setTimeout(() => inputRef.current?.focus(), 200);
            onSearchModeChange?.(true);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedUrlUpdate(
            value,
            searchParams?.toString() || '',
            isFilterablePage,
            isMainPage,
            pathname || ''
        );
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
            t={t}
        />
    );
};

export default Search;
