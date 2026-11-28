'use client';

import React, { useMemo } from 'react';
import { FiActivity, FiAlertCircle, FiTarget } from 'react-icons/fi';
import {
    aggregateWeeklyNutrition,
    DailyNutritionTargets,
    DailyTargetField,
    hasAnyDailyTarget,
    hasAnyMacro,
    MacroTotals,
    PlanAllergen,
    PlanningMealLike,
} from '@/app/utils/planningNutrition';

interface MacroDisplaySpec {
    field: keyof MacroTotals;
    testId: string;
    unit: string;
    labelKey: string;
    fallbackLabel: string;
    isPrimary?: boolean;
}

const MACRO_SPECS: readonly MacroDisplaySpec[] = [
    {
        field: 'calories',
        testId: 'weekly-avg-calories',
        unit: ' kcal',
        labelKey: 'calories',
        fallbackLabel: 'Calories',
        isPrimary: true,
    },
    {
        field: 'protein',
        testId: 'weekly-avg-protein',
        unit: 'g',
        labelKey: 'protein',
        fallbackLabel: 'Protein',
    },
    {
        field: 'carbohydrates',
        testId: 'weekly-avg-carbohydrates',
        unit: 'g',
        labelKey: 'carbohydrates',
        fallbackLabel: 'Carbs',
    },
    {
        field: 'fat',
        testId: 'weekly-avg-fat',
        unit: 'g',
        labelKey: 'fat',
        fallbackLabel: 'Fat',
    },
    {
        field: 'fiber',
        testId: 'weekly-avg-fiber',
        unit: 'g',
        labelKey: 'fiber',
        fallbackLabel: 'Fiber',
    },
];

interface TargetDisplaySpec {
    field: DailyTargetField;
    testId: string;
    unit: string;
    labelKey: string;
    fallbackLabel: string;
    isPrimary?: boolean;
}

const TARGET_SPECS: readonly TargetDisplaySpec[] = [
    {
        field: 'targetCalories',
        testId: 'plan-target-calories',
        unit: ' kcal',
        labelKey: 'calories',
        fallbackLabel: 'Calories',
        isPrimary: true,
    },
    {
        field: 'targetProtein',
        testId: 'plan-target-protein',
        unit: 'g',
        labelKey: 'protein',
        fallbackLabel: 'Protein',
    },
    {
        field: 'targetCarbohydrates',
        testId: 'plan-target-carbohydrates',
        unit: 'g',
        labelKey: 'carbohydrates',
        fallbackLabel: 'Carbs',
    },
    {
        field: 'targetFat',
        testId: 'plan-target-fat',
        unit: 'g',
        labelKey: 'fat',
        fallbackLabel: 'Fat',
    },
];

const translateOrFallback = (t: any, key: string, fallback: string): string =>
    String(t(key, { defaultValue: fallback }) || fallback);

interface DailyGoalsSummaryProps {
    dailyTargets: DailyNutritionTargets;
    t: any;
}

