'use client';

import React from 'react';
import { IconType } from 'react-icons';
import {
    DIETARY_TAGS,
    RECIPE_ALLERGENS,
    RECIPE_CUISINES,
    RECIPE_DIFFICULTIES,
} from '@/app/utils/constants';
import { EU_ALLERGEN_DEFINITIONS } from '@/app/utils/allergenDetector';
import { CuisineIcon } from '../recipes/CuisineIcon';

export type FilterTranslateFn = (
    key: string,
    options?: { defaultValue?: string }
) => string;

const ALLERGEN_ICON_MAP = new Map<string, IconType>(
    EU_ALLERGEN_DEFINITIONS.map((def) => [def.id, def.icon])
);

const INPUT_CLASS =
    'focus:border-green-450 focus:ring-green-450/30 dark:focus:border-green-450 min-w-0 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base sm:text-sm focus:ring-2 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100';

const ACTIVE_PILL_CLASS =
    'border-green-450/50 bg-green-450 font-semibold text-neutral-900 shadow-2xs';

const INACTIVE_PILL_CLASS =
    'border-neutral-200/80 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700';

interface DifficultyFilterSectionProps {
    difficulty: string;
    onPillClick: (val: string) => void;
    t: FilterTranslateFn;
}

export const DifficultyFilterSection: React.FC<
    DifficultyFilterSectionProps
