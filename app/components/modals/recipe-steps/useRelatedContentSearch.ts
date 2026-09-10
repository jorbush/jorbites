import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { toast } from 'react-hot-toast';

export interface RelatedSearchResults {
    recipes: any[];
    quests: any[];
}

export function useRelatedContentSearch(
    searchType: 'recipes' | 'quests' | 'videos',
    t: (key: string, options?: any) => string
) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<RelatedSearchResults>({
        recipes: [],
        quests: [],
    });
    const abortControllerRef = useRef<AbortController | null>(null);

    const debouncedSearch = useMemo(
        () =>
            debounce(
                async (
                    query: string,
                    type: string,
                    tFunction: (key: string, options?: any) => string
                ) => {
                    if (query.trim().length < 2) {
                        setSearchResults({ recipes: [], quests: [] });
                        return;
                    }

                    if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                    }
                    const controller = new AbortController();
                    abortControllerRef.current = controller;

                    try {
                        if (type === 'quests') {
                            const response = await axios.get(
                                `/api/quests?status=open&q=${encodeURIComponent(query)}`,
                                { signal: controller.signal }
                            );
                            setSearchResults({
                                recipes: [],
                                quests: response.data.quests || [],
                            });
                        } else {
                            const response = await axios.get(
                                `/api/search?q=${encodeURIComponent(query)}&type=${type}`,
                                { signal: controller.signal }
                            );
                            setSearchResults({ ...response.data, quests: [] });
                        }
                    } catch (error) {
                        if (
                            axios.isCancel(error) ||
                            (error as any)?.name === 'CanceledError' ||
                            (error as any)?.name === 'AbortError'
                        ) {
                            return;
                        }
                        console.error('Search failed:', error);
                        toast.error(
                            tFunction('search_failed') || 'Search failed'
                        );
                    }
                },
                300
            ),
        []
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [debouncedSearch]);

    const handleSearchQueryChange = useCallback(
        (query: string) => {
            setSearchQuery(query);
            if (query.trim().length < 2) {
                debouncedSearch.cancel();
                setSearchResults({ recipes: [], quests: [] });
            } else {
                debouncedSearch(query, searchType, t);
            }
        },
        [debouncedSearch, searchType, t]
    );

    return {
        searchQuery,
        setSearchQuery: handleSearchQueryChange,
        searchResults,
    };
}
