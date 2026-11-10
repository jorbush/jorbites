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
        <div
            data-cy="planning-card"
            className="group relative flex w-full flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
        >
            <div className="flex w-full flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-1 text-lg font-bold text-neutral-900 dark:text-white">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                push(`/plannings/${plan.id}`);
                            }}
                            data-cy="planning-card-title"
                            className="decoration-green-450 cursor-pointer text-left font-bold decoration-2 underline-offset-4 transition-colors duration-200 group-hover:underline after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:underline focus:outline-hidden"
                        >
                            {plan.name}
                        </button>
                    </h3>
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
                            data-cy="delete-planning-button"
                            className="relative z-10 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-200/80 bg-red-50 text-red-600 shadow-2xs transition-colors duration-200 hover:border-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:border-red-800"
                            title={t('delete') || 'Delete'}
                        >
                            <AiOutlineDelete size={16} />
                        </button>
                    )}
                </div>
                <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {plan.description ||
                        t('no_description') ||
                        'No description'}
                </p>
            </div>

            <div className="mt-4 flex flex-row items-center overflow-hidden py-0.5">
                {previews.map((recipe: any) => (
                    <CustomProxyImage
                        key={recipe.id}
                        src={recipe.imageSrc}
                        alt={recipe.title}
                        className="-ml-2.5 inline-block size-8 rounded-full object-cover ring-2 ring-white transition-transform duration-200 first:ml-0 dark:ring-neutral-900"
                        width={32}
                        height={32}
                        circular={true}
                    />
                ))}
                {previews.length === 0 && (
                    <span className="text-xs text-neutral-400 italic dark:text-neutral-500">
                        {t('no_recipes_yet') || 'No recipes yet'}
                    </span>
                )}
            </div>

            <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        {plan.user ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    push(`/profile/${plan.user!.id}`);
                                }}
                                className="group/author relative z-10 flex min-w-0 cursor-pointer items-center gap-2 text-left focus:outline-hidden"
                            >
                                <Avatar
                                    src={plan.user.image}
                                    size={22}
                                    quality="auto:eco"
                                />
                                <span className="group-hover/author:text-green-450 dark:group-hover/author:text-green-450 truncate text-xs font-medium text-neutral-700 transition-colors duration-200 dark:text-neutral-300">
                                    {plan.user.name}
                                </span>
                            </button>
                        ) : (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {formatDate(plan.createdAt, language)}
                            </span>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            {plan.isPrivate ? (
                                <GiPadlock
                                    size={13}
                                    className="text-neutral-400 dark:text-neutral-500"
                                />
                            ) : (
                                <GiPadlockOpen
                                    size={13}
                                    className="text-neutral-400 dark:text-neutral-500"
                                />
                            )}
                            <span>
                                {totalMealsCount} {t('meals')}
                            </span>
                        </span>
                    </div>
                </div>
                <div className="mt-1.5 text-right text-[11px] text-neutral-400 dark:text-neutral-500">
                    {formatDate(plan.createdAt, language)}
                </div>
            </div>
        </div>
    );
};
