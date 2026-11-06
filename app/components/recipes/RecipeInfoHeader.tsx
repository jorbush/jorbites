'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import HeartButton from '@/app/components/buttons/HeartButton';
import AddToListButton from '@/app/components/buttons/AddToListButton';
import VerificationBadge from '@/app/components/VerificationBadge';
import StarRating from '@/app/components/utils/StarRating';
import getUserDisplayName from '@/app/utils/responsive';
import { CuisineIcon } from './CuisineIcon';

interface RecipeInfoHeaderProps {
    user: SafeUser;
    currentUser?: SafeUser | null;
    id: string;
    likes: number;
    stepsCount: number;
    ingredientsCount: number;
    averageRating: number;
    ratingCount: number;
    mounted: boolean;
    t: any;
    push: (url: string) => void;
    isMdOrSmaller: boolean;
    isSmOrSmaller: boolean;
    calories?: number | null;
    recipeCuisine?: string | null;
    recipeYield?: number | null;
}

export const RecipeInfoHeader: React.FC<RecipeInfoHeaderProps> = ({
    user,
    currentUser,
    id,
    likes,
    stepsCount,
    ingredientsCount,
    averageRating,
    ratingCount,
    mounted,
    t,
    push,
    isMdOrSmaller,
    isSmOrSmaller,
    calories,
    recipeCuisine,
    recipeYield,
}) => {
    return (
        <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-white p-3.5 shadow-xs sm:p-4 dark:border-neutral-800 dark:bg-neutral-900/90">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0">
                        <Avatar
                            src={user?.image}
                            size={44}
                            onClick={() => push('/profile/' + user.id)}
                            extraClasses="size-10 sm:size-11 ring-2 ring-neutral-100 dark:ring-neutral-800"
                            quality="auto:eco"
                        />
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                className="hover:text-green-450 dark:hover:text-green-450 cursor-pointer truncate text-left text-base font-bold text-neutral-900 transition-colors duration-200 focus:outline-hidden dark:text-white"
                                onClick={() => push('/profile/' + user.id)}
                            >
                                {getUserDisplayName(
                                    user,
                                    isMdOrSmaller,
                                    isSmOrSmaller
                                )}
                            </button>
                            {user.verified && (
                                <VerificationBadge className="text-green-450 shrink-0" />
                            )}
                        </div>
                        <div className="mt-0.5 inline-flex items-center">
                            <span className="border-green-450/30 bg-green-450/15 dark:text-green-450 rounded-full border px-2 py-0.5 text-xs font-semibold text-neutral-800">
                                {mounted
                                    ? `${t('level')} ${user?.level}`
                                    : `level ${user?.level}`}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <AddToListButton
                        recipeId={id}
                        currentUser={currentUser}
                    />
                    <HeartButton
                        recipeId={id}
                        currentUser={currentUser}
                    />
                    <button
                        type="button"
                        onClick={() => push('/recipes/' + id + '/likes')}
                        className="cursor-pointer rounded-xl border border-neutral-200/80 bg-white px-2.5 py-1.5 text-sm font-semibold text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 focus:outline-hidden dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                        data-cy="recipe-num-likes"
                        aria-label="View users who liked this recipe"
                    >
                        {likes}
                    </button>
                </div>
            </div>

            {/* Inset Metadata Shelf */}
            <div className="flex flex-wrap items-center justify-around gap-3 rounded-xl border border-neutral-100/80 bg-neutral-50/70 p-3 text-sm font-medium text-neutral-600 sm:gap-6 sm:p-3.5 dark:border-neutral-800/60 dark:bg-neutral-800/50 dark:text-neutral-300">
                <div>
                    {stepsCount} {mounted ? t('steps').toLowerCase() : 'steps'}
                </div>
                <div>
                    {ingredientsCount}{' '}
                    {mounted ? t('ingredients').toLowerCase() : 'ingredients'}
                </div>
                {calories && (
                    <div data-testid="recipe-calories">
                        {calories}{' '}
                        {mounted ? t('calories').toLowerCase() : 'calories'}
                    </div>
                )}
                {recipeYield && (
                    <div data-testid="recipe-yield">
                        {recipeYield}{' '}
                        {mounted
                            ? recipeYield === 1
                                ? t('serving').toLowerCase()
                                : t('servings').toLowerCase()
                            : 'servings'}
                    </div>
                )}
                {recipeCuisine && (
                    <div
                        className="flex items-center gap-1.5"
                        data-testid="recipe-cuisine"
                    >
                        <CuisineIcon
                            cuisine={recipeCuisine}
                            size={16}
                        />
                        <span>
                            {mounted
                                ? t(
                                      `cuisine_${recipeCuisine.toLowerCase().replace(/\s+/g, '_')}`,
                                      { defaultValue: recipeCuisine }
                                  )
                                : recipeCuisine}
                        </span>
                    </div>
                )}
                {averageRating > 0 && (
                    <div
                        className="flex items-center gap-1.5"
                        data-testid="recipe-average-rating"
                    >
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {averageRating.toFixed(1)}
                        </span>
                        <StarRating
                            rating={averageRating}
                            size={14}
                        />
                        <button
                            onClick={() => {
                                document
                                    .getElementById('comments-section')
                                    ?.scrollIntoView({
                                        behavior: 'smooth',
                                    });
                            }}
                            className="cursor-pointer text-xs text-neutral-500 transition-colors duration-200 hover:text-neutral-700 hover:underline focus:outline-hidden dark:hover:text-neutral-300"
                            type="button"
                        >
                            ({ratingCount}
                            <span className="hidden md:inline">
                                {' '}
                                {mounted ? t('reviews') : 'reviews'}
                            </span>
                            )
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