> = ({ difficulty, onPillClick, t }) => (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('difficulty', { defaultValue: 'Difficulty' }) || 'Difficulty'}
        </span>
        <div className="grid grid-cols-3 gap-2">
            {RECIPE_DIFFICULTIES.map((level) => {
                const label =
                    t(`difficulty_${level.toLowerCase()}`, {
                        defaultValue: level,
                    }) || level;
                const isSelected =
                    difficulty.toLowerCase() === level.toLowerCase();

                return (
                    <button
                        key={level}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onPillClick(level)}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            isSelected ? ACTIVE_PILL_CLASS : INACTIVE_PILL_CLASS
                        }`}
                        data-testid={`difficulty-pill-${level.toLowerCase()}`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    </div>
);

interface DietaryTagsFilterSectionProps {
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
    t: FilterTranslateFn;
}

export const DietaryTagsFilterSection: React.FC<
    DietaryTagsFilterSectionProps
> = ({ selectedTags, onToggleTag, t }) => (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('dietary_tags', { defaultValue: 'Tags' }) || 'Tags'}
        </span>
        <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => {
                const label =
                    t(`dietary_${tag.replace(/-/g, '_')}`, {
                        defaultValue: tag,
                    }) || tag;
                const isSelected = selectedTags.includes(tag);

                return (
                    <button
                        key={tag}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onToggleTag(tag)}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            isSelected ? ACTIVE_PILL_CLASS : INACTIVE_PILL_CLASS
                        }`}
                        data-testid={`dietary-tag-pill-${tag}`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    </div>
);

interface ExcludeAllergensFilterSectionProps {
    excludedAllergens: string[];
    onToggleAllergen: (allergen: string) => void;
    t: FilterTranslateFn;
}

export const ExcludeAllergensFilterSection: React.FC<
    ExcludeAllergensFilterSectionProps
> = ({ excludedAllergens, onToggleAllergen, t }) => (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('exclude_allergens', {
                defaultValue: 'Hide recipes with…',
            }) || 'Hide recipes with…'}
        </span>
        <div className="flex flex-wrap gap-2">
            {RECIPE_ALLERGENS.map((allergen) => {
                const Icon = ALLERGEN_ICON_MAP.get(allergen);
                const label =
                    t(`allergen_${allergen}`, {
                        defaultValue: allergen,
                    }) || allergen;
                const isExcluded = excludedAllergens.includes(allergen);

                return (
                    <button
                        key={allergen}
                        type="button"
                        aria-pressed={isExcluded}
                        onClick={() => onToggleAllergen(allergen)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            isExcluded
                                ? 'border-rose-300 bg-rose-50 font-semibold text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-200'
                                : INACTIVE_PILL_CLASS
                        }`}
                        data-testid={`exclude-allergen-pill-${allergen}`}
                    >
                        {Icon && (
                            <Icon
                                size={13}
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
);

interface MacrosFilterSectionProps {
    minProtein: string;
    maxCarbohydrates: string;
    maxFat: string;
    onChangeMinProtein: (val: string) => void;
    onChangeMaxCarbohydrates: (val: string) => void;
    onChangeMaxFat: (val: string) => void;
    t: FilterTranslateFn;
}

export const MacrosFilterSection: React.FC<MacrosFilterSectionProps> = ({
    minProtein,
    maxCarbohydrates,
    maxFat,
    onChangeMinProtein,
    onChangeMaxCarbohydrates,
    onChangeMaxFat,
    t,
}) => (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('macros_per_serving', {
                defaultValue: 'Macros per serving (g)',
            }) || 'Macros per serving (g)'}
        </span>
        <div className="grid grid-cols-3 gap-2">
            <label className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {t('min_protein', { defaultValue: 'Min protein' }) ||
                        'Min protein'}
                </span>
                <input
                    type="number"
                    min="0"
                    placeholder="g"
                    aria-label={String(
                        t('min_protein', { defaultValue: 'Min protein' }) ||
                            'Min protein'
                    )}
                    value={minProtein}
                    onChange={(e) => onChangeMinProtein(e.target.value)}
                    className={INPUT_CLASS}
                    data-testid="min-protein-input"
                />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {t('max_carbs', { defaultValue: 'Max carbs' }) ||
                        'Max carbs'}
                </span>
                <input
                    type="number"
                    min="0"
                    placeholder="g"
                    aria-label={String(
                        t('max_carbs', { defaultValue: 'Max carbs' }) ||
                            'Max carbs'
                    )}
                    value={maxCarbohydrates}
                    onChange={(e) => onChangeMaxCarbohydrates(e.target.value)}
                    className={INPUT_CLASS}
                    data-testid="max-carbs-input"
                />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {t('max_fat', { defaultValue: 'Max fat' }) || 'Max fat'}
                </span>
                <input
                    type="number"
                    min="0"
                    placeholder="g"
                    aria-label={String(
                        t('max_fat', { defaultValue: 'Max fat' }) || 'Max fat'
                    )}
                    value={maxFat}
                    onChange={(e) => onChangeMaxFat(e.target.value)}
                    className={INPUT_CLASS}
                    data-testid="max-fat-input"
                />
            </label>
        </div>
    </div>
);

interface CalorieFilterSectionProps {
    minCalories: string;
    maxCalories: string;
    onChangeMin: (val: string) => void;
    onChangeMax: (val: string) => void;
    t: FilterTranslateFn;
}

export const CalorieFilterSection: React.FC<CalorieFilterSectionProps> = ({
    minCalories,
    maxCalories,
    onChangeMin,
    onChangeMax,
    t,
}) => (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('calories') || 'Calories'} (kcal)
        </span>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <input
                type="number"
                min="0"
                placeholder={String(t('min_calories') || 'Min')}
                aria-label={String(t('min_calories') || 'Min calories')}
                value={minCalories}
                onChange={(e) => onChangeMin(e.target.value)}
                className={INPUT_CLASS}
                data-testid="min-calories-input"
            />
            <span className="text-neutral-400">-</span>
            <input
                type="number"
                min="0"
                placeholder={String(t('max_calories') || 'Max')}
                aria-label={String(t('max_calories') || 'Max calories')}
                value={maxCalories}
                onChange={(e) => onChangeMax(e.target.value)}
                className={INPUT_CLASS}
                data-testid="max-calories-input"
            />
        </div>
    </div>
);

interface YieldFilterSectionProps {
    minYield: string;
    maxYield: string;
    onChangeMin: (val: string) => void;
    onChangeMax: (val: string) => void;
    t: FilterTranslateFn;
}

export const YieldFilterSection: React.FC<YieldFilterSectionProps> = ({
    minYield,
    maxYield,
    onChangeMin,
    onChangeMax,
    t,
}) => (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('yield') || 'Servings'}
        </span>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <input
                type="number"
                min="1"
                placeholder={String(t('min_yield') || 'Min')}
                aria-label={String(t('min_yield') || 'Min servings')}
                value={minYield}
                onChange={(e) => onChangeMin(e.target.value)}
                className={INPUT_CLASS}
                data-testid="min-yield-input"
            />
            <span className="text-neutral-400">-</span>
            <input
                type="number"
                min="1"
                placeholder={String(t('max_yield') || 'Max')}
                aria-label={String(t('max_yield') || 'Max servings')}
                value={maxYield}
                onChange={(e) => onChangeMax(e.target.value)}
                className={INPUT_CLASS}
                data-testid="max-yield-input"
            />
        </div>
    </div>
);

interface CuisineFilterSectionProps {
    cuisine: string;
    onPillClick: (val: string) => void;
    t: FilterTranslateFn;
}

export const CuisineFilterSection: React.FC<CuisineFilterSectionProps> = ({
    cuisine,
    onPillClick,
    t,
}) => (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('recipe_cuisine') || 'Cuisine'}
        </span>
        <div className="flex flex-wrap gap-2">
            {RECIPE_CUISINES.map((popCuisine) => {
                const translationKey = `cuisine_${popCuisine.toLowerCase().replace(/\s+/g, '_')}`;
                const label = t(translationKey, {
                    defaultValue: popCuisine,
                });
                const isSelected =
                    cuisine.toLowerCase() === popCuisine.toLowerCase();

                return (
                    <button
                        key={popCuisine}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onPillClick(popCuisine)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            isSelected ? ACTIVE_PILL_CLASS : INACTIVE_PILL_CLASS
                        }`}
                        data-testid={`cuisine-pill-${popCuisine.toLowerCase()}`}
                    >
                        <CuisineIcon
                            cuisine={popCuisine}
                            size={14}
                        />
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    </div>
);

interface DateFilterSectionProps {
    startDate: string;
    endDate: string;
    onChangeStart: (val: string) => void;
    onChangeEnd: (val: string) => void;
    t: FilterTranslateFn;
}

export const DateFilterSection: React.FC<DateFilterSectionProps> = ({
    startDate,
    endDate,
    onChangeStart,
    onChangeEnd,
    t,
}) => {
    const today = new Date().toISOString().split('T')[0];
    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('date') || 'Date'}
            </span>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                <input
                    id="advanced-filter-start-date"
                    aria-label={String(t('from_date') || 'From date')}
                    type="date"
                    value={startDate}
                    max={endDate || today}
                    onChange={(e) => onChangeStart(e.target.value)}
                    className={INPUT_CLASS}
                    data-testid="start-date-input"
                />
                <span className="text-neutral-400">-</span>
                <input
                    id="advanced-filter-end-date"
                    aria-label={String(t('to_date') || 'To date')}
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={today}
                    onChange={(e) => onChangeEnd(e.target.value)}
                    className={INPUT_CLASS}
                    data-testid="end-date-input"
                />
            </div>
        </div>
    );
};
