'use client';

import { useTranslation } from 'react-i18next';
import { useState, useMemo, useRef, useEffect } from 'react';
import Container from '@/app/components/utils/Container';
import { formatDateLanguage } from '@/app/utils/date-utils';
import {
    IoFastFoodOutline,
    IoFlameOutline,
    IoTimeOutline,
} from 'react-icons/io5';

interface RecipeContributionGraphProps {
    recipes: Array<{ id: string; createdAt: string }>;
}

interface DayData {
    date: Date;
    count: number;
    level: number; // 0-4 for intensity levels
}

type TimeRange = '3M' | '6M' | '1Y';

const getDayColor = (level: number) => {
    switch (level) {
        case 0:
            return 'bg-neutral-100 dark:bg-neutral-800';
        case 1:
            return 'bg-green-450/30 dark:bg-green-450/20';
        case 2:
            return 'bg-green-450/50 dark:bg-green-450/40';
        case 3:
            return 'bg-green-450/70 dark:bg-green-450/60';
        case 4:
            return 'bg-green-450 dark:bg-green-450';
        default:
            return 'bg-neutral-100 dark:bg-neutral-800';
    }
};

const RecipeContributionGraph: React.FC<RecipeContributionGraphProps> = ({
    recipes,
}) => {
    const { t, i18n } = useTranslation();
    const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
    const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

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

    // Compute activity metrics (Total recipes, active days, longest streak)
    const stats = useMemo(() => {
        let totalInYear = 0;
        let activeDays = 0;
        let currentStreak = 0;
        let maxStreak = 0;

        const allDays = weeks.flat();
        allDays.forEach((day) => {
            totalInYear += day.count;
            if (day.count > 0) {
                activeDays++;
                currentStreak++;
                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
            } else {
                currentStreak = 0;
            }
        });

        return {
            totalInYear,
            activeDays,
            maxStreak,
        };
    }, [weeks]);

    // Slice weeks based on selected timeRange
    const displayedWeeks = useMemo(() => {
        if (timeRange === '3M') return weeks.slice(-13);
        if (timeRange === '6M') return weeks.slice(-26);
        return weeks;
    }, [weeks, timeRange]);

    // Get month labels for the top row
    const monthLabels = useMemo(() => {
        const labels: Array<{ weekIndex: number; month: string }> = [];
        let lastMonth = '';

        displayedWeeks.forEach((week, weekIndex) => {
            const firstDay = week[0]?.date;
            if (firstDay) {
                const month = formatDateLanguage(
                    firstDay,
                    'MMM',
                    i18n.language
                );
                if (month !== lastMonth) {
                    labels.push({ weekIndex, month });
                    lastMonth = month;
                }
            }
        });

        return labels;
    }, [displayedWeeks, i18n.language]);

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

    const checkScroll = () => {
        const el = scrollContainerRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 12);
            setCanScrollRight(
                el.scrollLeft < el.scrollWidth - el.clientWidth - 12
            );
        }
    };

    // Auto-scroll to the far right on mount / range change so user sees recent activity immediately
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            el.scrollLeft = el.scrollWidth;
            checkScroll();
        }
    }, [timeRange, displayedWeeks]);

    const handleDayHover = (
        day: DayData,
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        setHoveredDay(day);
        const rect = event.currentTarget.getBoundingClientRect();
        const tooltipX = Math.max(
            80,
            Math.min(
                (typeof window !== 'undefined' ? window.innerWidth : 800) - 80,
                rect.left + rect.width / 2
            )
        );
        const tooltipY = Math.max(40, rect.top - 10);
        setTooltipPosition({
            x: tooltipX,
            y: tooltipY,
        });
    };

    const handleDayLeave = () => {
        setHoveredDay(null);
        setTooltipPosition(null);
    };

    const handleDayClick = (day: DayData) => {
        setSelectedDay((prev) =>
            prev && prev.date.getTime() === day.date.getTime() ? null : day
        );
    };

    const formatDate = (date: Date) => {
        return formatDateLanguage(date, 'MMM d, yyyy', i18n.language);
    };

    if (recipes.length === 0) {
        return null;
    }

    const activeDay = selectedDay || hoveredDay;

    return (
        <Container>
            <div className="w-full py-4">
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs sm:p-6 dark:border-neutral-700/60 dark:bg-neutral-800">
                    {/* Header with Title, Metrics, and Range Controls */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold sm:text-xl dark:text-neutral-100">
                                {t('recipe_contribution_graph')}
                            </h2>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-700 dark:bg-neutral-700/60 dark:text-neutral-300">
                                    <IoFastFoodOutline className="text-green-500 dark:text-green-400" />
                                    {stats.totalInYear}{' '}
                                    {t('recipes_in_last_year')}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-700 dark:bg-neutral-700/60 dark:text-neutral-300">
                                    <IoTimeOutline className="text-blue-500 dark:text-blue-400" />
                                    {stats.activeDays} {t('active_days')}
                                </span>
                                {stats.maxStreak > 1 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-700 dark:bg-neutral-700/60 dark:text-neutral-300">
                                        <IoFlameOutline className="text-orange-500 dark:text-orange-400" />
                                        {stats.maxStreak}{' '}
                                        {stats.maxStreak === 1
                                            ? t('day_streak')
                                            : t('days_streak')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex items-center self-start rounded-lg bg-neutral-100 p-0.5 sm:self-auto dark:bg-neutral-700/60">
                            {(['3M', '6M', '1Y'] as const).map((range) => (
                                <button
                                    key={range}
                                    type="button"
                                    onClick={() => setTimeRange(range)}
                                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                        timeRange === range
                                            ? 'bg-white text-green-600 shadow-xs dark:bg-neutral-800 dark:text-green-400'
                                            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    {range === '3M'
                                        ? t('view_3m')
                                        : range === '6M'
                                          ? t('view_6m')
                                          : t('view_1y')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Container with sticky day column and edge fade indicators */}
                    <div className="relative">
                        {canScrollLeft && (
                            <div className="pointer-events-none absolute top-0 bottom-6 left-6 z-20 w-6 bg-gradient-to-r from-white to-transparent sm:left-7 dark:from-neutral-800" />
                        )}
                        {canScrollRight && (
                            <div className="pointer-events-none absolute top-0 right-0 bottom-6 z-20 w-6 bg-gradient-to-l from-white to-transparent dark:from-neutral-800" />
                        )}

                        <div
                            ref={scrollContainerRef}
                            onScroll={checkScroll}
                            className="relative w-full overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
                        >
                            <div className="relative inline-flex min-w-[600px] flex-col sm:min-w-0">
                                {/* Month labels row - aligned with grid columns */}
                                <div className="mb-2 flex min-w-[600px] gap-0.5 sm:min-w-0 sm:gap-1">
                                    {/* Spacer matching sticky day labels column width */}
                                    <div className="sticky left-0 z-10 w-6 shrink-0 bg-white sm:w-7 dark:bg-neutral-800" />
                                    {/* Month labels matching grid columns */}
                                    <div className="flex gap-0.5 sm:gap-1">
                                        {displayedWeeks.map(
                                            (week, weekIndex) => {
                                                const monthLabel =
                                                    monthLabels.find(
                                                        (label) =>
                                                            label.weekIndex ===
                                                            weekIndex
                                                    );
                                                return (
                                                    <div
                                                        key={week[0].date.toISOString()}
                                                        className="flex w-2.5 shrink-0 items-start justify-start sm:w-3"
                                                    >
                                                        {monthLabel && (
                                                            <span className="text-[10px] whitespace-nowrap text-neutral-500 sm:text-xs dark:text-neutral-400">
                                                                {
                                                                    monthLabel.month
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                {/* Calendar grid with day labels */}
                                <div className="flex gap-0.5 sm:gap-1">
                                    {/* Day of week labels - STICKY on left */}
                                    <div className="sticky left-0 z-10 flex flex-col gap-0.5 bg-white pr-1.5 sm:gap-1 sm:pr-2 dark:bg-neutral-800">
                                        {dayLabels.map((label, index) => (
                                            <div
                                                key={label}
                                                className="flex h-2.5 items-center justify-end text-[9px] font-medium text-neutral-400 sm:h-3 sm:text-xs dark:text-neutral-500"
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
                                        {displayedWeeks.map((week) => (
                                            <div
                                                key={week[0].date.toISOString()}
                                                data-testid="week-column"
                                                className="flex shrink-0 flex-col gap-0.5 sm:gap-1"
                                            >
                                                {week.map((day) => {
                                                    const isSelected =
                                                        selectedDay &&
                                                        selectedDay.date.getTime() ===
                                                            day.date.getTime();
                                                    return (
                                                        <div
                                                            key={day.date.toISOString()}
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() =>
                                                                handleDayClick(
                                                                    day
                                                                )
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key ===
                                                                        'Enter' ||
                                                                    e.key ===
                                                                        ' '
                                                                ) {
                                                                    e.preventDefault();
                                                                    handleDayClick(
                                                                        day
                                                                    );
                                                                }
                                                            }}
                                                            className={`aspect-square size-2.5 shrink-0 rounded-[2px] transition-all sm:size-3 sm:rounded-sm ${getDayColor(
                                                                day.level
                                                            )} ${
                                                                day.count > 0
                                                                    ? 'hover:ring-green-450/60 cursor-pointer hover:ring-2'
                                                                    : 'cursor-pointer hover:ring-1 hover:ring-neutral-400/40'
                                                            } ${
                                                                isSelected
                                                                    ? 'z-20 scale-125 shadow-xs ring-2 ring-green-500 dark:ring-green-400'
                                                                    : ''
                                                            }`}
                                                            onMouseEnter={(e) =>
                                                                handleDayHover(
                                                                    day,
                                                                    e
                                                                )
                                                            }
                                                            onMouseLeave={
                                                                handleDayLeave
                                                            }
                                                            title={
                                                                day.count > 0
                                                                    ? `${formatDate(day.date)}: ${day.count} ${day.count === 1 ? t('recipe') : t('recipes')}`
                                                                    : formatDate(
                                                                          day.date
                                                                      )
                                                            }
                                                            aria-label={formatDate(
                                                                day.date
                                                            )}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active / Selected Day Details Pill (Touch/Click & Keyboard friendly) */}
                    {activeDay && (
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-neutral-200/70 bg-neutral-50 px-3 py-2 text-xs transition-all dark:border-neutral-700/60 dark:bg-neutral-900/60">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-block size-2.5 shrink-0 rounded-xs ${getDayColor(
                                        activeDay.level
                                    )}`}
                                />
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {activeDay.count > 0
                                        ? `${activeDay.count} ${
                                              activeDay.count === 1
                                                  ? t('recipe')
                                                  : t('recipes')
                                          }`
                                        : t('no_recipes_on_day')}
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                    {t('on')} {formatDate(activeDay.date)}
                                </span>
                            </div>
                            {selectedDay && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedDay(null)}
                                    className="ml-2 rounded-full px-1.5 py-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                                    aria-label="Dismiss selection"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}

                    {/* Tooltip for desktop hover */}
                    {hoveredDay &&
                        tooltipPosition &&
                        hoveredDay.count > 0 &&
                        !selectedDay && (
                            <div
                                className="pointer-events-none fixed z-50 rounded-md bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-neutral-950"
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
                                    {t('on')} {formatDate(hoveredDay.date)}
                                </div>
                            </div>
                        )}

                    {/* Footer: Mobile hint and Legend */}
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 pt-1 sm:flex-row sm:gap-4">
                        {canScrollLeft && (
                            <span className="text-[11px] text-neutral-400 sm:hidden">
                                ← {t('swipe_to_view_history')}
                            </span>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 sm:ml-auto sm:text-xs dark:text-neutral-400">
                            <span>{t('less')}</span>
                            <div className="flex gap-0.5 sm:gap-1">
                                <div className="size-2.5 rounded-[2px] bg-neutral-100 sm:size-3 sm:rounded-sm dark:bg-neutral-800" />
                                <div className="bg-green-450/30 dark:bg-green-450/20 size-2.5 rounded-[2px] sm:size-3 sm:rounded-sm" />
                                <div className="bg-green-450/50 dark:bg-green-450/40 size-2.5 rounded-[2px] sm:size-3 sm:rounded-sm" />
                                <div className="bg-green-450/70 dark:bg-green-450/60 size-2.5 rounded-[2px] sm:size-3 sm:rounded-sm" />
                                <div className="bg-green-450 dark:bg-green-450 size-2.5 rounded-[2px] sm:size-3 sm:rounded-sm" />
                            </div>
                            <span>{t('more')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeContributionGraph;
