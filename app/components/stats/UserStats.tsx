'use client';

import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import {
    IoTimeOutline,
    IoFastFoodOutline,
    IoStarOutline,
    IoRestaurantOutline,
    IoFlameOutline,
} from 'react-icons/io5';
import { FaArrowUp, FaHeart } from 'react-icons/fa';
import Container from '@/app/components/Container';

const UserStats = ({ user }: { user?: SafeUser | null }) => {
    const { t } = useTranslation();

    if (!user) return null;

    const recipesThisYear = user?.recipesThisYear || 0;
    const recipeCount = user?.recipeCount || 0;
    const trend =
        recipeCount > 0 ? Math.round((recipesThisYear / recipeCount) * 100) : 0;

    const cookingTimeInHours = user?.totalCookingTime
        ? Math.round((user.totalCookingTime / 60) * 10) / 10
        : 0;

    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return Math.round(num / 100) / 10 + 'k';
        }
        return num;
    };

    return (
        <Container>
            <div className="py-4">
                <h2 className="mb-4 px-2 text-xl font-semibold dark:text-neutral-100">
                    {t('cooking_statistics')}
                </h2>

                {/* Main stats */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {/* Total recipes */}
                    <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('recipes')}
                                </p>
                                <p className="mt-1 text-2xl font-bold text-green-450">
                                    {formatNumber(recipeCount)}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                                <IoFastFoodOutline className="text-lg text-green-450" />
                            </div>
                        </div>

                        <div className="mt-3 flex items-center text-xs">
                            {trend > 0 && (
                                <>
                                    <FaArrowUp className="mr-1 text-green-500" />
                                    <span className="font-medium text-green-500">
                                        {trend}%{' '}
                                    </span>
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                                        {t('this_year')}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Total likes */}
                    <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('favorites')}
                                </p>
                                <p className="mt-1 text-2xl font-bold text-green-450">
                                    {formatNumber(user?.likesReceived || 0)}
                                </p>
                            </div>
                            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                                <FaHeart className="text-lg text-red-500" />
                            </div>
                        </div>

                        <div className="mt-3 flex items-center text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                                {t('avg')}: {user?.avgLikesPerRecipe || 0}{' '}
                                {t('per_recipe')}
                            </span>
                        </div>
                    </div>

                    {/* Cooking time */}
                    <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('cooking_time')}
                                </p>
                                <p className="mt-1 text-2xl font-bold text-green-450">
                                    {cookingTimeInHours}h
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                <IoTimeOutline className="text-lg text-blue-500" />
                            </div>
                        </div>

                        <div className="mt-3 flex items-center text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                                {user?.totalCookingTime || 0}{' '}
                                {t('minutes_total')}
                            </span>
                        </div>
                    </div>

                    {/* This year */}
                    <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('this_year').charAt(0).toUpperCase() + t('this_year').slice(1)}
                                </p>
                                <p className="mt-1 text-2xl font-bold text-green-450">
                                    {user?.recipesThisYear || 0}
                                </p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                                <IoStarOutline className="text-lg text-purple-500" />
                            </div>
                        </div>

                        <div className="mt-3 flex items-center text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                                {Math.round(
                                    ((user?.recipesThisYear || 0) /
                                        (recipeCount || 1)) *
                                        100
                                )}
                                % {t('of_all_recipes')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <h3 className="mb-3 mt-6 px-2 text-lg font-semibold dark:text-neutral-100">
                    {t('cooking_preferences')}
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Most used category */}
                    <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
                            <IoRestaurantOutline className="text-xl text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('most_used_category')}
                            </p>
                            <p className="text-lg font-semibold text-green-450">
                                {user?.mostUsedCategory
                                    ? t(user.mostUsedCategory.toLowerCase())
                                    : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Most used method */}
                    <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                        <div className="rounded-full bg-teal-100 p-3 dark:bg-teal-900/30">
                            <IoFlameOutline className="text-xl text-teal-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('most_used_method')}
                            </p>
                            <p className="text-lg font-semibold text-green-450">
                                {user?.mostUsedMethod
                                    ? t(user.mostUsedMethod.toLowerCase())
                                    : '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default UserStats;
