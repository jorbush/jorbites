'use client';

import React from 'react';
import { FiX } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { RECIPE_ALLERGENS } from '@/app/utils/constants';
import { EU_ALLERGEN_DEFINITIONS } from '@/app/utils/allergenDetector';

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

interface RecipeSelectFiltersProps {
    difficulty: string | null;
    selectedTags: string[];
    excludedAllergens: string[];
    hasActiveFilters: boolean;
    onToggleDifficulty: (level: string) => void;
    onToggleTag: (tag: string) => void;
    onToggleAllergen: (allergen: string) => void;
    onClearFilters: () => void;
    t: any;
}

const translateOrFallback = (t: any, key: string, fallback: string): string =>
    String(t(key, { defaultValue: fallback }) || fallback);

export const RecipeSelectFilters: React.FC<RecipeSelectFiltersProps> = ({
    difficulty,
    selectedTags,
    excludedAllergens,
    hasActiveFilters,
    onToggleDifficulty,
    onToggleTag,
    onToggleAllergen,
    onClearFilters,
    t,
}) => {
    const isEasySelected = difficulty === 'Easy';

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {translateOrFallback(t, 'quick_filters', 'Quick filters')}
                </span>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        data-testid="clear-quick-filters"
                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                        <FiX
                            size={12}
                            aria-hidden="true"
                        />
                        <span>
                            {translateOrFallback(
                                t,
                                'clear_all_filters',
                                'Clear all filters'
                            )}
                        </span>
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-1.5">
                <button
                    type="button"
                    aria-pressed={isEasySelected}
                    onClick={() => onToggleDifficulty('Easy')}
                    data-testid="quick-filter-difficulty-easy"
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                        isEasySelected ? ACTIVE_CHIP_CLASS : INACTIVE_CHIP_CLASS
                    }`}
                >
                    {translateOrFallback(t, 'difficulty_easy', 'Easy')}
                </button>

                {QUICK_DIETARY_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    const label = translateOrFallback(
                        t,
                        `dietary_${tag.replace(/-/g, '_')}`,
                        tag
                    );

                    return (
                        <button
                            key={tag}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => onToggleTag(tag)}
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

            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {translateOrFallback(
                        t,
                        'exclude_allergens',
                        'Hide recipes with…'
                    )}
                </span>
                <div className="-mx-1 overflow-x-auto px-1">
                    <div className="flex min-w-max gap-1.5 pb-1">
                        {RECIPE_ALLERGENS.map((allergen) => {
                            const Icon = ALLERGEN_ICON_MAP.get(allergen);
                            const isExcluded =
                                excludedAllergens.includes(allergen);
                            const label = translateOrFallback(
                                t,
                                `allergen_${allergen}`,
                                allergen
                            );

                            return (
                                <button
                                    key={allergen}
                                    type="button"
                                    aria-pressed={isExcluded}
                                    onClick={() => onToggleAllergen(allergen)}
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
    );
};
