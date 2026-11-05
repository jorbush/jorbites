'use client';

import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import {
    IoTimeOutline,
    IoFastFoodOutline,
    IoStarOutline,
    IoRestaurantOutline,
    IoFlameOutline,
    IoBarChartOutline,
    IoSparklesOutline,
} from 'react-icons/io5';
import { FaArrowUp, FaHeart } from 'react-icons/fa';
import Container from '@/app/components/utils/Container';
import StatCard from '@/app/components/stats/StatCard';
import PreferenceCard from '@/app/components/stats/PreferenceCard';
import { categories } from '@/app/components/navbar/categoriesData';
import { preparationMethods } from '@/app/components/modals/recipe-steps/preparationMethodsData';

const formatNumber = (num: number) => {
    if (num >= 1000) {
        return Math.round(num / 100) / 10 + 'k';
    }
    return num;
};

const getCategoryIcon = (categoryName?: string | null) => {
    if (!categoryName) return <IoRestaurantOutline />;
    const found = categories.find(
        (c) => c.label.toLowerCase() === categoryName.trim().toLowerCase()
    );
    if (found) {
        const IconComponent = found.icon;
        return <IconComponent />;
    }
    return <IoRestaurantOutline />;
};

const getMethodIcon = (methodName?: string | null) => {
    if (!methodName) return <IoFlameOutline />;
    const found = preparationMethods.find(
        (m) => m.label.toLowerCase() === methodName.trim().toLowerCase()
    );
    if (found) {
        const IconComponent = found.icon;
        return <IconComponent />;
    }
    return <IoFlameOutline />;
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
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <FaArrowUp className="size-2.5" />
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
                    <div className="mb-4 flex items-center gap-2 px-1">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <IoBarChartOutline className="size-4" />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-xl">
                            {t('cooking_statistics')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                        <StatCard
                            title={t('recipes')}
                            value={formatNumber(recipeCount)}
                            icon={<IoFastFoodOutline />}
                            iconBgColor="bg-emerald-50"
                            iconDarkBgColor="dark:bg-emerald-950/40"
                            iconColor="text-emerald-600 dark:text-emerald-400"
                            glowColor="bg-emerald-500"
                            footer={recipesTrendFooter}
                        />

                        <StatCard
                            title={t('favorites')}
                            value={formatNumber(user?.likesReceived || 0)}
                            icon={<FaHeart />}
                            iconBgColor="bg-rose-50"
                            iconDarkBgColor="dark:bg-rose-950/40"
                            iconColor="text-rose-500 dark:text-rose-400"
                            glowColor="bg-rose-500"
                            footer={likesFooter}
                        />

                        <StatCard
                            title={t('cooking_time')}
                            value={`${cookingTimeInHours}h`}
                            icon={<IoTimeOutline />}
                            iconBgColor="bg-sky-50"
                            iconDarkBgColor="dark:bg-sky-950/40"
                            iconColor="text-sky-600 dark:text-sky-400"
                            glowColor="bg-sky-500"
                            footer={cookingTimeFooter}
                        />

                        <StatCard
                            title={
                                t('this_year').charAt(0).toUpperCase() +
                                t('this_year').slice(1)
                            }
                            value={user?.recipesThisYear || 0}
                            icon={<IoStarOutline />}
                            iconBgColor="bg-purple-50"
                            iconDarkBgColor="dark:bg-purple-950/40"
                            iconColor="text-purple-600 dark:text-purple-400"
                            glowColor="bg-purple-500"
                            footer={thisYearFooter}
                        />
                    </div>

                    {/* Cooking Preferences Section */}
                    <div className="mb-4 mt-8 flex items-center gap-2 px-1">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                            <IoSparklesOutline className="size-4" />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-xl">
                            {t('cooking_preferences')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <PreferenceCard
                            title={t('most_used_category')}
                            value={categoryDisplay}
                            icon={getCategoryIcon(user?.mostUsedCategory)}
                            iconBgColor="bg-amber-50"
                            iconDarkBgColor="dark:bg-amber-950/40"
                            iconColor="text-amber-600 dark:text-amber-400"
                            glowColor="bg-amber-500"
                        />

                        <PreferenceCard
                            title={t('most_used_method')}
                            value={methodDisplay}
                            icon={getMethodIcon(user?.mostUsedMethod)}
                            iconBgColor="bg-teal-50"
                            iconDarkBgColor="dark:bg-teal-950/40"
                            iconColor="text-teal-600 dark:text-teal-400"
                            glowColor="bg-teal-500"
                        />
                    </div>
                </div>
            )}
        </Container>
    );
};

export default UserStats;
