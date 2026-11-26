'use client';

import React from 'react';
import { FiCheckCircle, FiSliders, FiTarget } from 'react-icons/fi';
import {
    MacroProgressItem,
    RemainingMacroBudget,
    TargetMacroKey,
} from '@/app/utils/planningNutrition';

interface MacroGoalLabelSpec {
    labelKey: string;
    fallbackLabel: string;
    unit: string;
}

const MACRO_GOAL_SPECS: Record<TargetMacroKey, MacroGoalLabelSpec> = {
    calories: {
        labelKey: 'calories',
        fallbackLabel: 'Calories',
        unit: ' kcal',
    },
    protein: {
        labelKey: 'protein',
        fallbackLabel: 'Protein',
        unit: 'g',
    },
    carbohydrates: {
        labelKey: 'carbohydrates',
        fallbackLabel: 'Carbs',
        unit: 'g',
    },
    fat: {
        labelKey: 'fat',
        fallbackLabel: 'Fat',
        unit: 'g',
    },
};

const translateOrFallback = (t: any, key: string, fallback: string): string => {
    const value = t?.(key, { defaultValue: fallback });
    if (!value || value === key) {
        return fallback;
    }
    return String(value);
};

const formatBudgetSummary = (
    remainingBudget: RemainingMacroBudget,
    t: any
): string => {
    const parts: string[] = [];
    const { initialFilters } = remainingBudget;

    if (initialFilters.minProtein) {
        const shortP = translateOrFallback(t, 'macro_short_protein', 'P');
        parts.push(`≥${initialFilters.minProtein}g ${shortP}`);
    }
    if (initialFilters.maxCalories) {
        parts.push(`≤${initialFilters.maxCalories} kcal`);
    }
    if (initialFilters.maxCarbohydrates) {
        const shortC = translateOrFallback(t, 'macro_short_carbohydrates', 'C');
        parts.push(`≤${initialFilters.maxCarbohydrates}g ${shortC}`);
    }
    if (initialFilters.maxFat) {
        const shortF = translateOrFallback(t, 'macro_short_fat', 'F');
        parts.push(`≤${initialFilters.maxFat}g ${shortF}`);
    }

    return parts.join(' & ');
};

const getProgressGridClass = (count: number): string => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
};

export interface PlanningDayGoalProgressProps {
    day: string;
    progressItems: MacroProgressItem[];
    remainingBudget: RemainingMacroBudget;
    suggestedSlot: string | null;
    isOwner: boolean;
    onSuggestRecipes?: (day: string, suggestedSlot: string | null) => void;
    t: any;
}

export const PlanningDayGoalProgress: React.FC<
    PlanningDayGoalProgressProps
