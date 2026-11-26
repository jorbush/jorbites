'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';

export interface QuickFilterParams {
    query: string;
    difficulty: string | null;
    selectedTags: string[];
    excludedAllergens: string[];
}

export const buildRecipeSelectSearchUrl = ({
    query,
    difficulty,
    selectedTags,
    excludedAllergens,
}: QuickFilterParams): string => {
    const trimmed = query.trim();
    const parts: string[] = [];

    if (trimmed.length >= 2) {
        parts.push(`q=${encodeURIComponent(trimmed)}`);
    }
    parts.push('type=recipes');

    if (difficulty) {
        parts.push(`difficulty=${encodeURIComponent(difficulty)}`);
    }
    if (selectedTags.length > 0) {
        parts.push(`dietaryTags=${encodeURIComponent(selectedTags.join(','))}`);
    }
    if (excludedAllergens.length > 0) {
        parts.push(
            `excludeAllergens=${encodeURIComponent(excludedAllergens.join(','))}`
        );
    }

    return `/api/search?${parts.join('&')}`;
};

const hasAnyFilter = (params: QuickFilterParams): boolean =>
    Boolean(params.difficulty) ||
    params.selectedTags.length > 0 ||
    params.excludedAllergens.length > 0;

export function useRecipeSelectSearch() {
    const [query, setQuery] = useState('');
    const [difficulty, setDifficulty] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const requestIdRef = useRef(0);

    const hasActiveFilters =
        Boolean(difficulty) ||
        selectedTags.length > 0 ||
        excludedAllergens.length > 0;

    const executeSearch = useCallback(async (params: QuickFilterParams) => {
        if (params.query.trim().length < 2 && !hasAnyFilter(params)) {
            requestIdRef.current += 1;
            setResults([]);
            setIsLoading(false);
            return;
        }

        const currentRequestId = ++requestIdRef.current;
        setIsLoading(true);
        try {
            const url = buildRecipeSelectSearchUrl(params);
            const response = await axios.get(url);
            if (currentRequestId === requestIdRef.current) {
                setResults(response.data.recipes || []);
            }
        } catch (error) {
            console.error('Recipe search failed:', error);
        } finally {
            if (currentRequestId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const debouncedSearch = useMemo(
        () =>
            debounce((params: QuickFilterParams) => {
                void executeSearch(params);
            }, 300),
        [executeSearch]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleQueryChange = useCallback(
        (val: string) => {
            setQuery(val);
            debouncedSearch({
                query: val,
                difficulty,
                selectedTags,
                excludedAllergens,
            });
        },
        [debouncedSearch, difficulty, selectedTags, excludedAllergens]
    );

    const runImmediate = useCallback(
        (nextParams: QuickFilterParams) => {
            debouncedSearch.cancel();
            void executeSearch(nextParams);
        },
        [debouncedSearch, executeSearch]
    );

    const handleToggleDifficulty = useCallback(
        (level: string) => {
            const nextDifficulty = difficulty === level ? null : level;
            setDifficulty(nextDifficulty);
            runImmediate({
                query,
                difficulty: nextDifficulty,
                selectedTags,
                excludedAllergens,
            });
        },
        [difficulty, query, selectedTags, excludedAllergens, runImmediate]
    );

    const handleToggleTag = useCallback(
        (tag: string) => {
            const nextTags = selectedTags.includes(tag)
                ? selectedTags.filter((item) => item !== tag)
                : [...selectedTags, tag];
            setSelectedTags(nextTags);
            runImmediate({
                query,
                difficulty,
                selectedTags: nextTags,
                excludedAllergens,
            });
        },
        [query, difficulty, selectedTags, excludedAllergens, runImmediate]
    );

    const handleToggleAllergen = useCallback(
        (allergen: string) => {
            const nextAllergens = excludedAllergens.includes(allergen)
                ? excludedAllergens.filter((item) => item !== allergen)
                : [...excludedAllergens, allergen];
            setExcludedAllergens(nextAllergens);
            runImmediate({
                query,
                difficulty,
                selectedTags,
                excludedAllergens: nextAllergens,
            });
        },
        [query, difficulty, selectedTags, excludedAllergens, runImmediate]
    );

    const handleClearFilters = useCallback(() => {
        setDifficulty(null);
        setSelectedTags([]);
        setExcludedAllergens([]);
        runImmediate({
            query,
            difficulty: null,
            selectedTags: [],
            excludedAllergens: [],
        });
    }, [query, runImmediate]);

    const resetSearch = useCallback(() => {
        debouncedSearch.cancel();
        requestIdRef.current += 1;
        setQuery('');
        setDifficulty(null);
        setSelectedTags([]);
        setExcludedAllergens([]);
        setResults([]);
        setIsLoading(false);
    }, [debouncedSearch]);

    return {
        query,
        difficulty,
        selectedTags,
        excludedAllergens,
        results,
        isLoading,
        hasActiveFilters,
        handleQueryChange,
        handleToggleDifficulty,
        handleToggleTag,
        handleToggleAllergen,
        handleClearFilters,
        resetSearch,
    };
}
