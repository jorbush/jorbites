import { useState, useEffect, useMemo, useCallback } from 'react';
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

                    try {
                        if (type === 'quests') {
                            const response = await axios.get(
                                `/api/quests?status=open&q=${encodeURIComponent(query)}`
                            );
                            setSearchResults({
                                recipes: [],
                                quests: response.data.quests || [],
                            });
                        } else {
                            const response = await axios.get(
                                `/api/search?q=${encodeURIComponent(query)}&type=${type}`
                            );
                            setSearchResults({ ...response.data, quests: [] });
                        }
                    } catch (error) {
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
