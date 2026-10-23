'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@/app/components/utils/Container';
import { formatDateLanguage } from '@/app/utils/date-utils';

export interface ActivityItem {
    id?: string;
    createdAt?: string | Date;
    date?: string | Date;
    type?: 'recipe' | 'comment' | 'challenge' | 'cooksnap' | 'review' | string;
    count?: number;
}

export interface ActivityHeatmapProps {
    recipes?: HeatmapRecipe[];
    comments?: Array<{
        id?: string;
        createdAt?: string | Date;
        isCooked?: boolean;
        rating?: number | null;
        comment?: string;
    }>;
    challengeSubmissions?: Array<{ id?: string; createdAt?: string | Date }>;
    activities?: ActivityItem[];
    title?: string;
    showTitle?: boolean;
}

export interface ActivityDayData {
    date: Date;
    dateKey: string;
    count: number;
    level: number; // 0-4
    recipesCount: number;
    cooksnapsCount: number;
    reviewsCount: number;
    commentsCount: number;
    challengesCount: number;
}

export const getActivityDayColor = (level: number) => {
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

export const formatLocalDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const toDateKey = (val?: string | Date | null): string | null => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return formatLocalDateKey(d);
};

export interface HeatmapRecipe {
    id?: string;
    createdAt?: string | Date;
    questId?: string | null;
}

