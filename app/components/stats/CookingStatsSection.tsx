'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    IoRestaurantOutline,
    IoHeartOutline,
    IoTimeOutline,
    IoCalendarOutline,
} from 'react-icons/io5';
import { SafeUser } from '@/app/types';
import StatCard from '@/app/components/stats/StatCard';
import {
    formatStatNumber,
    calculateTrend,
    calculateCookingTimeInHours,
    calculateThisYearPercentage,
    capitalize,
} from '@/app/components/stats/userStatsUtils';
import {
    RecipesTrendFooter,
    LikesFooter,
    CookingTimeFooter,
    ThisYearFooter,
} from '@/app/components/stats/CookingStatsFooters';

export interface CookingStatsSectionProps {
    user: SafeUser;
    recipeCount: number;
}

const CookingStatsSection: React.FC<CookingStatsSectionProps> = ({
    user,
    recipeCount,
}) => {
    const { t } = useTranslation();

    const recipesThisYear = user.recipesThisYear || 0;
    const trend = calculateTrend(recipesThisYear, recipeCount);
    const cookingTimeInHours = calculateCookingTimeInHours(
        user.totalCookingTime
    );
    const likesReceived = user.likesReceived || 0;
    const avgLikes = user.avgLikesPerRecipe || 0;
    const totalCookingTime = user.totalCookingTime || 0;
    const thisYearPercentage = calculateThisYearPercentage(
        recipesThisYear,
        recipeCount
    );

    const thisYearRaw = String(t('this_year'));
    const thisYearTitle = capitalize(thisYearRaw);

    return (
        <div>
            <h2 className="mb-3 px-1 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl dark:text-neutral-100">
                {String(t('cooking_statistics'))}
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                <StatCard
                    title={String(t('recipes'))}
                    value={formatStatNumber(recipeCount)}
                    icon={<IoRestaurantOutline />}
                    footer={<RecipesTrendFooter trend={trend} />}
                />

                <StatCard
                    title={String(t('favorites'))}
                    value={formatStatNumber(likesReceived)}
                    icon={<IoHeartOutline />}
                    footer={<LikesFooter avgLikes={avgLikes} />}
                />

                <StatCard
                    title={String(t('cooking_time'))}
                    value={`${cookingTimeInHours}h`}
                    icon={<IoTimeOutline />}
                    footer={
                        <CookingTimeFooter totalMinutes={totalCookingTime} />
                    }
                />

                <StatCard
                    title={thisYearTitle}
                    value={recipesThisYear}
                    icon={<IoCalendarOutline />}
                    footer={<ThisYearFooter percentage={thisYearPercentage} />}
                />
            </div>
        </div>
    );
};

export default CookingStatsSection;
