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
                    tFunction: (key: string, options?: any) => string,
                    setResults: (results: RelatedSearchResults) => void
                ) => {
                    if (query.length < 2) {
                        setResults({ recipes: [], quests: [] });
                        return;
                    }

                    try {
                        if (type === 'quests') {
                            const response = await axios.get(
                                `/api/quests?status=open&q=${encodeURIComponent(query)}`
                            );
                            setResults({
                                recipes: [],
                                quests: response.data.quests,
                            });
                        } else {
                            const response = await axios.get(
                                `/api/search?q=${encodeURIComponent(query)}&type=${type}`
                            );
                            setResults({ ...response.data, quests: [] });
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

    const handleSearch = useCallback(
        (query: string) => {
            debouncedSearch(query, searchType, t, setSearchResults);
        },
        [debouncedSearch, searchType, t]
    );

    useEffect(() => {
        handleSearch(searchQuery);

        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, handleSearch, debouncedSearch]);

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
    };
}
