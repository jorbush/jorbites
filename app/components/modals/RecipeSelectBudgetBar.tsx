'use client';

import React from 'react';
import { FiPlus, FiTarget, FiX } from 'react-icons/fi';
import { MEAL_TYPES } from '@/app/utils/constants';
import { MacroBudgetFilter } from '@/app/utils/planningNutrition';
import {
    hasAnyMacroBudget,
    MacroBudgetKey,
} from '@/app/components/modals/useRecipeSelectSearch';

export interface MacroSuggestionContext {
    day: string;
    mealType: string | null;
    availableMealTypes?: string[];
    onMealTypeChange?: (mealType: string) => void;
    initialBudget: MacroBudgetFilter;
    optionalBudget?: MacroBudgetFilter;
}

interface RecipeSelectBudgetBarProps {
    suggestionContext: MacroSuggestionContext;
    macroBudget: MacroBudgetFilter;
    onSetMacroBudgetField: (key: MacroBudgetKey, value: number | null) => void;
    t: any;
}

const translateOrFallback = (t: any, key: string, fallback: string): string => {
    const value = t?.(key, { defaultValue: fallback });
    if (!value || value === key) {
        return fallback;
    }
    return String(value);
};

const BUDGET_CHIP_KEYS: readonly MacroBudgetKey[] = [
    'minProtein',
    'maxCalories',
    'maxCarbohydrates',
    'maxFat',
];

const formatBudgetChipLabel = (
    key: MacroBudgetKey,
    value: number,
    t: any
): string => {
    switch (key) {
        case 'maxCalories':
            return `≤ ${value} kcal`;
        case 'minProtein':
            return `≥ ${value}g ${translateOrFallback(t, 'macro_short_protein', 'P')}`;
        case 'maxCarbohydrates':
            return `≤ ${value}g ${translateOrFallback(t, 'macro_short_carbohydrates', 'C')}`;
        case 'maxFat':
            return `≤ ${value}g ${translateOrFallback(t, 'macro_short_fat', 'F')}`;
    }
};

export const RecipeSelectBudgetBar: React.FC<RecipeSelectBudgetBarProps> = ({
    suggestionContext,
    macroBudget,
    onSetMacroBudgetField,
    t,
}) => {
    const {
        day,
        mealType,
        availableMealTypes,
        onMealTypeChange,
        initialBudget,
        optionalBudget,
    } = suggestionContext;

    const allAvailableConstraints: MacroBudgetFilter = {
        ...optionalBudget,
        ...initialBudget,
    };

    const activeChips = BUDGET_CHIP_KEYS.filter(
        (key) => typeof macroBudget[key] === 'number' && macroBudget[key]! > 0
    );

    const inactiveChips = BUDGET_CHIP_KEYS.filter(
        (key) =>
            !(typeof macroBudget[key] === 'number' && macroBudget[key]! > 0) &&
            typeof allAvailableConstraints[key] === 'number' &&
            allAvailableConstraints[key]! > 0
    );

    const hasMealSlotPicker =
        Boolean(onMealTypeChange) &&
        Array.isArray(availableMealTypes) &&
        availableMealTypes.length > 0;

    if (
        !hasAnyMacroBudget(macroBudget) &&
        inactiveChips.length === 0 &&
        !hasMealSlotPicker
    ) {
        return null;
    }

    return (
        <div
            data-testid="macro-suggestion-banner"
            className="border-green-450/40 bg-green-450/10 dark:border-green-450/30 dark:bg-green-450/10 flex flex-col gap-2.5 rounded-xl border p-3"
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    <FiTarget
                        size={14}
                        className="dark:text-green-450 shrink-0 text-green-500"
                        aria-hidden="true"
                    />
                    <span>
                        {translateOrFallback(
                            t,
                            'remaining_macro_budget',
                            'Remaining macro budget'
                        )}
                    </span>
                    <span className="text-neutral-400 dark:text-neutral-500">
                        ·
                    </span>
                    <span className="capitalize">
                        {translateOrFallback(t, day, day)}
                    </span>
                </div>
            </div>

            {hasMealSlotPicker && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {translateOrFallback(t, 'add_to_meal_slot', 'Add to')}:
                    </span>
                    {MEAL_TYPES.map((slot) => {
                        const isAvailable = availableMealTypes!.includes(slot);
                        const isSelected = mealType === slot;
                        return (
                            <button
                                key={slot}
                                type="button"
                                disabled={!isAvailable}
                                aria-pressed={isSelected}
                                onClick={() => onMealTypeChange?.(slot)}
                                data-testid={`suggestion-slot-${slot}`}
                                className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                    isSelected
                                        ? 'border-green-450/50 bg-green-450 font-semibold text-neutral-900 shadow-2xs'
                                        : 'border-neutral-200/80 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                }`}
                            >
                                {translateOrFallback(t, slot, slot)}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
                {activeChips.map((key) => {
                    const value = macroBudget[key]!;
                    const label = formatBudgetChipLabel(key, value, t);
                    return (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={true}
                            onClick={() => onSetMacroBudgetField(key, null)}
                            data-testid={`budget-chip-${key}`}
                            className="border-green-450/50 bg-green-450 inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold text-neutral-900 shadow-2xs transition hover:opacity-90"
                        >
                            <span>{label}</span>
                            <FiX
                                size={12}
                                aria-hidden="true"
                            />
                        </button>
                    );
                })}

                {inactiveChips.map((key) => {
                    const value = allAvailableConstraints[key]!;
                    const label = formatBudgetChipLabel(key, value, t);
                    return (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={false}
                            onClick={() => onSetMacroBudgetField(key, value)}
                            data-testid={`budget-chip-optional-${key}`}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-200/80 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            <FiPlus
                                size={11}
                                aria-hidden="true"
                            />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
