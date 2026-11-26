'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { FiSearch, FiX } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import Modal from '@/app/components/modals/Modal';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import { RECIPE_ALLERGENS } from '@/app/utils/constants';
import { EU_ALLERGEN_DEFINITIONS } from '@/app/utils/allergenDetector';

interface RecipeSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (recipe: any) => void;
}

const QUICK_DIETARY_TAGS = ['meal-prep', 'one-pot', 'budget-friendly'] as const;

const ALLERGEN_ICON_MAP = new Map<string, IconType>(
    EU_ALLERGEN_DEFINITIONS.map((def) => [def.id, def.icon])
);

const ACTIVE_CHIP_CLASS =
    'border-green-450/50 bg-green-450 font-semibold text-neutral-900 shadow-2xs';

const INACTIVE_CHIP_CLASS =
    'border-neutral-200/80 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700';

const EXCLUDED_ALLERGEN_CHIP_CLASS =
    'border-rose-300 bg-rose-50 font-semibold text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-200';

interface QuickFilterParams {
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

const RecipeSelectModal: React.FC<RecipeSelectModalProps> = ({
    isOpen,
    onClose,
    onSelect,
}) => {
    const { t } = useTranslation();
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
        const hasFilters =
            Boolean(params.difficulty) ||
            params.selectedTags.length > 0 ||
            params.excludedAllergens.length > 0;

        if (params.query.trim().length < 2 && !hasFilters) {
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

    const handleQueryChange = (val: string) => {
        setQuery(val);
        debouncedSearch({
            query: val,
            difficulty,
            selectedTags,
            excludedAllergens,
        });
    };

    const handleToggleDifficulty = (level: string) => {
        const nextDifficulty = difficulty === level ? null : level;
        setDifficulty(nextDifficulty);
        debouncedSearch.cancel();
        void executeSearch({
            query,
            difficulty: nextDifficulty,
            selectedTags,
            excludedAllergens,
        });
    };

    const handleToggleTag = (tag: string) => {
        const nextTags = selectedTags.includes(tag)
            ? selectedTags.filter((item) => item !== tag)
            : [...selectedTags, tag];
        setSelectedTags(nextTags);
        debouncedSearch.cancel();
        void executeSearch({
            query,
            difficulty,
            selectedTags: nextTags,
            excludedAllergens,
        });
    };

    const handleToggleAllergen = (allergen: string) => {
        const nextAllergens = excludedAllergens.includes(allergen)
            ? excludedAllergens.filter((item) => item !== allergen)
            : [...excludedAllergens, allergen];
        setExcludedAllergens(nextAllergens);
        debouncedSearch.cancel();
        void executeSearch({
            query,
            difficulty,
            selectedTags,
            excludedAllergens: nextAllergens,
        });
    };

    const handleClearFilters = () => {
        setDifficulty(null);
        setSelectedTags([]);
        setExcludedAllergens([]);
        debouncedSearch.cancel();
        void executeSearch({
            query,
            difficulty: null,
            selectedTags: [],
            excludedAllergens: [],
        });
    };

    // Reset state on close
    const handleClose = () => {
        debouncedSearch.cancel();
        requestIdRef.current += 1;
        setQuery('');
        setDifficulty(null);
        setSelectedTags([]);
        setExcludedAllergens([]);
        setResults([]);
        setIsLoading(false);
        onClose();
    };

    const canShowNoResults = query.trim().length >= 2 || hasActiveFilters;

    const bodyContent = (
        <div className="flex flex-col gap-4 text-black dark:text-neutral-100">
            {/* Search Bar */}
            <div className="relative">
                <FiSearch
                    className="absolute top-3.5 left-3 text-neutral-400"
                    size={18}
                    aria-hidden="true"
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder={String(
                        t('search_recipes_placeholder') ||
                            'Search recipes by title...'
                    )}
                    aria-label={String(
                        t('search_recipes_placeholder') || 'Search recipes'
                    )}
                    data-cy="recipe-select-search-input"
                    className="focus:border-green-450 focus:ring-green-450/30 w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pr-4 pl-10 text-sm font-light text-neutral-900 outline-hidden focus:ring-2 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                />
            </div>

            {/* Quick Filter Chips: Difficulty & Tags */}
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {String(
                            t('quick_filters', {
                                defaultValue: 'Quick filters',
                            }) || 'Quick filters'
                        )}
                    </span>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            data-testid="clear-quick-filters"
                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        >
                            <FiX
                                size={12}
                                aria-hidden="true"
                            />
                            <span>
                                {String(
                                    t('clear_all_filters', {
                                        defaultValue: 'Clear all filters',
                                    }) || 'Clear all filters'
                                )}
                            </span>
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        aria-pressed={difficulty === 'Easy'}
                        onClick={() => handleToggleDifficulty('Easy')}
                        data-testid="quick-filter-difficulty-easy"
                        className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                            difficulty === 'Easy'
                                ? ACTIVE_CHIP_CLASS
                                : INACTIVE_CHIP_CLASS
                        }`}
                    >
                        {String(
                            t('difficulty_easy', { defaultValue: 'Easy' }) ||
                                'Easy'
                        )}
                    </button>

                    {QUICK_DIETARY_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        const label = String(
                            t(`dietary_${tag.replace(/-/g, '_')}`, {
                                defaultValue: tag,
                            }) || tag
                        );

                        return (
                            <button
                                key={tag}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => handleToggleTag(tag)}
                                data-testid={`quick-filter-tag-${tag}`}
                                className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                                    isSelected
                                        ? ACTIVE_CHIP_CLASS
                                        : INACTIVE_CHIP_CLASS
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* EU-14 Allergen Exclusions */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {String(
                            t('exclude_allergens', {
                                defaultValue: 'Hide recipes with…',
                            }) || 'Hide recipes with…'
                        )}
                    </span>
                    <div className="-mx-1 overflow-x-auto px-1">
                        <div className="flex min-w-max gap-1.5 pb-1">
                            {RECIPE_ALLERGENS.map((allergen) => {
                                const Icon = ALLERGEN_ICON_MAP.get(allergen);
                                const isExcluded =
                                    excludedAllergens.includes(allergen);
                                const label = String(
                                    t(`allergen_${allergen}`, {
                                        defaultValue: allergen,
                                    }) || allergen
                                );

                                return (
                                    <button
                                        key={allergen}
                                        type="button"
                                        aria-pressed={isExcluded}
                                        onClick={() =>
                                            handleToggleAllergen(allergen)
                                        }
                                        data-testid={`quick-filter-exclude-allergen-${allergen}`}
                                        className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                                            isExcluded
                                                ? EXCLUDED_ALLERGEN_CHIP_CLASS
                                                : INACTIVE_CHIP_CLASS
                                        }`}
                                    >
                                        {Icon && (
                                            <Icon
                                                size={12}
                                                className="shrink-0"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="max-h-[300px] overflow-y-auto pr-1">
                {isLoading ? (
                    <div className="py-6 text-center text-sm font-light text-neutral-400">
                        {t('loading') || 'Loading...'}
                    </div>
                ) : results.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {results.map((recipe) => (
                            <button
                                key={recipe.id}
                                type="button"
                                onClick={() => {
                                    onSelect(recipe);
                                    handleClose();
                                }}
                                data-cy="recipe-select-option"
                                className="flex w-full cursor-pointer flex-row items-center gap-3 rounded-xl p-2 text-left transition-colors duration-200 hover:bg-neutral-100 focus:outline-hidden dark:hover:bg-neutral-800"
                            >
                                {recipe.imageSrc && (
                                    <CustomProxyImage
                                        src={recipe.imageSrc}
                                        alt={recipe.title}
                                        width={48}
                                        height={48}
                                        className="size-12 shrink-0 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-sm font-semibold">
                                        {recipe.title}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-light text-neutral-400">
                                        {recipe.user && (
                                            <span>
                                                by{' '}
                                                {recipe.user.name ||
                                                    'Anonymous'}
                                            </span>
                                        )}
                                        {typeof recipe.calories ===
                                            'number' && (
                                            <span className="font-medium text-neutral-500 dark:text-neutral-300">
                                                {recipe.calories} kcal
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : canShowNoResults ? (
                    <div className="text-neutral-450 py-6 text-center text-sm font-light">
                        {t('no_recipes_found')}
                    </div>
                ) : (
                    <div className="text-neutral-450 py-8 text-center text-sm font-light dark:text-neutral-500">
                        {t('type_to_search') ||
                            'Type at least 2 characters to search'}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleClose}
            title={String(t('select_recipe') || 'Select Recipe')}
            actionLabel={String(t('cancel') || 'Cancel')}
            body={bodyContent}
        />
    );
};

export default RecipeSelectModal;
