'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';
import { FiHeart, FiBook } from 'react-icons/fi';
import { MdOutlineTimer } from 'react-icons/md';
import { SlBadge } from 'react-icons/sl';

interface ChefCardProps {
    chef: SafeUser;
}

const ChefCard = memo(function ChefCard({ chef }: ChefCardProps) {
    const { push } = useRouter() || {};
    const { t } = useTranslation();

    const navigateToProfile = () => {
        push(`/profile/${chef.id}`);
    };

    return (
        <div
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-neutral-300 sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/90 dark:hover:border-neutral-700"
            data-cy="chef-card"
            data-testid="chef-card"
        >
            <div>
                {/* Level Badge in top corner */}
                <div className="flex w-full justify-end">
                    <span className="border-green-450/30 bg-green-450/15 dark:text-green-450 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold text-neutral-800">
                        {t('level')} {chef.level}
                    </span>
                </div>

                {/* Avatar */}
                <div className="my-2 flex justify-center">
                    <div className="rounded-full p-0.5 ring-2 ring-neutral-100 dark:ring-neutral-700/60">
                        <Avatar
                            src={chef.image}
                            size={96}
                        />
                    </div>
                </div>

                {/* Chef Name */}
                <div className="mt-1 flex items-center justify-center gap-1.5 text-center">
                    <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateToProfile();
                            }}
                            className="decoration-green-450 cursor-pointer text-left decoration-2 underline-offset-4 transition-colors duration-200 group-hover:underline after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:underline focus:outline-hidden"
                            data-cy="chef-card-name"
                            data-testid="chef-card-name"
                        >
                            {chef.name || t('anonymous')}
                        </button>
                    </h3>
                    {chef.verified && (
                        <VerificationBadge
                            size={18}
                            className="flex-shrink-0"
                        />
                    )}
                </div>

                {/* Most Used Category */}
                {chef.mostUsedCategory && (
                    <div className="mt-0.5 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {t(chef.mostUsedCategory.toLowerCase())}
                    </div>
                )}
            </div>

            <div className="mt-4">
                {/* Stats Grid Shelf */}
                <div className="grid w-full grid-cols-3 gap-2 rounded-xl border border-neutral-100 bg-neutral-50/70 p-2.5 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                    {/* Recipes */}
                    <div className="flex flex-col items-center">
                        <div className="mb-0.5 flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                            <FiBook size={14} />
                        </div>
                        <div
                            className="text-base font-bold text-neutral-900 dark:text-white"
                            data-cy="chef-card-recipes"
                            data-testid="chef-card-recipes"
                        >
                            {chef.recipeCount || 0}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {chef.recipeCount === 1
                                ? t('recipe')
                                : t('recipes')}
                        </div>
                    </div>

                    {/* Likes */}
                    <div className="flex flex-col items-center">
                        <div className="mb-0.5 flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                            <FiHeart size={14} />
                        </div>
                        <div
                            className="text-base font-bold text-neutral-900 dark:text-white"
                            data-cy="chef-card-likes"
                            data-testid="chef-card-likes"
                        >
                            {chef.likesReceived || 0}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {t('likes')}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-col items-center">
                        <div className="mb-0.5 flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                            <SlBadge size={14} />
                        </div>
                        <div
                            className="text-base font-bold text-neutral-900 dark:text-white"
                            data-cy="chef-card-badges"
                            data-testid="chef-card-badges"
                        >
                            {chef.badges?.length || 0}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {t('badges')}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Indicator */}
                {(!!chef.recipesThisMonth || !!chef.recipesThisYear) && (
                    <div className="mt-3 w-full space-y-1.5">
                        {!!chef.recipesThisMonth && (
                            <div className="border-green-450/30 bg-green-450/10 flex items-center justify-center gap-1.5 rounded-xl border py-1.5">
                                <MdOutlineTimer className="dark:text-green-450 text-neutral-700" />
                                <span
                                    className="dark:text-green-450 text-xs font-semibold text-neutral-800"
                                    data-testid="chef-card-recipes-this-month"
                                >
                                    {chef.recipesThisMonth}{' '}
                                    {t('recipes_this_month')}
                                </span>
                            </div>
                        )}
                        {!!chef.recipesThisYear && (
                            <div className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200/70 bg-neutral-50 py-1.5 dark:border-neutral-700/60 dark:bg-neutral-800/50">
                                <MdOutlineTimer className="text-neutral-500 dark:text-neutral-400" />
                                <span
                                    className="text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                                    data-testid="chef-card-recipes-this-year"
                                >
                                    {chef.recipesThisYear}{' '}
                                    {t('recipes_this_year')}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Average likes indicator */}
                {chef.avgLikesPerRecipe != null &&
                    chef.avgLikesPerRecipe > 0 && (
                        <div className="mt-2 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
                            ~{chef.avgLikesPerRecipe} {t('likes_per_recipe')}
                        </div>
                    )}
            </div>
        </div>
    );
});

export default ChefCard;
