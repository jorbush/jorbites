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
    return (
        <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200/50 bg-neutral-50/20 p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/20">
            {/* Day Title */}
            <h3 className="text-xl font-semibold tracking-tight capitalize">
                {t(day)}
            </h3>

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
