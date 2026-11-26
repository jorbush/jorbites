'use client';

import React, { useMemo } from 'react';
import { PlanningMealSlot } from './PlanningMealSlot';
import { MEAL_TYPES } from '@/app/utils/constants';
import { aggregateDayMacros, hasAnyMacro } from '@/app/utils/planningNutrition';

interface PlanningDayCardProps {
    day: string;
    groupedMeals: Record<string, any[]>;
    isOwner: boolean;
    onAddRecipeClick: (day: string, mealType: string) => void;
    onRemoveRecipe: (mealId: string) => void;
    push: (url: string) => void;
    t: any;
}

interface MacroSegment {
    key: string;
    testId: string;
    text: string;
    title: string;
    isPrimary?: boolean;
}

const getShortLabel = (t: any, key: string, fallback: string): string => {
    const value = t?.(key, { defaultValue: fallback });
    if (!value || value === key) {
        return fallback;
    }
    return String(value);
};

export const PlanningDayCard: React.FC<PlanningDayCardProps> = ({
    day,
    groupedMeals,
    isOwner,
    onAddRecipeClick,
    onRemoveRecipe,
    push,
    t,
}) => {
    const dayMacros = useMemo(
        () => aggregateDayMacros(day, groupedMeals),
        [day, groupedMeals]
    );

    const macroSegments = useMemo<MacroSegment[]>(() => {
        const segments: MacroSegment[] = [];

        if (dayMacros.calories !== null) {
            segments.push({
                key: 'calories',
                testId: 'day-calories',
                text: `${dayMacros.calories} kcal`,
                title: String(
                    t('calories', { defaultValue: 'Calories' }) || 'Calories'
                ),
                isPrimary: true,
            });
        }

        if (dayMacros.protein !== null) {
            segments.push({
                key: 'protein',
                testId: 'day-protein',
                text: `${dayMacros.protein}g ${getShortLabel(t, 'macro_short_protein', 'P')}`,
                title: String(
                    t('protein', { defaultValue: 'Protein' }) || 'Protein'
                ),
            });
        }

        if (dayMacros.carbohydrates !== null) {
            segments.push({
                key: 'carbohydrates',
                testId: 'day-carbohydrates',
                text: `${dayMacros.carbohydrates}g ${getShortLabel(t, 'macro_short_carbohydrates', 'C')}`,
                title: String(
                    t('carbohydrates', { defaultValue: 'Carbs' }) || 'Carbs'
                ),
            });
        }

        if (dayMacros.fat !== null) {
            segments.push({
                key: 'fat',
                testId: 'day-fat',
                text: `${dayMacros.fat}g ${getShortLabel(t, 'macro_short_fat', 'F')}`,
                title: String(t('fat', { defaultValue: 'Fat' }) || 'Fat'),
            });
        }

        if (dayMacros.fiber !== null) {
            segments.push({
                key: 'fiber',
                testId: 'day-fiber',
                text: `${dayMacros.fiber}g ${getShortLabel(t, 'macro_short_fiber', 'Fib')}`,
                title: String(t('fiber', { defaultValue: 'Fiber' }) || 'Fiber'),
            });
        }

        return segments;
    }, [dayMacros, t]);

    const showMacroSummary = hasAnyMacro(dayMacros);

    return (
        <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
            {/* Day Title & Daily Macro Summary */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold tracking-tight text-neutral-900 capitalize sm:text-xl dark:text-white">
                    {t(day)}
                </h3>
                {showMacroSummary && (
                    <div
                        data-testid="day-macro-summary"
                        className="border-green-450/40 bg-green-450/15 dark:border-green-450/30 dark:bg-green-450/10 inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-full border px-3 py-1 text-xs font-medium text-neutral-800 dark:text-neutral-200"
                    >
                        {macroSegments.map((segment, index) => (
                            <React.Fragment key={segment.key}>
                                {index > 0 && (
                                    <span
                                        aria-hidden="true"
                                        className="text-neutral-400 dark:text-neutral-500"
                                    >
                                        ·
                                    </span>
                                )}
                                <span
                                    data-testid={segment.testId}
                                    title={segment.title}
                                    className={
                                        segment.isPrimary
                                            ? 'dark:text-green-450 font-semibold text-neutral-900'
                                            : 'text-neutral-700 dark:text-neutral-300'
                                    }
                                >
                                    {segment.text}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {/* 4 Meal Slots Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {MEAL_TYPES.map((mealType) => {
                    const key = `${day}-${mealType}`;
                    const slotMeals = groupedMeals[key] || [];

                    return (
                        <PlanningMealSlot
                            key={mealType}
                            day={day}
                            mealType={mealType}
                            slotMeals={slotMeals}
                            isOwner={isOwner}
                            onAddRecipeClick={onAddRecipeClick}
                            onRemoveRecipe={onRemoveRecipe}
                            push={push}
                            t={t}
                        />
                    );
                })}
            </div>
        </div>
    );
};
