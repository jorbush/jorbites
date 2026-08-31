'use client';

import { useState, useEffect, useCallback } from 'react';

const MAX_RECENT_SEARCHES = 10;
const STORAGE_PREFIX = 'recent_searches_';

export function useRecentSearches(userId?: string | null) {
    const storageKey = `${STORAGE_PREFIX}${userId || 'guest'}`;
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
                    return;
                }
            }
            setRecentSearches([]);
        } catch {
            setRecentSearches([]);
        }
    }, [storageKey]);

    const addRecentSearch = useCallback(
        (query: string) => {
            const trimmed = query.trim();
            if (!trimmed) return;

            setRecentSearches((prev) => {
                const filtered = prev.filter(
                    (item) => item.toLowerCase() !== trimmed.toLowerCase()
                );
                const updated = [trimmed, ...filtered].slice(
                    0,
                    MAX_RECENT_SEARCHES
                );
                try {
                    localStorage.setItem(storageKey, JSON.stringify(updated));
                } catch {
                    // Ignore storage errors (quota, private mode)
                }
                return updated;
            });
        },
        [storageKey]
    );

    const removeRecentSearch = useCallback(
        (query: string) => {
            setRecentSearches((prev) => {
                const updated = prev.filter((item) => item !== query);
                try {
                    localStorage.setItem(storageKey, JSON.stringify(updated));
                } catch {
                    // Ignore storage errors
                }
                return updated;
            });
        },
        [storageKey]
    );

    const clearRecentSearches = useCallback(() => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // Ignore storage errors
        }
    }, [storageKey]);

    return {
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
    };
}

export default useRecentSearches;
