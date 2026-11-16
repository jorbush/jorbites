'use client';

import { useCallback, useMemo, useState } from 'react';
import { filterBySearchQuery } from '@/app/utils/searchUtils';

export function useSearchFilter<T>(
    items: T[],
    getSearchableFields: (item: T) => Array<string | null | undefined>,
    initialQuery = ''
) {
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    const isSearching = searchQuery.trim().length > 0;

    const filteredItems = useMemo(
        () => filterBySearchQuery(items, searchQuery, getSearchableFields),
        [items, searchQuery, getSearchableFields]
    );

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
