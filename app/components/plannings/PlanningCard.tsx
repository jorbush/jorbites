'use client';

import React from 'react';
import { SafePlanning, SafeUser } from '@/app/types';
import { AiOutlineDelete } from 'react-icons/ai';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';

interface PlanningCardProps {
    plan: SafePlanning;
    currentUser?: SafeUser | null;
    showDelete?: boolean;
    isSavedTab?: boolean;
    onUnsave: (planId: string) => void;
    onDeleteClick: (planId: string) => void;
    push: (url: string) => void;
    t: any;
    language: string;
}

const getPreviewRecipes = (plan: SafePlanning) => {
    if (!plan.meals) return [];
    const unique: any[] = [];
    const seen = new Set();
    for (const meal of plan.meals) {
        if (meal.recipe && !seen.has(meal.recipe.id)) {
            seen.add(meal.recipe.id);
            unique.push(meal.recipe);
        }
    }
    return unique.slice(0, 4);
};

export const PlanningCard: React.FC<PlanningCardProps> = ({
    plan,
    currentUser,
    showDelete = false,
    isSavedTab = false,
    onUnsave,
    onDeleteClick,
    push,
    t,
    language,
}) => {
    const previews = getPreviewRecipes(plan);
    const totalMealsCount = plan.meals?.length || 0;

    return (
        <div className="group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/50 p-5 shadow-xs backdrop-blur-xs transition duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-xl dark:border-neutral-800/60 dark:bg-[#121212]/50 dark:hover:bg-[#181818]">
            <div className="flex w-full flex-col gap-2">
                <div className="flex flex-row items-center justify-between gap-2">
                    <div className="truncate text-xl font-semibold text-neutral-900 group-hover:text-black dark:text-neutral-100 dark:group-hover:text-white">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                push(`/plannings/${plan.id}`);
                            }}
                            className="cursor-pointer text-left font-semibold after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:underline focus:outline-hidden"
                        >
                            {plan.name}
                        </button>
                    </div>
                    {showDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (
                                    isSavedTab &&
                                    plan.userId !== currentUser?.id
                                ) {
                                    onUnsave(plan.id);
                                } else {
                                    onDeleteClick(plan.id);
                                }
                            }}
                            className="cursor-pointer rounded-full border-0 bg-transparent p-2 text-neutral-500 hover:bg-neutral-100 hover:text-rose-600 focus:outline-hidden dark:hover:bg-neutral-800"
                            title={t('delete') || 'Delete'}
                        >
                            <AiOutlineDelete size={18} />
                        </button>
                    )}
                </div>
                <p className="line-clamp-2 text-sm font-light text-neutral-500 dark:text-neutral-400">
                    {plan.description ||
                        t('no_description') ||
                        'No description'}
                </p>
            </div>

            <div className="mt-5 flex w-full flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                        {t('PREVIEW_RECIPES') || 'Recipes Preview'}
                    </span>
                    <div className="flex flex-row items-center overflow-hidden py-1">
                        {previews.map((recipe: any) => (
                            <CustomProxyImage
                                key={recipe.id}
                                src={recipe.imageSrc}
                                alt={recipe.title}
                                className="-ml-3 inline-block size-8 rounded-full object-cover ring-2 ring-white transition-all group-hover:scale-105 first:ml-0 dark:ring-neutral-900"
                                width={32}
                                height={32}
                                circular={true}
                            />
                        ))}
                        {previews.length === 0 && (
                            <span className="text-xs font-light text-neutral-400 italic">
                                {t('no_recipes_yet')}
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-full border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center gap-1.5">
                            {plan.isPrivate ? (
                                <GiPadlock
                                    size={14}
                                    className="text-neutral-400"
                                />
                            ) : (
                                <GiPadlockOpen
                                    size={14}
                                    className="text-neutral-400"
                                />
                            )}
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                {totalMealsCount} {t('meals')}
                            </span>
                        </div>
                        {plan.user && (
                            <div className="flex flex-row items-center gap-1.5">
                                <Avatar
                                    src={plan.user.image}
                                    size={18}
                                />
                                <span className="max-w-[80px] truncate text-xs font-light text-neutral-500 dark:text-neutral-400">
                                    {plan.user.name}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mt-2 text-right text-[10px] font-light text-neutral-400">
                        {formatDate(plan.createdAt, language)}
                    </div>
                </div>
            </div>
        </div>
    );
};
