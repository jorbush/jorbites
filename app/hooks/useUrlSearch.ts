'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UseUrlSearchOptions {
    basePath: string;
    initialSearch?: string;
    paramName?: string;
    debounceMs?: number;
    resetPage?: boolean;
}

export interface UseUrlSearchResult {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    submitSearch: () => void;
    clearSearch: () => void;
    isSearching: boolean;
}

export function useUrlSearch({
    basePath,
    initialSearch = '',
    paramName = 'search',
    debounceMs = 350,
    resetPage = true,
}: UseUrlSearchOptions): UseUrlSearchResult {
    const { push } = useRouter() || {};
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const prevInitialSearchRef = useRef(initialSearch);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelPendingNavigation = useCallback(() => {
        if (debounceTimerRef.current !== null) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (prevInitialSearchRef.current !== initialSearch) {
            prevInitialSearchRef.current = initialSearch;
            cancelPendingNavigation();
            setSearchQuery(initialSearch);
        }
    }, [initialSearch, cancelPendingNavigation]);

    useEffect(() => {
        return () => {
            cancelPendingNavigation();
        };
    }, [cancelPendingNavigation]);

    const navigateWithSearch = useCallback(
        (rawValue: string) => {
            if (!push) return;

            const currentSearch =
                typeof window !== 'undefined' ? window.location.search : '';
            const params = new URLSearchParams(currentSearch);
            const trimmed = rawValue.trim();

            if (trimmed) {
                params.set(paramName, trimmed);
            } else {
                params.delete(paramName);
            }

            if (resetPage) {
                params.delete('page');
            }

            const queryString = params.toString();
            const targetUrl = queryString
                ? `${basePath}?${queryString}`
                : basePath;
            push(targetUrl, { scroll: false });
        },
        [basePath, paramName, push, resetPage]
    );

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchQuery(value);
            cancelPendingNavigation();

            const trimmedNext = value.trim();
            const trimmedInitial = initialSearch.trim();
            if (trimmedNext === trimmedInitial) {
                return;
            }

            debounceTimerRef.current = setTimeout(() => {
                debounceTimerRef.current = null;
                navigateWithSearch(value);
            }, debounceMs);
        },
        [cancelPendingNavigation, debounceMs, initialSearch, navigateWithSearch]
    );

    const submitSearch = useCallback(() => {
        cancelPendingNavigation();
        navigateWithSearch(searchQuery);
    }, [cancelPendingNavigation, navigateWithSearch, searchQuery]);

    const clearSearch = useCallback(() => {
        cancelPendingNavigation();
        setSearchQuery('');
        if (initialSearch.trim().length > 0) {
            navigateWithSearch('');
        }
    }, [cancelPendingNavigation, initialSearch, navigateWithSearch]);

    const isSearching = initialSearch.trim().length > 0;

    return {
        searchQuery,
        setSearchQuery: handleSearchChange,
        submitSearch,
        clearSearch,
        isSearching,
    };
}

export default useUrlSearch;
