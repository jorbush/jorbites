'use client';

import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import {
    IoRestaurantOutline,
    IoHeartOutline,
    IoTimeOutline,
    IoCalendarOutline,
    IoBookmarkOutline,
    IoFlameOutline,
} from 'react-icons/io5';
import { FaArrowUp } from 'react-icons/fa';
import Container from '@/app/components/utils/Container';
import StatCard from '@/app/components/stats/StatCard';
import PreferenceCard from '@/app/components/stats/PreferenceCard';

const formatNumber = (num: number) => {
    if (num >= 1000) {
        return Math.round(num / 100) / 10 + 'k';
    }
    return num;
};

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

    // Footer elements
    const recipesTrendFooter =
        trend > 0 ? (
            <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-green-450/30 bg-green-450/20 px-2 py-0.5 text-[11px] font-semibold text-neutral-800 dark:bg-green-450/15 dark:text-green-450">
                    <FaArrowUp className="size-2 text-green-450 dark:text-green-450" />
                    {trend}%
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                    {t('this_year')}
                </span>
            </div>
        ) : null;

    const likesFooter = (
        <span className="text-neutral-500 dark:text-neutral-400">
            {t('avg')}:{' '}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {user?.avgLikesPerRecipe || 0}
            </span>{' '}
            {t('per_recipe')}
        </span>
    );

    const cookingTimeFooter = (
        <span className="text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {user?.totalCookingTime || 0}
            </span>{' '}
            {t('minutes_total')}
        </span>
    );

    const thisYearFooter = (
        <span className="text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {Math.round(
                    ((user?.recipesThisYear || 0) / (recipeCount || 1)) * 100
                )}
                %
            </span>{' '}
            {t('of_all_recipes')}
        </span>
    );

    const categoryDisplay = user?.mostUsedCategory
        ? t(user.mostUsedCategory.toLowerCase()) || user.mostUsedCategory
        : '-';

    const methodDisplay = user?.mostUsedMethod
        ? t(user.mostUsedMethod.toLowerCase()) || user.mostUsedMethod
        : '-';

    return (
        <Container>
            {recipeCount > 0 && (
                <div className="py-4">
                    {/* Cooking Statistics Section */}
                    <h2 className="mb-3 px-1 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-xl">
                        {t('cooking_statistics')}
                    </h2>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                        <StatCard
                            title={t('recipes')}
                            value={formatNumber(recipeCount)}
                            icon={<IoRestaurantOutline />}
                            footer={recipesTrendFooter}
                        />

                        <StatCard
                            title={t('favorites')}
                            value={formatNumber(user?.likesReceived || 0)}
                            icon={<IoHeartOutline />}
                            footer={likesFooter}
                        />

                        <StatCard
                            title={t('cooking_time')}
                            value={`${cookingTimeInHours}h`}
                            icon={<IoTimeOutline />}
                            footer={cookingTimeFooter}
                        />

                        <StatCard
                            title={
                                t('this_year').charAt(0).toUpperCase() +
                                t('this_year').slice(1)
                            }
                            value={user?.recipesThisYear || 0}
                            icon={<IoCalendarOutline />}
                            footer={thisYearFooter}
                        />
                    </div>

                    {/* Cooking Preferences Section */}
                    <h2 className="mb-3 mt-8 px-1 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-xl">
                        {t('cooking_preferences')}
                    </h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <PreferenceCard
                            title={t('most_used_category')}
                            value={categoryDisplay}
                            icon={<IoBookmarkOutline />}
                        />

                        <PreferenceCard
                            title={t('most_used_method')}
                            value={methodDisplay}
                            icon={<IoFlameOutline />}
                        />
                    </div>
                </div>
            )}
        </Container>
    );
};

export default UserStats;
