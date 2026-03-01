'use client';

import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import Container from '@/app/components/utils/Container';
import { formatDateLanguage } from '@/app/utils/date-utils';

interface RecipeContributionGraphProps {
    recipes: Array<{ id: string; createdAt: string }>;
}

interface DayData {
    date: Date;
    count: number;
    level: number; // 0-4 for intensity levels
}

const RecipeContributionGraph: React.FC<RecipeContributionGraphProps> = ({
    recipes,
}) => {
    const { t } = useTranslation();
    const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    // Generate the last year of days, aligned to weeks starting from Sunday
    const { weeks } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const recipeMap = new Map<string, number>();

        // Count recipes per day
        recipes.forEach((recipe) => {
            const recipeDate = new Date(recipe.createdAt);
            recipeDate.setHours(0, 0, 0, 0);
            const dateKey = recipeDate.toISOString().split('T')[0];
            recipeMap.set(dateKey, (recipeMap.get(dateKey) || 0) + 1);
        });

        // Find the Sunday of the week that contains today (or the first day if today is Sunday)
        const todayDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        const daysToSubtract = todayDayOfWeek;
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - daysToSubtract - 52 * 7); // Go back to the Sunday 52 weeks ago

        const weeksArray: DayData[][] = [];

        // Generate 371 days (53 weeks × 7 days) starting from startDate
        // Reuse a single Date object for better performance
        const date = new Date(startDate);
        for (let i = 0; i < 371; i++) {
            if (i > 0) {
                date.setDate(date.getDate() + 1);
            }
            const dateKey = date.toISOString().split('T')[0];
            const count = recipeMap.get(dateKey) || 0;

            // Determine intensity level (0-4)
            let level = 0;
            if (count > 0) {
                if (count === 1) level = 1;
                else if (count === 2) level = 2;
                else if (count === 3) level = 3;
                else level = 4; // 4+ recipes
            }

            const dayData: DayData = {
                date: new Date(date), // Create a new Date object for storage to avoid mutation issues
                count,
                level,
            };

            // Group into weeks
            if (i % 7 === 0) {
                weeksArray.push([]);
            }
            weeksArray[weeksArray.length - 1].push(dayData);
        }

        return { weeks: weeksArray };
    }, [recipes]);

    // Get month labels for the top row
    const monthLabels = useMemo(() => {
        const labels: Array<{ weekIndex: number; month: string }> = [];
        let lastMonth = '';

        weeks.forEach((week, weekIndex) => {
            const firstDay = week[0]?.date;
            if (firstDay) {
                const month = formatDateLanguage(firstDay, 'MMM');
                if (month !== lastMonth) {
                    labels.push({ weekIndex, month });
                    lastMonth = month;
                }
            }
        });

        return labels;
    }, [weeks]);

    // Day of week labels - translated
    const dayLabels = [
        t('day_sun'),
        t('day_mon'),
        t('day_tue'),
        t('day_wed'),
        t('day_thu'),
        t('day_fri'),
        t('day_sat'),
    ];

    const getDayColor = (level: number) => {
        switch (level) {
            case 0:
                return 'bg-gray-100 dark:bg-neutral-800';
            case 1:
                return 'bg-green-450/30 dark:bg-green-450/20';
            case 2:
                return 'bg-green-450/50 dark:bg-green-450/40';
            case 3:
                return 'bg-green-450/70 dark:bg-green-450/60';
            case 4:
                return 'bg-green-450 dark:bg-green-450';
            default:
                return 'bg-gray-100 dark:bg-neutral-800';
        }
    };

    const handleDayHover = (
        day: DayData,
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        setHoveredDay(day);
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        });
    };

    const handleDayLeave = () => {
        setHoveredDay(null);
        setTooltipPosition(null);
    };

    const formatDate = (date: Date) => {
        return formatDateLanguage(date, 'MMM d, yyyy');
    };

    if (recipes.length === 0) {
        return null;
    }

    return (
        <Container>
            <div className="w-full py-4">
                <h2 className="mb-4 px-2 text-lg font-semibold sm:text-xl dark:text-neutral-100">
                    {t('recipe_contribution_graph')}
                </h2>
                <div className="flex justify-center">
                    <div className="w-full max-w-4xl overflow-x-auto">
                        <div className="relative min-w-[600px] sm:min-w-0">
                            {/* Wrapper to ensure month labels and grid scroll together */}
                            <div className="flex flex-col">
                                {/* Month labels row - aligned with grid columns */}
                                <div className="mb-2 flex min-w-[600px] gap-0.5 sm:min-w-0 sm:gap-1">
                                    {/* Spacer to match day labels column width */}
                                    <div className="w-6 shrink-0 sm:w-7" />
                                    {/* Month labels matching grid columns */}
                                    <div className="flex gap-0.5 sm:gap-1">
                                        {weeks.map((_, weekIndex) => {
                                            const monthLabel = monthLabels.find(
                                                (label) =>
                                                    label.weekIndex ===
                                                    weekIndex
                                            );
                                            return (
                                                <div
                                                    key={weekIndex}
                                                    className="flex w-2.5 items-start justify-start sm:w-3"
                                                >
                                                    {monthLabel && (
                                                        <span className="text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">
                                                            {monthLabel.month}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Calendar grid with day labels */}
                                <div className="flex gap-0.5 sm:gap-1">
                                    {/* Day of week labels */}
                                    <div className="flex flex-col gap-0.5 pr-1.5 sm:gap-1 sm:pr-2">
                                        {dayLabels.map((label, index) => (
                                            <div
                                                key={label}
                                                className="flex h-2.5 items-center justify-end text-[9px] text-gray-500 sm:h-3 sm:text-xs dark:text-gray-400"
                                            >
                                                {index % 2 === 0 && (
                                                    <span className="text-[8px] sm:text-[10px]">
                                                        {label}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar grid */}
                                    <div className="flex gap-0.5 sm:gap-1">
                                        {weeks.map((week, weekIndex) => (
                                            <div
                                                key={weekIndex}
                                                className="flex flex-col gap-0.5 sm:gap-1"
                                            >
                                                {week.map((day, dayIndex) => (
                                                    <div
                                                        key={`${weekIndex}-${dayIndex}`}
                                                        className={`h-2.5 w-2.5 rounded-sm transition-colors sm:h-3 sm:w-3 ${getDayColor(
                                                            day.level
                                                        )} ${day.count > 0 ? 'hover:ring-green-450/50 cursor-pointer hover:ring-2' : ''}`}
                                                        onMouseEnter={(e) =>
                                                            handleDayHover(
                                                                day,
                                                                e
                                                            )
                                                        }
                                                        onMouseLeave={
                                                            handleDayLeave
                                                        }
                                                        data-testid={`contribution-day-${day.count}`}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tooltip */}
                            {hoveredDay &&
                                tooltipPosition &&
                                hoveredDay.count > 0 && (
                                    <div
                                        className="pointer-events-none fixed z-50 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-neutral-950"
                                        style={{
                                            left: `${tooltipPosition.x}px`,
                                            top: `${tooltipPosition.y}px`,
                                            transform: 'translate(-50%, -100%)',
                                        }}
                                    >
                                        <div className="font-semibold">
                                            {hoveredDay.count}{' '}
                                            {hoveredDay.count === 1
                                                ? t('recipe')
                                                : t('recipes')}{' '}
                                            {t('on')}{' '}
                                            {formatDate(hoveredDay.date)}
                                        </div>
                                    </div>
                                )}

                            {/* Legend */}
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-2 text-[10px] text-gray-500 sm:gap-4 sm:text-xs dark:text-gray-400">
                                <span>{t('less')}</span>
                                <div className="flex gap-0.5 sm:gap-1">
                                    <div className="h-2.5 w-2.5 rounded-sm bg-gray-100 sm:h-3 sm:w-3 dark:bg-neutral-800" />
                                    <div className="bg-green-450/30 dark:bg-green-450/20 h-2.5 w-2.5 rounded-sm sm:h-3 sm:w-3" />
                                    <div className="bg-green-450/50 dark:bg-green-450/40 h-2.5 w-2.5 rounded-sm sm:h-3 sm:w-3" />
                                    <div className="bg-green-450/70 dark:bg-green-450/60 h-2.5 w-2.5 rounded-sm sm:h-3 sm:w-3" />
                                    <div className="bg-green-450 dark:bg-green-450 h-2.5 w-2.5 rounded-sm sm:h-3 sm:w-3" />
                                </div>
                                <span>{t('more')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeContributionGraph;
