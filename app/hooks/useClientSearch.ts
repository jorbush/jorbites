'use client';

import { useCallback, useMemo, useState } from 'react';

export type SearchFieldsExtractor<T> = (
    item: T
) => Array<string | null | undefined>;

export interface UseClientSearchResult<T> {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;
    isSearching: boolean;
    filteredItems: T[];
}

export function useClientSearch<T>(
    items: readonly T[],
    getSearchableFields: SearchFieldsExtractor<T>,
    initialQuery = ''
): UseClientSearchResult<T> {
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const isSearching = normalizedQuery.length > 0;

    const filteredItems = useMemo(() => {
        if (!isSearching) {
            return items as T[];
        }

        return items.filter((item) =>
            getSearchableFields(item).some(
                (field) =>
                    typeof field === 'string' &&
                    field.toLowerCase().includes(normalizedQuery)
            )
        );
    }, [items, getSearchableFields, isSearching, normalizedQuery]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        clearSearch,
        isSearching,
        filteredItems,
    };
}

export default useClientSearch;