> = ({
    day,
    progressItems,
    remainingBudget,
    suggestedSlot,
    isOwner,
    onSuggestRecipes,
    t,
}) => {
    if (progressItems.length === 0) {
        return null;
    }

    const budgetSummary = formatBudgetSummary(remainingBudget, t);
    const canSuggest =
        remainingBudget.hasRemaining &&
        Boolean(onSuggestRecipes) &&
        (!isOwner || suggestedSlot !== null);

    const translatedMeal = suggestedSlot
        ? translateOrFallback(t, suggestedSlot, suggestedSlot)
        : '';

    const budgetHintText =
        remainingBudget.hasRemaining && budgetSummary
            ? isOwner && suggestedSlot
                ? String(
                      t?.('need_for_meal', {
                          budget: budgetSummary,
                          meal: translatedMeal,
                          defaultValue: `Need ${budgetSummary} for ${translatedMeal}`,
                      }) === 'need_for_meal'
                          ? `Need ${budgetSummary} for ${translatedMeal}`
                          : t?.('need_for_meal', {
                                budget: budgetSummary,
                                meal: translatedMeal,
                                defaultValue: `Need ${budgetSummary} for ${translatedMeal}`,
                            }) || `Need ${budgetSummary} for ${translatedMeal}`
                  )
                : String(
                      t?.('remaining_budget_summary', {
                          budget: budgetSummary,
                          defaultValue: `Remaining: ${budgetSummary}`,
                      }) === 'remaining_budget_summary'
                          ? `Remaining: ${budgetSummary}`
                          : t?.('remaining_budget_summary', {
                                budget: budgetSummary,
                                defaultValue: `Remaining: ${budgetSummary}`,
                            }) || `Remaining: ${budgetSummary}`
                  )
            : '';

    const actionLabel = isOwner
        ? translateOrFallback(
              t,
              'fill_remaining_macros',
              'Fill remaining macros'
          )
        : translateOrFallback(
              t,
              'suggest_recipes_for_budget',
              'Suggest recipes'
          );

    return (
        <div
            data-testid="day-goal-progress"
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200/70 bg-neutral-50/70 px-3.5 py-3 dark:border-neutral-800/80 dark:bg-neutral-800/35"
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 text-xs">
                    {remainingBudget.hasRemaining ? (
                        <>
                            <FiTarget
                                size={14}
                                className="dark:text-green-450 shrink-0 text-green-500"
                                aria-hidden="true"
                            />
                            <span
                                data-testid="day-remaining-hint"
                                className="font-medium text-neutral-600 dark:text-neutral-300"
                            >
                                {budgetHintText ||
                                    translateOrFallback(
                                        t,
                                        'daily_goal_progress',
                                        'Daily goal progress'
                                    )}
                            </span>
                        </>
                    ) : (
                        <span
                            data-testid="day-goal-reached"
                            className="inline-flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-200"
                        >
                            <FiCheckCircle
                                size={14}
                                className="dark:text-green-450 shrink-0 text-green-500"
                                aria-hidden="true"
                            />
                            <span>
                                {translateOrFallback(
                                    t,
                                    'daily_goal_reached',
                                    'Daily goal reached'
                                )}
                            </span>
                        </span>
                    )}
                </div>

                {canSuggest && (
                    <button
                        type="button"
                        onClick={() => onSuggestRecipes?.(day, suggestedSlot)}
                        data-testid="fill-remaining-macros-button"
                        data-cy="fill-remaining-macros-button"
                        aria-label={String(`${actionLabel}: ${budgetHintText}`)}
                        title={String(budgetHintText || actionLabel)}
                        className="border-green-450/50 bg-green-450 hover:bg-green-450/90 inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-neutral-900 shadow-2xs transition-colors duration-200"
                    >
                        <FiSliders
                            size={12}
                            className="shrink-0"
                            aria-hidden="true"
                        />
                        <span>{actionLabel}</span>
                    </button>
                )}
            </div>

            <div
                className={`grid gap-2.5 ${getProgressGridClass(progressItems.length)}`}
            >
                {progressItems.map((item) => {
                    const spec = MACRO_GOAL_SPECS[item.key];
                    const label = translateOrFallback(
                        t,
                        spec.labelKey,
                        spec.fallbackLabel
                    );
                    const isOver = item.status === 'over';

                    return (
                        <div
                            key={item.key}
                            data-testid={`day-goal-item-${item.key}`}
                            className="flex flex-col gap-1"
                        >
                            <div className="flex items-baseline justify-between gap-2 text-xs">
                                <span className="font-medium text-neutral-600 dark:text-neutral-300">
                                    {label}
                                </span>
                                <span className="tabular-nums">
                                    <span
                                        className={
                                            isOver
                                                ? 'font-semibold text-amber-700 dark:text-amber-400'
                                                : 'font-semibold text-neutral-900 dark:text-white'
                                        }
                                    >
                                        {item.current}
                                    </span>
                                    <span className="text-neutral-500 dark:text-neutral-400">
                                        {` / ${item.target}${spec.unit}`}
                                    </span>
                                    {isOver && (
                                        <span className="ml-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                            {`(+${item.overBy})`}
                                        </span>
                                    )}
                                </span>
                            </div>

                            <div
                                role="progressbar"
                                aria-valuenow={item.current}
                                aria-valuemin={0}
                                aria-valuemax={item.target}
                                aria-label={String(
                                    `${label}: ${item.current} / ${item.target}${spec.unit}`
                                )}
                                data-testid={`day-goal-bar-${item.key}`}
                                className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-700/70"
                            >
                                <div
                                    style={{ width: `${item.clampedPercent}%` }}
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        isOver
                                            ? 'bg-amber-400 dark:bg-amber-500'
                                            : 'bg-green-450'
                                    }`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
