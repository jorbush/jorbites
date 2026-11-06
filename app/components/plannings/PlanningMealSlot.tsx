'use client';

import React from 'react';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import { AiOutlineDelete } from 'react-icons/ai';
import { FiPlus } from 'react-icons/fi';
import { getMealIcon, getMealHeaderClass } from './utils';
import { MAX_RECIPES_PER_MEAL } from '@/app/utils/constants';

interface PlanningMealSlotProps {
    day: string;
    mealType: string;
    slotMeals: any[];
    isOwner: boolean;
    onAddRecipeClick: (day: string, mealType: string) => void;
    onRemoveRecipe: (mealId: string) => void;
    push: (url: string) => void;
    t: any;
}

export const PlanningMealSlot: React.FC<PlanningMealSlotProps> = ({
    day,
    mealType,
    slotMeals,
    isOwner,
    onAddRecipeClick,
    onRemoveRecipe,
    push,
    t,
}) => {
    return (
        <div
            data-testid="meal-slot"
            className="flex min-h-[140px] flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40"
        >
            {/* Meal Slot Header */}
            <div
                className={`flex flex-row items-center gap-2 border-b border-inherit px-3 py-2 text-xs font-semibold ${getMealHeaderClass(mealType)}`}
            >
                {getMealIcon(mealType)}
                <span className="capitalize">{t(mealType)}</span>
            </div>

            {/* Meals Container */}
            <div className="flex flex-1 flex-col gap-2 p-2">
                {slotMeals.map((meal) => {
                    const recipe = meal.recipe;
                    if (!recipe) return null;

                    return (
                        <div
                            key={meal.id}
                            className="group/recipe relative flex flex-row items-center gap-2.5 rounded-lg border border-neutral-200/80 bg-white p-2 shadow-2xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:hover:border-neutral-600"
                        >
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                                <CustomProxyImage
                                    src={recipe.imageSrc}
                                    alt={recipe.title}
                                    fill
                                    className="object-cover"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => push(`/recipes/${recipe.id}`)}
                                className="flex-1 cursor-pointer truncate border-0 bg-transparent pr-6 text-left focus:outline-hidden"
                            >
                                <div
                                    className="truncate text-xs font-semibold text-neutral-800 hover:underline dark:text-neutral-200"
                                    data-cy="slot-recipe-title"
                                >
                                    {recipe.title}
                                </div>
                                <div className="mt-0.5 flex max-w-full flex-row items-center gap-1">
                                    {recipe.user && (
                                        <span className="truncate text-[10px] font-light text-neutral-500 dark:text-neutral-400">
                                            by {recipe.user.name || 'Anonymous'}
                                        </span>
                                    )}
                                    {recipe.user && recipe.calories && (
                                        <span className="text-[10px] text-neutral-300 dark:text-neutral-700">
                                            •
                                        </span>
                                    )}
                                    {recipe.calories && (
                                        <span
                                            data-testid="recipe-calories"
                                            className="dark:text-green-450 shrink-0 text-[10px] font-semibold text-neutral-700"
                                        >
                                            {recipe.calories} kcal
                                        </span>
                                    )}
                                </div>
                            </button>

                            {/* Remove button in Edit mode */}
                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveRecipe(meal.id)}
                                    data-cy="remove-meal-recipe-button"
                                    className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1 text-neutral-400 opacity-0 transition-opacity duration-200 group-hover/recipe:opacity-100 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                    title={t('delete') || 'Delete'}
                                >
                                    <AiOutlineDelete size={15} />
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Add Recipe Button (in Edit Mode) */}
                {isOwner && slotMeals.length < MAX_RECIPES_PER_MEAL && (
                    <button
                        type="button"
                        onClick={() => onAddRecipeClick(day, mealType)}
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 py-2.5 text-xs text-neutral-500 transition-colors duration-200 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:text-white"
                        data-testid="add-recipe-button"
                        data-cy="add-recipe-button"
                    >
                        <FiPlus size={14} />
                        <span>{t('add_recipe')}</span>
                    </button>
                )}

                {!isOwner && slotMeals.length === 0 && (
                    <div className="flex flex-1 items-center justify-center py-4 text-[11px] font-light text-neutral-400 italic">
                        {t('empty_slot') || 'No meals scheduled'}
                    </div>
                )}
            </div>
        </div>
    );
};
