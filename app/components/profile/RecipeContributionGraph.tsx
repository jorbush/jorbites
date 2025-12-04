'use client';

import { SafeRecipe } from '@/app/types';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

interface RecipeContributionGraphProps {
    recipes: SafeRecipe[];
}

interface DayData {
    date: Date;
    count: number;
    dateString: string;
}

const RecipeContributionGraph: React.FC<RecipeContributionGraphProps> = ({
    recipes,
}) => {
    const { t } = useTranslation();

    // Calculate the contribution data for the last year
    const contributionData = useMemo(() => {
        const today = new Date();
        const oneYearAgo = new Date(
            today.getFullYear() - 1,
            today.getMonth(),
            today.getDate()
        );

        // Create a map of date strings to recipe counts
        const recipesByDate = new Map<string, number>();

        recipes.forEach((recipe) => {
            const recipeDate = new Date(recipe.createdAt);
            if (recipeDate >= oneYearAgo && recipeDate <= today) {
                const dateString = recipeDate.toISOString().split('T')[0];
                recipesByDate.set(
                    dateString,
                    (recipesByDate.get(dateString) || 0) + 1
                );
            }
        });

        // Generate all days for the last year
        const days: DayData[] = [];
        const currentDate = new Date(oneYearAgo);

        while (currentDate <= today) {
            const dateString = currentDate.toISOString().split('T')[0];
            days.push({
                date: new Date(currentDate),
                count: recipesByDate.get(dateString) || 0,
                dateString,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    }, [recipes]);

    // Group days by week
    const weeks = useMemo(() => {
        const weeksArray: DayData[][] = [];
        let currentWeek: DayData[] = [];

        // Add empty days at the beginning if the first day is not Sunday
        const firstDay = contributionData[0];
        if (firstDay) {
            const firstDayOfWeek = firstDay.date.getDay();
            for (let i = 0; i < firstDayOfWeek; i++) {
                currentWeek.push({
                    date: new Date(0),
                    count: 0,
                    dateString: '',
                });
            }
        }

        contributionData.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        });

        // Add the last incomplete week if it exists
        if (currentWeek.length > 0) {
            weeksArray.push(currentWeek);
        }

        return weeksArray;
    }, [contributionData]);

    // Get color intensity based on recipe count
    const getColorClass = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count === 1) return 'bg-green-450 opacity-30';
        if (count === 2) return 'bg-green-450 opacity-50';
        if (count === 3) return 'bg-green-450 opacity-70';
        return 'bg-green-450 opacity-100';
    };

    const formatDateForTooltip = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const totalRecipesLastYear = contributionData.reduce(
        (sum, day) => sum + day.count,
        0
    );

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const getMonthLabels = () => {
        const labels: { month: string; weekIndex: number }[] = [];
        let lastMonth = -1;

        weeks.forEach((week, index) => {
            const firstValidDay = week.find((day) => day.dateString !== '');
            if (firstValidDay) {
                const month = firstValidDay.date.getMonth();
                if (month !== lastMonth && index > 0) {
                    labels.push({ month: months[month], weekIndex: index });
                    lastMonth = month;
                }
            }
        });

        return labels;
    };

    const monthLabels = getMonthLabels();

    return (
        <div className="rounded-lg bg-white p-4 shadow-xs dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t('recipe_contributions')}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {totalRecipesLastYear} {t('recipes_last_year')}
                </span>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Month labels */}
                    <div className="relative mb-1 h-4">
                        {monthLabels.map((label, index) => (
                            <span
                                key={index}
                                className="absolute text-xs text-gray-600 dark:text-gray-400"
                                style={{
                                    left: `${label.weekIndex * 13}px`,
                                }}
                            >
                                {label.month}
                            </span>
                        ))}
                    </div>

                    {/* Contribution graph */}
                    <div className="flex gap-[3px]">
                        {weeks.map((week, weekIndex) => (
                            <div
                                key={weekIndex}
                                className="flex flex-col gap-[3px]"
                            >
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={`${weekIndex}-${dayIndex}`}
                                        className={`group relative h-[10px] w-[10px] rounded-sm ${
                                            day.dateString === ''
                                                ? 'bg-transparent'
                                                : getColorClass(day.count)
                                        }`}
                                        title={
                                            day.dateString
                                                ? `${day.count} ${day.count === 1 ? 'recipe' : 'recipes'} on ${formatDateForTooltip(day.date)}`
                                                : ''
                                        }
                                    >
                                        {day.dateString && (
                                            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block dark:bg-gray-700">
                                                {day.count}{' '}
                                                {day.count === 1
                                                    ? t('recipe')
                                                    : t('recipes')}{' '}
                                                on{' '}
                                                {formatDateForTooltip(day.date)}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-2 flex items-center justify-end gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <span>{t('less')}</span>
                        <div className="h-[10px] w-[10px] rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                        <div className="bg-green-450 h-[10px] w-[10px] rounded-sm opacity-30"></div>
                        <div className="bg-green-450 h-[10px] w-[10px] rounded-sm opacity-50"></div>
                        <div className="bg-green-450 h-[10px] w-[10px] rounded-sm opacity-70"></div>
                        <div className="bg-green-450 h-[10px] w-[10px] rounded-sm opacity-100"></div>
                        <span>{t('more')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeContributionGraph;
