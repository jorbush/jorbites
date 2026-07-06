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
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-1">
                <div className="col-span-2 flex flex-row items-center gap-2 text-xl font-semibold dark:text-neutral-100">
                    <Avatar
                        src={user?.image}
                        size={40}
                        onClick={() => push('/profile/' + user.id)}
                        quality="auto:eco"
                    />
                    <div className="flex flex-col">
                        <div className="flex flex-row">
                            <button
                                type="button"
                                className="cursor-pointer text-left focus:outline-hidden"
                                onClick={() => push('/profile/' + user.id)}
                            >
                                {getUserDisplayName(
                                    user,
                                    isMdOrSmaller,
                                    isSmOrSmaller
                                )}
                            </button>
                            {user.verified && (
                                <VerificationBadge className="mt-1 ml-1" />
                            )}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {mounted
                                ? `${t('level')} ${user?.level}`
                                : `level ${user?.level}`}
                        </div>
                    </div>
                </div>
                <div className="mr-4 mb-5 ml-auto flex flex-row items-end gap-2 text-xl">
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
                        className="cursor-pointer transition-all hover:underline hover:opacity-80 focus:outline-hidden dark:text-neutral-100"
                        data-cy="recipe-num-likes"
                        aria-label="View users who liked this recipe"
                    >
                        {likes}
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-light text-neutral-500">
                <div>
                    {stepsCount} {mounted ? t('steps').toLowerCase() : 'steps'}
                </div>
                <div>
                    {ingredientsCount}{' '}
                    {mounted ? t('ingredients').toLowerCase() : 'ingredients'}
                </div>
                {calories && (
                    <div
                        className="border-l border-neutral-300 pl-4 dark:border-neutral-700"
                        data-testid="recipe-calories"
                    >
                        {calories}{' '}
                        {mounted ? t('calories').toLowerCase() : 'calories'}
                    </div>
                )}
                {recipeYield && (
                    <div
                        className="border-l border-neutral-300 pl-4 dark:border-neutral-700"
                        data-testid="recipe-yield"
                    >
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
                        className="flex items-center gap-1.5 border-l border-neutral-300 pl-4 dark:border-neutral-700"
                        data-testid="recipe-cuisine"
                    >
                        <CuisineIcon
                            cuisine={recipeCuisine}
                            size={18}
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
                        className="flex items-center gap-1.5 border-l border-neutral-300 pl-4 dark:border-neutral-700"
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
                            className="cursor-pointer text-sm text-neutral-500 transition-colors hover:text-neutral-700 hover:underline focus:outline-hidden dark:hover:text-neutral-300"
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