const DailyGoalsSummary: React.FC<DailyGoalsSummaryProps> = ({
    dailyTargets,
    t,
}) => {
    const visibleSpecs = TARGET_SPECS.filter(
        (spec) =>
            typeof dailyTargets[spec.field] === 'number' &&
            dailyTargets[spec.field]! > 0
    );

    return (
        <div
            data-testid="plan-daily-targets-summary"
            className="flex flex-col gap-2"
        >
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
                <FiTarget
                    size={14}
                    className="text-green-450 shrink-0"
                    aria-hidden="true"
                />
                <span>
                    {translateOrFallback(
                        t,
                        'daily_nutrition_goals',
                        'Daily nutrition goals'
                    )}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {visibleSpecs.map((spec) => (
                    <div
                        key={spec.field}
                        data-testid={spec.testId}
                        className={
                            spec.isPrimary
                                ? 'border-green-450/40 bg-green-450/15 dark:border-green-450/30 dark:bg-green-450/10 inline-flex items-baseline gap-1.5 rounded-xl border px-3 py-1.5 text-xs'
                                : 'inline-flex items-baseline gap-1.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-1.5 text-xs dark:border-neutral-800/80 dark:bg-neutral-800/50'
                        }
                    >
                        <span
                            className={
                                spec.isPrimary
                                    ? 'dark:text-green-450 font-bold text-neutral-900'
                                    : 'font-bold text-neutral-900 dark:text-white'
                            }
                        >
                            {dailyTargets[spec.field]}
                            {spec.unit}
                        </span>
                        <span className="font-medium text-neutral-500 dark:text-neutral-400">
                            {translateOrFallback(
                                t,
                                spec.labelKey,
                                spec.fallbackLabel
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface WeeklyMacroAveragesProps {
    dailyAverages: MacroTotals;
    t: any;
}

const WeeklyMacroAverages: React.FC<WeeklyMacroAveragesProps> = ({
    dailyAverages,
    t,
}) => {
    const visibleSpecs = MACRO_SPECS.filter(
        (spec) => dailyAverages[spec.field] !== null
    );

    return (
        <div
            data-testid="weekly-macro-averages"
            className="flex flex-col gap-2"
        >
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
                <FiActivity
                    size={14}
                    className="text-green-450 shrink-0"
                    aria-hidden="true"
                />
                <span>
                    {translateOrFallback(
                        t,
                        'daily_average_macros',
                        'Daily average'
                    )}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {visibleSpecs.map((spec) => (
                    <div
                        key={spec.field}
                        data-testid={spec.testId}
                        className={
                            spec.isPrimary
                                ? 'border-green-450/40 bg-green-450/15 dark:border-green-450/30 dark:bg-green-450/10 inline-flex items-baseline gap-1.5 rounded-xl border px-3 py-1.5 text-xs'
                                : 'inline-flex items-baseline gap-1.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-1.5 text-xs dark:border-neutral-800/80 dark:bg-neutral-800/50'
                        }
                    >
                        <span
                            className={
                                spec.isPrimary
                                    ? 'dark:text-green-450 font-bold text-neutral-900'
                                    : 'font-bold text-neutral-900 dark:text-white'
                            }
                        >
                            {dailyAverages[spec.field]}
                            {spec.unit}
                        </span>
                        <span className="font-medium text-neutral-500 dark:text-neutral-400">
                            {translateOrFallback(
                                t,
                                spec.labelKey,
                                spec.fallbackLabel
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface PlanAllergensSummaryProps {
    allergens: PlanAllergen[];
    t: any;
}

const PlanAllergensSummary: React.FC<PlanAllergensSummaryProps> = ({
    allergens,
    t,
}) => (
    <div
        data-testid="plan-allergens-summary"
        className="flex flex-col gap-2"
    >
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
            <FiAlertCircle
                size={14}
                className="shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
            />
            <span>
                {translateOrFallback(t, 'plan_allergens', 'Plan allergens')}
            </span>
        </div>
        <div className="flex flex-wrap gap-2">
            {allergens.map((allergen) => {
                const Icon = allergen.icon;
                const label = translateOrFallback(
                    t,
                    `allergen_${allergen.id}`,
                    allergen.id
                );
                const tooltip =
                    allergen.recipeTitles.length > 0
                        ? `${label}: ${allergen.recipeTitles.join(', ')}`
                        : label;

                return (
                    <span
                        key={allergen.id}
                        data-testid={`plan-allergen-badge-${allergen.id}`}
                        title={String(tooltip)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/70 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200"
                    >
                        <Icon
                            size={13}
                            className="shrink-0 text-amber-700 dark:text-amber-300"
                            aria-hidden="true"
                        />
                        <span>{label}</span>
                    </span>
                );
            })}
        </div>
        <p
            className="text-xs text-neutral-500 dark:text-neutral-400"
            data-testid="plan-allergen-disclaimer"
        >
            {translateOrFallback(
                t,
                'allergen_disclaimer',
                'Automatically estimated from recipe ingredients and tags — may be incomplete. Always verify ingredients for food allergies.'
            )}
        </p>
    </div>
);

interface PlanningNutritionSummaryProps {
    meals: PlanningMealLike[];
    dailyTargets?: DailyNutritionTargets | null;
    t: any;
}

export const PlanningNutritionSummary: React.FC<
    PlanningNutritionSummaryProps
> = ({ meals, dailyTargets, t }) => {
    const weeklySummary = useMemo(
        () => aggregateWeeklyNutrition(meals),
        [meals]
    );

    const hasTargets = hasAnyDailyTarget(dailyTargets);
    const hasDailyAverages =
        weeklySummary.populatedDays > 0 &&
        hasAnyMacro(weeklySummary.dailyAverages);
    const hasAllergens = weeklySummary.allergens.length > 0;

    if (!hasTargets && !hasDailyAverages && !hasAllergens) {
        return null;
    }

    return (
        <div
            data-testid="planning-nutrition-summary"
            className="mt-4 flex flex-col gap-4 border-t border-neutral-100 pt-4 dark:border-neutral-800"
        >
            {hasTargets && dailyTargets && (
                <DailyGoalsSummary
                    dailyTargets={dailyTargets}
                    t={t}
                />
            )}
            {hasDailyAverages && (
                <WeeklyMacroAverages
                    dailyAverages={weeklySummary.dailyAverages}
                    t={t}
                />
            )}
            {hasAllergens && (
                <PlanAllergensSummary
                    allergens={weeklySummary.allergens}
                    t={t}
                />
            )}
        </div>
    );
};