export const useActivityCalendar = (
    recipes: HeatmapRecipe[] = [],
    comments: Array<{
        id?: string;
        createdAt?: string | Date;
        isCooked?: boolean;
        rating?: number | null;
    }> = [],
    challengeSubmissions: Array<{
        id?: string;
        createdAt?: string | Date;
    }> = [],
    activities: ActivityItem[] = [],
    language: string = 'en'
) => {
    const { weeks, totalActivities } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dataMap = new Map<
            string,
            {
                recipesCount: number;
                cooksnapsCount: number;
                reviewsCount: number;
                commentsCount: number;
                challengesCount: number;
                total: number;
            }
        >();

        const getOrCreate = (key: string) => {
            let entry = dataMap.get(key);
            if (!entry) {
                entry = {
                    recipesCount: 0,
                    cooksnapsCount: 0,
                    reviewsCount: 0,
                    commentsCount: 0,
                    challengesCount: 0,
                    total: 0,
                };
                dataMap.set(key, entry);
            }
            return entry;
        };

        let overallTotal = 0;

        // Process recipes
        recipes.forEach((r) => {
            const key = toDateKey(r.createdAt);
            if (key) {
                const e = getOrCreate(key);
                e.recipesCount += 1;
                if (r.questId) {
                    e.challengesCount += 1;
                }
                e.total += 1;
                overallTotal += 1;
            }
        });

        // Process comments
        comments.forEach((c) => {
            const key = toDateKey(c.createdAt);
            if (key) {
                const e = getOrCreate(key);
                e.total += 1;
                overallTotal += 1;
                if (c.isCooked) {
                    e.cooksnapsCount += 1;
                }
                if (c.rating !== undefined && c.rating !== null) {
                    e.reviewsCount += 1;
                }
                if (!c.isCooked && c.rating == null) {
                    e.commentsCount += 1;
                }
            }
        });

        // Process challenge submissions (avoid double-counting recipes already tracked)
        const recipeIdSet = new Set(recipes.map((r) => r.id).filter(Boolean));

        challengeSubmissions.forEach((cs) => {
            if (cs.id && recipeIdSet.has(cs.id)) {
                return;
            }
            const key = toDateKey(cs.createdAt);
            if (key) {
                const e = getOrCreate(key);
                e.challengesCount += 1;
                e.total += 1;
                overallTotal += 1;
            }
        });

        // Process generic activities
        activities.forEach((act) => {
            const key = toDateKey(act.date || act.createdAt);
            if (key) {
                const e = getOrCreate(key);
                const count = act.count || 1;
                e.total += count;
                overallTotal += count;
                if (act.type === 'recipe') e.recipesCount += count;
                else if (act.type === 'cooksnap') e.cooksnapsCount += count;
                else if (act.type === 'review') e.reviewsCount += count;
                else if (act.type === 'challenge') e.challengesCount += count;
                else e.commentsCount += count;
            }
        });

        const todayDayOfWeek = today.getDay();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - todayDayOfWeek - 52 * 7);

        const weeksArray: ActivityDayData[][] = [];
        const date = new Date(startDate);
        for (let i = 0; i < 371; i++) {
            if (i > 0) {
                date.setDate(date.getDate() + 1);
            }
            const dateKey = formatLocalDateKey(date);
            const entry = dataMap.get(dateKey);
            const count = entry ? entry.total : 0;

            let level = 0;
            if (count > 0) {
                if (count === 1) level = 1;
                else if (count <= 2) level = 2;
                else if (count <= 4) level = 3;
                else level = 4;
            }

            const dayData: ActivityDayData = {
                date: new Date(date),
                dateKey,
                count,
                level,
                recipesCount: entry?.recipesCount || 0,
                cooksnapsCount: entry?.cooksnapsCount || 0,
                reviewsCount: entry?.reviewsCount || 0,
                commentsCount: entry?.commentsCount || 0,
                challengesCount: entry?.challengesCount || 0,
            };

            if (i % 7 === 0) {
                weeksArray.push([]);
            }
            weeksArray[weeksArray.length - 1].push(dayData);
        }

        return { weeks: weeksArray, totalActivities: overallTotal };
    }, [recipes, comments, challengeSubmissions, activities]);

    const monthLabels = useMemo(() => {
        const labels: Array<{ weekIndex: number; month: string }> = [];
        let lastMonth = '';

        weeks.forEach((week, weekIndex) => {
            const firstDay = week[0]?.date;
            if (firstDay) {
                const month = formatDateLanguage(firstDay, 'MMM', language);
                if (month !== lastMonth) {
                    labels.push({ weekIndex, month });
                    lastMonth = month;
                }
            }
        });

        return labels;
    }, [weeks, language]);

    return { weeks, monthLabels, totalActivities };
};

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
    recipes = [],
    comments = [],
    challengeSubmissions = [],
    activities = [],
    title,
    showTitle = true,
}) => {
    const { t, i18n } = useTranslation();
    const [hoveredDay, setHoveredDay] = useState<ActivityDayData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { weeks, monthLabels, totalActivities } = useActivityCalendar(
        recipes,
        comments,
        challengeSubmissions,
        activities,
        i18n.language
    );

    const dayLabels = [
        t('day_sun') || 'Sun',
        t('day_mon') || 'Mon',
        t('day_tue') || 'Tue',
        t('day_wed') || 'Wed',
        t('day_thu') || 'Thu',
        t('day_fri') || 'Fri',
        t('day_sat') || 'Sat',
    ];

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            el.scrollLeft = el.scrollWidth;
        }
    }, [weeks]);

    const showTooltip = (day: ActivityDayData, target: HTMLElement) => {
        setHoveredDay(day);
        const rect = target.getBoundingClientRect();
        const tooltipX = Math.max(
            80,
            Math.min(
                (typeof window !== 'undefined' ? window.innerWidth : 800) - 80,
                rect.left + rect.width / 2
            )
        );
        const tooltipY = Math.max(40, rect.top - 10);
        setTooltipPosition({ x: tooltipX, y: tooltipY });
    };

    const handleSelectDay = (day: ActivityDayData, target: HTMLElement) => {
        if (hoveredDay && hoveredDay.dateKey === day.dateKey) {
            setHoveredDay(null);
            setTooltipPosition(null);
        } else {
            showTooltip(day, target);
        }
    };

    const formatDate = (date: Date) =>
        formatDateLanguage(date, 'MMM d, yyyy', i18n.language);

    if (totalActivities === 0) {
        return null;
    }

    const displayTitle =
        title ||
        t('culinary_activity_graph') ||
        t('recipe_contribution_graph') ||
        'Culinary Activity Graph';

    return (
        <Container>
            <div
                className="w-full py-4"
                data-testid="activity-heatmap"
                data-cy="activity-heatmap"
            >
                {showTitle && (
                    <h2 className="mb-4 px-2 text-lg font-semibold sm:text-xl dark:text-neutral-100">
                        {displayTitle}
                    </h2>
                )}
                <div className="flex justify-center">
                    <div
                        ref={scrollContainerRef}
                        className="w-full max-w-4xl overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
                    >
                        <div className="relative inline-flex min-w-[600px] flex-col">
                            {/* Month labels */}
                            <div className="mb-2 flex min-w-[600px] gap-0.5 sm:gap-1">
                                <div className="dark:bg-dark sticky left-0 z-10 w-6 shrink-0 bg-white sm:w-7" />
                                <div className="flex gap-0.5 sm:gap-1">
                                    {weeks.map((week, weekIndex) => {
                                        const monthLabel = monthLabels.find(
                                            (label) =>
                                                label.weekIndex === weekIndex
                                        );
                                        return (
                                            <div
                                                key={week[0].dateKey}
                                                className="flex w-2.5 shrink-0 items-start justify-start sm:w-3"
                                            >
                                                {monthLabel && (
                                                    <span className="text-[10px] whitespace-nowrap text-neutral-500 sm:text-xs dark:text-neutral-400">
                                                        {monthLabel.month}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Days grid */}
                            <div className="flex gap-0.5 sm:gap-1">
                                <div className="dark:bg-dark sticky left-0 z-10 flex flex-col gap-0.5 bg-white pr-1.5 sm:gap-1 sm:pr-2">
                                    {dayLabels.map((label, index) => (
                                        <div
                                            key={label}
                                            className="flex h-2.5 items-center justify-end text-[9px] text-neutral-500 sm:h-3 sm:text-xs dark:text-neutral-400"
                                        >
                                            {index % 2 === 0 && (
                                                <span className="text-[8px] sm:text-[10px]">
                                                    {label}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-0.5 sm:gap-1">
                                    {weeks.map((week) => (
                                        <div
                                            key={week[0].dateKey}
                                            data-testid="week-column"
                                            className="flex shrink-0 flex-col gap-0.5 sm:gap-1"
                                        >
                                            {week.map((day) => {
                                                const titleAttr =
                                                    day.count > 0
                                                        ? `${formatDate(day.date)}: ${day.count} ${day.count === 1 ? t('culinary_activity') || 'activity' : t('culinary_activities') || 'activities'}`
                                                        : formatDate(day.date);

                                                return (
                                                    <button
                                                        key={day.dateKey}
                                                        type="button"
                                                        data-testid="activity-heatmap-cell"
                                                        data-date={day.dateKey}
                                                        data-level={day.level}
                                                        data-count={day.count}
                                                        className={`aspect-square size-2.5 shrink-0 rounded-xs transition-colors sm:size-3 sm:rounded-sm ${getActivityDayColor(
                                                            day.level
                                                        )} ${
                                                            day.count > 0
                                                                ? 'hover:ring-green-450/50 cursor-pointer hover:ring-2'
                                                                : 'cursor-pointer hover:ring-1 hover:ring-neutral-400/30'
                                                        }`}
                                                        onClick={(e) =>
                                                            handleSelectDay(
                                                                day,
                                                                e.currentTarget
                                                            )
                                                        }
                                                        onMouseEnter={(e) =>
                                                            showTooltip(
                                                                day,
                                                                e.currentTarget
                                                            )
                                                        }
                                                        onMouseLeave={() => {
                                                            setHoveredDay(null);
                                                            setTooltipPosition(
                                                                null
                                                            );
                                                        }}
                                                        title={titleAttr}
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

                            {/* Tooltip */}
                            {hoveredDay &&
                                tooltipPosition &&
                                hoveredDay.count > 0 && (
                                    <div
                                        data-testid="activity-heatmap-tooltip"
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
                                                ? t('culinary_activity') ||
                                                  'culinary activity'
                                                : t('culinary_activities') ||
                                                  'culinary activities'}{' '}
                                            {t('on') || 'on'}{' '}
                                            {formatDate(hoveredDay.date)}
                                        </div>
                                        {(hoveredDay.recipesCount > 0 ||
                                            hoveredDay.cooksnapsCount > 0 ||
                                            hoveredDay.reviewsCount > 0 ||
                                            hoveredDay.challengesCount > 0) && (
                                            <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-neutral-300">
                                                {hoveredDay.recipesCount >
                                                    0 && (
                                                    <div>
                                                        {
                                                            hoveredDay.recipesCount
                                                        }{' '}
                                                        {hoveredDay.recipesCount ===
                                                        1
                                                            ? t('recipe') ||
                                                              'recipe'
                                                            : t('recipes') ||
                                                              'recipes'}
                                                    </div>
                                                )}
                                                {hoveredDay.cooksnapsCount >
                                                    0 && (
                                                    <div>
                                                        {
                                                            hoveredDay.cooksnapsCount
                                                        }{' '}
                                                        {hoveredDay.cooksnapsCount ===
                                                        1
                                                            ? t('cooksnap') ||
                                                              'cooksnap'
                                                            : t('cooksnaps') ||
                                                              'cooksnaps'}
                                                    </div>
                                                )}
                                                {hoveredDay.reviewsCount >
                                                    0 && (
                                                    <div>
                                                        {
                                                            hoveredDay.reviewsCount
                                                        }{' '}
                                                        {hoveredDay.reviewsCount ===
                                                        1
                                                            ? t('review') ||
                                                              'review'
                                                            : t('reviews') ||
                                                              'reviews'}
                                                    </div>
                                                )}
                                                {hoveredDay.challengesCount >
                                                    0 && (
                                                    <div>
                                                        {
                                                            hoveredDay.challengesCount
                                                        }{' '}
                                                        {hoveredDay.challengesCount ===
                                                        1
                                                            ? t(
                                                                  'challenge_submission'
                                                              ) ||
                                                              'challenge submission'
                                                            : t(
                                                                  'challenge_submissions'
                                                              ) ||
                                                              'challenge submissions'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* Legend */}
                            <div
                                data-testid="activity-heatmap-legend"
                                className="mt-4 flex flex-wrap items-center justify-end gap-2 px-2 text-[10px] text-neutral-500 sm:gap-4 sm:text-xs dark:text-neutral-400"
                            >
                                <span>{t('less') || 'Less'}</span>
                                <div className="flex gap-0.5 sm:gap-1">
                                    <div className="size-2.5 shrink-0 rounded-xs bg-neutral-100 sm:size-3 sm:rounded-sm dark:bg-neutral-800" />
                                    <div className="bg-green-450/30 dark:bg-green-450/20 size-2.5 shrink-0 rounded-xs sm:size-3 sm:rounded-sm" />
                                    <div className="bg-green-450/50 dark:bg-green-450/40 size-2.5 shrink-0 rounded-xs sm:size-3 sm:rounded-sm" />
                                    <div className="bg-green-450/70 dark:bg-green-450/60 size-2.5 shrink-0 rounded-xs sm:size-3 sm:rounded-sm" />
                                    <div className="bg-green-450 dark:bg-green-450 size-2.5 shrink-0 rounded-xs sm:size-3 sm:rounded-sm" />
                                </div>
                                <span>{t('more') || 'More'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default ActivityHeatmap;
