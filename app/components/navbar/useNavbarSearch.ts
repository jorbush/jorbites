'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ADVANCED_FILTER_QUERY_PARAMS } from '@/app/utils/filter';

export const ACTIVE_FILTER_PARAMS = [
    'category',
    ...ADVANCED_FILTER_QUERY_PARAMS,
] as const;

export interface SearchParamsLike {
    get: (name: string) => string | null;
    toString: () => string;
}

export function isFilterablePathname(pathname: string | null): boolean {
    return pathname === '/' || pathname === '/favorites';
}

export function hasAnyActiveFilter(
    searchParams: SearchParamsLike | null
): boolean {
    if (!searchParams) {
        return false;
    }

    return ACTIVE_FILTER_PARAMS.some((param) =>
        Boolean(searchParams.get(param))
    );
}

export function buildNavbarSearchUrl(
    pathname: string | null,
    searchParams: SearchParamsLike | null,
    options: { query?: string; resetPage?: boolean }
): string {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    const trimmedQuery = options.query?.trim();

    if (trimmedQuery) {
        params.set('search', trimmedQuery);
    } else {
        params.delete('search');
    }

    if (options.resetPage) {
        params.delete('page');
    }

    const basePath = !pathname || pathname === '/' ? '/' : pathname;
    const queryString = params.toString();

    return queryString ? `${basePath}?${queryString}` : basePath;
}

interface UseNavbarSearchOptions {
    onSearchModeChange?: (isSearchMode: boolean) => void;
}

export function useNavbarSearch({
    onSearchModeChange,
}: UseNavbarSearchOptions) {
    const { push, replace } = useRouter() || {};
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentSearch = searchParams?.get('search') || '';

    const [isSearchMode, setIsSearchMode] = useState(Boolean(currentSearch));
    const [searchQuery, setSearchQuery] = useState(currentSearch);
    const inputRef = useRef<HTMLInputElement>(null);
    const onSearchModeChangeRef = useRef(onSearchModeChange);

    useEffect(() => {
        onSearchModeChangeRef.current = onSearchModeChange;
    }, [onSearchModeChange]);

    const prevCurrentSearchRef = useRef(currentSearch);
    useEffect(() => {
        if (currentSearch === prevCurrentSearchRef.current) {
            return;
        }
        prevCurrentSearchRef.current = currentSearch;
        const hasSearch = Boolean(currentSearch);
        setSearchQuery(currentSearch);
        setIsSearchMode(hasSearch);
        onSearchModeChangeRef.current?.(hasSearch);
    }, [currentSearch]);

    const hasFiredInitialRef = useRef(false);
    useEffect(() => {
        if (hasFiredInitialRef.current) {
            return;
        }
        hasFiredInitialRef.current = true;
        if (currentSearch) {
            onSearchModeChangeRef.current?.(true);
        }
    }, [currentSearch]);

    const isFilterablePage = isFilterablePathname(pathname);
    const isFiltering = Boolean(searchParams?.get('category'));
    const hasActiveFilters = hasAnyActiveFilter(searchParams);

    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!isFilterablePage) {
            return;
        }
        const newUrl = buildNavbarSearchUrl(pathname, searchParams, {
            query: searchQuery,
            resetPage: true,
        });
        replace?.(newUrl);
    };

    const handleSearchToggle = () => {
        if (!isSearchMode) {
            setIsSearchMode(true);
            setTimeout(() => inputRef.current?.focus(), 200);
            onSearchModeChange?.(true);
            return;
        }

        setIsSearchMode(false);
        onSearchModeChange?.(false);
        if (isFilterablePage && currentSearch) {
            const newUrl = buildNavbarSearchUrl(pathname, searchParams, {
                resetPage: false,
            });
            push?.(newUrl);
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

    return {
        isSearchMode,
        searchQuery,
        inputRef,
        isFilterablePage,
        isFiltering,
        hasActiveFilters,
        handleSearchSubmit,
        handleSearchToggle,
        handleSearchChange,
        handleKeyDown,
    };
}
