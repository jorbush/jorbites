'use client';

import React from 'react';
import { PlanningMealSlot } from './PlanningMealSlot';
import { MEAL_TYPES } from '@/app/utils/constants';

interface PlanningDayCardProps {
    day: string;
    groupedMeals: Record<string, any[]>;
    isOwner: boolean;
    onAddRecipeClick: (day: string, mealType: string) => void;
    onRemoveRecipe: (mealId: string) => void;
    push: (url: string) => void;
    t: any;
}

export const PlanningDayCard: React.FC<PlanningDayCardProps> = ({
    day,
    groupedMeals,
    isOwner,
    onAddRecipeClick,
    onRemoveRecipe,
    push,
    t,
}) => {
    const totalCalories = MEAL_TYPES.reduce((acc, mealType) => {
        const key = `${day}-${mealType}`;
        const slotMeals = groupedMeals[key] || [];
        return (
            acc +
            slotMeals.reduce(
                (sum, meal) => sum + (meal.recipe?.calories || 0),
                0
            )
        );
    }, 0);

    return (
        <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
            {/* Day Title & Calories */}
            <div className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight text-neutral-900 capitalize sm:text-xl dark:text-white">
                    {t(day)}
                </h3>
                {totalCalories > 0 && (
                    <span
                        data-testid="day-calories"
                        className="border-green-450/40 bg-green-450/15 dark:text-green-450 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold text-neutral-800"
                    >
                        {totalCalories}{' '}
                        {(t('calories') || 'calories').toLowerCase()}
                    </span>
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
