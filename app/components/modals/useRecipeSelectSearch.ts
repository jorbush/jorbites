'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { MacroBudgetFilter } from '@/app/utils/planningNutrition';

export type MacroBudgetKey = keyof MacroBudgetFilter;

export interface QuickFilterParams {
    query: string;
    difficulty: string | null;
    selectedTags: string[];
    excludedAllergens: string[];
    macroBudget?: MacroBudgetFilter;
}

const EMPTY_MACRO_BUDGET: MacroBudgetFilter = {};

const isPositiveBudgetValue = (value?: number | null): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;

export const hasAnyMacroBudget = (budget?: MacroBudgetFilter): boolean =>
    Boolean(
        budget &&
        (isPositiveBudgetValue(budget.maxCalories) ||
            isPositiveBudgetValue(budget.minProtein) ||
            isPositiveBudgetValue(budget.maxCarbohydrates) ||
            isPositiveBudgetValue(budget.maxFat))
    );

export const buildRecipeSelectSearchUrl = ({
    query,
    difficulty,
    selectedTags,
    excludedAllergens,
    macroBudget,
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
    if (macroBudget) {
        if (isPositiveBudgetValue(macroBudget.maxCalories)) {
            parts.push(`maxCalories=${macroBudget.maxCalories}`);
        }
        if (isPositiveBudgetValue(macroBudget.minProtein)) {
            parts.push(`minProtein=${macroBudget.minProtein}`);
        }
        if (isPositiveBudgetValue(macroBudget.maxCarbohydrates)) {
            parts.push(`maxCarbohydrates=${macroBudget.maxCarbohydrates}`);
        }
        if (isPositiveBudgetValue(macroBudget.maxFat)) {
            parts.push(`maxFat=${macroBudget.maxFat}`);
        }

        if (isPositiveBudgetValue(macroBudget.minProtein)) {
            parts.push('orderBy=highest_protein');
        } else if (isPositiveBudgetValue(macroBudget.maxCalories)) {
            parts.push('orderBy=lowest_calories');
        }
    }

    return `/api/search?${parts.join('&')}`;
};

const hasAnyFilter = (params: QuickFilterParams): boolean =>
    Boolean(params.difficulty) ||
    params.selectedTags.length > 0 ||
    params.excludedAllergens.length > 0 ||
    hasAnyMacroBudget(params.macroBudget);

export function useRecipeSelectSearch(
    initialMacroBudget: MacroBudgetFilter = EMPTY_MACRO_BUDGET
) {
    const [query, setQuery] = useState('');
    const [difficulty, setDifficulty] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
    const [macroBudget, setMacroBudget] = useState<MacroBudgetFilter>(() => ({
        ...initialMacroBudget,
    }));
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const requestIdRef = useRef(0);
    const initialBudgetRef = useRef(initialMacroBudget);

    const hasActiveFilters =
        Boolean(difficulty) ||
        selectedTags.length > 0 ||
        excludedAllergens.length > 0 ||
        hasAnyMacroBudget(macroBudget);

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

    useEffect(() => {
        if (hasAnyMacroBudget(initialBudgetRef.current)) {
            void executeSearch({
                query: '',
                difficulty: null,
                selectedTags: [],
                excludedAllergens: [],
                macroBudget: initialBudgetRef.current,
            });
        }
    }, [executeSearch]);

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
                macroBudget,
            });
        },
        [
            debouncedSearch,
            difficulty,
            selectedTags,
            excludedAllergens,
            macroBudget,
        ]
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
                macroBudget,
            });
        },
        [
            difficulty,
            query,
            selectedTags,
            excludedAllergens,
            macroBudget,
            runImmediate,
        ]
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
                macroBudget,
            });
        },
        [
            query,
            difficulty,
            selectedTags,
            excludedAllergens,
            macroBudget,
            runImmediate,
        ]
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
                macroBudget,
            });
        },
        [
            query,
            difficulty,
            selectedTags,
            excludedAllergens,
            macroBudget,
            runImmediate,
        ]
    );

    const handleSetMacroBudgetField = useCallback(
        (key: MacroBudgetKey, value: number | null) => {
            const nextBudget: MacroBudgetFilter = {
                ...macroBudget,
                [key]: value,
            };
            setMacroBudget(nextBudget);
            runImmediate({
                query,
                difficulty,
                selectedTags,
                excludedAllergens,
                macroBudget: nextBudget,
            });
        },
        [
            query,
            difficulty,
            selectedTags,
            excludedAllergens,
            macroBudget,
            runImmediate,
        ]
    );

    const handleClearFilters = useCallback(() => {
        setDifficulty(null);
        setSelectedTags([]);
        setExcludedAllergens([]);
        setMacroBudget(EMPTY_MACRO_BUDGET);
        runImmediate({
            query,
            difficulty: null,
            selectedTags: [],
            excludedAllergens: [],
            macroBudget: EMPTY_MACRO_BUDGET,
        });
    }, [query, runImmediate]);

    const resetSearch = useCallback(() => {
        debouncedSearch.cancel();
        requestIdRef.current += 1;
        setQuery('');
        setDifficulty(null);
        setSelectedTags([]);
        setExcludedAllergens([]);
        setMacroBudget(EMPTY_MACRO_BUDGET);
        setResults([]);
        setIsLoading(false);
    }, [debouncedSearch]);

    return {
        query,
        difficulty,
        selectedTags,
        excludedAllergens,
        macroBudget,
        results,
        isLoading,
        hasActiveFilters,
        handleQueryChange,
        handleToggleDifficulty,
        handleToggleTag,
        handleToggleAllergen,
        handleSetMacroBudgetField,
        handleClearFilters,
        resetSearch,
    };
}
