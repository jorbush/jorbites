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
import Container from '@/app/components/utils/Container';
import StatCard from '@/app/components/stats/StatCard';
import PreferenceCard from '@/app/components/stats/PreferenceCard';

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

    // Footer elements
    const recipesTrendFooter =
        trend > 0 ? (
            <>
                <FaArrowUp className="mr-1 text-green-500" />
                <span className="font-medium text-green-500">{trend}% </span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                    {t('this_year')}
                </span>
            </>
        ) : null;

    const likesFooter = (
        <span className="text-gray-500 dark:text-gray-400">
            {t('avg')}: {user?.avgLikesPerRecipe || 0} {t('per_recipe')}
        </span>
    );

    const cookingTimeFooter = (
        <span className="text-gray-500 dark:text-gray-400">
            {user?.totalCookingTime || 0} {t('minutes_total')}
        </span>
    );

    const thisYearFooter = (
        <span className="text-gray-500 dark:text-gray-400">
            {Math.round(
                ((user?.recipesThisYear || 0) / (recipeCount || 1)) * 100
            )}
            % {t('of_all_recipes')}
        </span>
    );

    return (
        <Container>
            <div className="py-4">
                <h2 className="mb-4 px-2 text-xl font-semibold dark:text-neutral-100">
                    {t('cooking_statistics')}{' '}
                </h2>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatCard
                        title={t('recipes')}
                        value={formatNumber(recipeCount)}
                        icon={<IoFastFoodOutline />}
                        iconBgColor="bg-green-100"
                        iconDarkBgColor="dark:bg-green-900/30"
                        iconColor="text-green-450"
                        footer={recipesTrendFooter}
                    />

                    <StatCard
                        title={t('favorites')}
                        value={formatNumber(user?.likesReceived || 0)}
                        icon={<FaHeart />}
                        iconBgColor="bg-red-100"
                        iconDarkBgColor="dark:bg-red-900/30"
                        iconColor="text-red-500"
                        footer={likesFooter}
                    />

                    <StatCard
                        title={t('cooking_time')}
                        value={`${cookingTimeInHours}h`}
                        icon={<IoTimeOutline />}
                        iconBgColor="bg-blue-100"
                        iconDarkBgColor="dark:bg-blue-900/30"
                        iconColor="text-blue-500"
                        footer={cookingTimeFooter}
                    />

                    <StatCard
                        title={
                            t('this_year').charAt(0).toUpperCase() +
                            t('this_year').slice(1)
                        }
                        value={user?.recipesThisYear || 0}
                        icon={<IoStarOutline />}
                        iconBgColor="bg-purple-100"
                        iconDarkBgColor="dark:bg-purple-900/30"
                        iconColor="text-purple-500"
                        footer={thisYearFooter}
                    />
                </div>

                <h2 className="mb-4 mt-6 px-2 text-xl font-semibold dark:text-neutral-100">
                    {t('cooking_preferences')}{' '}
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <PreferenceCard
                        title={t('most_used_category')}
                        value={
                            user?.mostUsedCategory
                                ? t(user.mostUsedCategory.toLowerCase())
                                : '-'
                        }
                        icon={<IoRestaurantOutline />}
                        iconBgColor="bg-amber-100"
                        iconDarkBgColor="dark:bg-amber-900/30"
                        iconColor="text-amber-500"
                    />

                    <PreferenceCard
                        title={t('most_used_method')}
                        value={
                            user?.mostUsedMethod
                                ? t(user.mostUsedMethod.toLowerCase())
                                : '-'
                        }
                        icon={<IoFlameOutline />}
                        iconBgColor="bg-teal-100"
                        iconDarkBgColor="dark:bg-teal-900/30"
                        iconColor="text-teal-500"
                    />
                </div>
            </div>
        </Container>
    );
};

export default UserStats;
