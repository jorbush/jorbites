'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';
import { FiAward, FiHeart, FiBook } from 'react-icons/fi';
import { MdOutlineTimer } from 'react-icons/md';
import { SlBadge } from 'react-icons/sl';

interface ChefCardProps {
    chef: SafeUser;
}

const ChefCard = memo(function ChefCard({ chef }: ChefCardProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const handleClick = () => {
        router.push(`/profile/${chef.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            data-cy="chef-card"
            data-testid="chef-card"
        >
            {/* Header with gradient background */}
            <div className="relative h-24 bg-gradient-to-br from-orange-400 to-amber-500">
                {/* Level Badge */}
                <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-800">
                        <FiAward
                            className="text-yellow-500"
                            size={16}
                        />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t('level')} {chef.level}
                        </span>
                    </div>
                </div>
            </div>

            {/* Avatar overlapping the header */}
            <div className="relative -mt-12 flex flex-col items-center px-4 pb-4">
                <div className="mb-3 rounded-full border-4 border-white dark:border-gray-800">
                    <Avatar
                        src={chef.image}
                        size={96}
                    />
                </div>

                {/* Chef Name */}
                <div className="mb-2 flex items-center gap-2">
                    <h3
                        className="text-lg font-semibold text-gray-900 hover:text-orange-500 dark:text-white dark:hover:text-orange-400"
                        data-cy="chef-card-name"
                        data-testid="chef-card-name"
                    >
                        {chef.name || t('anonymous')}
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
                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        {chef.mostUsedCategory}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="mt-2 grid w-full grid-cols-3 gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                    {/* Recipes */}
                    <div className="flex flex-col items-center">
                        <div className="mb-1 flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <FiBook size={16} />
                        </div>
                        <div
                            className="text-lg font-bold text-gray-900 dark:text-white"
                            data-cy="chef-card-recipes"
                            data-testid="chef-card-recipes"
                        >
                            {chef.recipeCount || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {chef.recipeCount === 1
                                ? t('recipe')
                                : t('recipes')}
                        </div>
                    </div>

                    {/* Likes */}
                    <div className="flex flex-col items-center">
                        <div className="mb-1 flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <FiHeart size={16} />
                        </div>
                        <div
                            className="text-lg font-bold text-gray-900 dark:text-white"
                            data-cy="chef-card-likes"
                            data-testid="chef-card-likes"
                        >
                            {chef.likesReceived || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t('likes')}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-col items-center">
                        <div className="mb-1 flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <SlBadge size={16} />
                        </div>
                        <div
                            className="text-lg font-bold text-gray-900 dark:text-white"
                            data-cy="chef-card-badges"
                            data-testid="chef-card-badges"
                        >
                            {chef.badges?.length || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t('badges')}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Indicator */}
                {chef.recipesThisYear != null && chef.recipesThisYear > 0 && (
                    <div className="mt-4 w-full">
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-2 dark:bg-green-900/20">
                            <MdOutlineTimer className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                {chef.recipesThisYear}{' '}
                                {t('recipes_this_year') || 'this year'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Average likes indicator */}
                {chef.avgLikesPerRecipe != null &&
                    chef.avgLikesPerRecipe > 0 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            ~{chef.avgLikesPerRecipe}{' '}
                            {t('likes_per_recipe') || 'likes/recipe'}
                        </div>
                    )}
            </div>
        </div>
    );
});

export default ChefCard;
