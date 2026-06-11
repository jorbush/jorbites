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
            className="border-neutral-250 flex min-h-[140px] flex-col overflow-hidden rounded-2xl border bg-white/40 dark:border-neutral-900 dark:bg-neutral-900/30"
        >
            {/* Meal Slot Header */}
            <div
                className={`flex flex-row items-center gap-2 border-b border-inherit px-3 py-2 text-sm font-semibold ${getMealHeaderClass(mealType)}`}
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
                            className="group/recipe dark:border-neutral-850 relative flex flex-row items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2 transition hover:bg-neutral-50 dark:bg-[#151515] dark:hover:bg-neutral-900"
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
                                <div className="truncate text-xs font-semibold text-neutral-800 hover:underline dark:text-neutral-200">
                                    {recipe.title}
                                </div>
                                {recipe.user && (
                                    <div className="truncate text-[10px] font-light text-neutral-500 dark:text-neutral-400">
                                        by {recipe.user.name || 'Anonymous'}
                                    </div>
                                )}
                            </button>

                            {/* Remove button in Edit mode */}
                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveRecipe(meal.id)}
                                    className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-1 text-neutral-500 opacity-0 transition-opacity duration-200 group-hover/recipe:opacity-100 hover:bg-neutral-100 hover:text-rose-600 dark:text-neutral-500 dark:hover:bg-neutral-800"
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
                        className="dark:border-neutral-850 flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 py-3 text-xs text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900/60 dark:hover:text-white"
                        data-testid="add-recipe-button"
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
