'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@/app/components/utils/Container';
import { formatDateLanguage } from '@/app/utils/date-utils';
import {
    getActivityDayColor,
    useActivityCalendar,
    ActivityHeatmapProps,
    ActivityDayData,
    HeatmapRecipe,
    ActivityItem,
} from '@/app/utils/activityHeatmapUtils';

export type {
    ActivityItem,
    HeatmapRecipe,
    ActivityHeatmapProps,
    ActivityDayData,
} from '@/app/utils/activityHeatmapUtils';

const EMPTY_RECIPES: HeatmapRecipe[] = [];
const EMPTY_COMMENTS: NonNullable<ActivityHeatmapProps['comments']> = [];
const EMPTY_CHALLENGES: NonNullable<
    ActivityHeatmapProps['challengeSubmissions']
> = [];
const EMPTY_ACTIVITIES: ActivityItem[] = [];

interface BreakdownItemProps {
    count: number;
    singularKey: string;
    pluralKey: string;
    singularFallback: string;
    pluralFallback: string;
}

const TooltipBreakdownItem: React.FC<BreakdownItemProps> = ({
    count,
    singularKey,
    pluralKey,
    singularFallback,
    pluralFallback,
}) => {
    const { t } = useTranslation();
    if (count <= 0) return null;

    const label =
        count === 1
            ? t(singularKey) || singularFallback
            : t(pluralKey) || pluralFallback;

    return (
        <div>
            {count} {label}
        </div>
    );
};

interface BreakdownProps {
    day: ActivityDayData;
}

const ActivityHeatmapBreakdown: React.FC<BreakdownProps> = ({ day }) => {
    const hasDetails =
        day.recipesCount > 0 ||
        day.cooksnapsCount > 0 ||
        day.reviewsCount > 0 ||
        day.challengesCount > 0;

    if (!hasDetails) return null;

    return (
        <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-neutral-300">
            <TooltipBreakdownItem
                count={day.recipesCount}
                singularKey="recipe"
                pluralKey="recipes"
                singularFallback="recipe"
                pluralFallback="recipes"
            />
            <TooltipBreakdownItem
                count={day.cooksnapsCount}
                singularKey="cooksnap"
                pluralKey="cooksnaps"
                singularFallback="cooksnap"
                pluralFallback="cooksnaps"
            />
            <TooltipBreakdownItem
                count={day.reviewsCount}
                singularKey="review"
                pluralKey="reviews"
                singularFallback="review"
                pluralFallback="reviews"
            />
            <TooltipBreakdownItem
                count={day.challengesCount}
                singularKey="challenge_submission"
                pluralKey="challenge_submissions"
                singularFallback="challenge submission"
                pluralFallback="challenge submissions"
            />
        </div>
    );
};

interface TooltipProps {
    hoveredDay: ActivityDayData | null;
    tooltipPosition: { x: number; y: number } | null;
    formatDate: (date: Date) => string;
}

const ActivityHeatmapTooltip: React.FC<TooltipProps> = ({
    hoveredDay,
    tooltipPosition,
    formatDate,
}) => {
    const { t } = useTranslation();
    if (!hoveredDay || !tooltipPosition || hoveredDay.count === 0) {
        return null;
    }

    const activityUnit =
        hoveredDay.count === 1
            ? t('culinary_activity') || 'culinary activity'
            : t('culinary_activities') || 'culinary activities';

    return (
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
                {hoveredDay.count} {activityUnit} {t('on') || 'on'}{' '}
                {formatDate(hoveredDay.date)}
            </div>
            <ActivityHeatmapBreakdown day={hoveredDay} />
        </div>
    );
};

const ActivityHeatmapLegend: React.FC = () => {
    const { t } = useTranslation();
    return (
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
    );
};

interface MonthLabelsRowProps {
    weeks: ActivityDayData[][];
    monthLabels: Array<{ weekIndex: number; month: string }>;
}

const MonthLabelsRow: React.FC<MonthLabelsRowProps> = ({
    weeks,
    monthLabels,
}) => (
    <div className="mb-2 flex min-w-[600px] gap-0.5 sm:gap-1">
        <div className="dark:bg-dark sticky left-0 z-10 w-6 shrink-0 bg-white sm:w-7" />
        <div className="flex gap-0.5 sm:gap-1">
            {weeks.map((week, weekIndex) => {
                const monthLabel = monthLabels.find(
                    (label) => label.weekIndex === weekIndex
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
);

interface DayLabelsColProps {
    dayLabels: string[];
}

const DayLabelsCol: React.FC<DayLabelsColProps> = ({ dayLabels }) => (
    <div className="dark:bg-dark sticky left-0 z-10 flex flex-col gap-0.5 bg-white pr-1.5 sm:gap-1 sm:pr-2">
        {dayLabels.map((label, index) => (
            <div
                key={label}
                className="flex h-2.5 items-center justify-end text-[9px] text-neutral-500 sm:h-3 sm:text-xs dark:text-neutral-400"
            >
                {index % 2 === 0 && (
                    <span className="text-[8px] sm:text-[10px]">{label}</span>
                )}
            </div>
        ))}
    </div>
);

interface CellProps {
    day: ActivityDayData;
    formatDate: (date: Date) => string;
    onSelectDay: (day: ActivityDayData, target: HTMLElement) => void;
    onHoverDay: (day: ActivityDayData, target: HTMLElement) => void;
    onLeaveDay: () => void;
}

const ActivityHeatmapCell: React.FC<CellProps> = ({
    day,
    formatDate,
    onSelectDay,
    onHoverDay,
    onLeaveDay,
}) => {
    const { t } = useTranslation();
    const countUnit =
        day.count === 1
            ? t('culinary_activity') || 'activity'
            : t('culinary_activities') || 'activities';

    const titleAttr =
        day.count > 0
            ? `${formatDate(day.date)}: ${day.count} ${countUnit}`
            : formatDate(day.date);

    const interactiveClass =
        day.count > 0
            ? 'hover:ring-green-450/50 cursor-pointer hover:ring-2'
            : 'cursor-pointer hover:ring-1 hover:ring-neutral-400/30';

    return (
        <button
            type="button"
            data-testid="activity-heatmap-cell"
            data-date={day.dateKey}
            data-level={day.level}
            data-count={day.count}
            className={`aspect-square size-2.5 shrink-0 rounded-xs transition-colors sm:size-3 sm:rounded-sm ${getActivityDayColor(
                day.level
            )} ${interactiveClass}`}
            onClick={(e) => onSelectDay(day, e.currentTarget)}
            onMouseEnter={(e) => onHoverDay(day, e.currentTarget)}
            onMouseLeave={onLeaveDay}
            title={titleAttr}
            aria-label={formatDate(day.date)}
        />
    );
};

interface GridProps {
    weeks: ActivityDayData[][];
    monthLabels: Array<{ weekIndex: number; month: string }>;
    dayLabels: string[];
    formatDate: (date: Date) => string;
    onSelectDay: (day: ActivityDayData, target: HTMLElement) => void;
    onHoverDay: (day: ActivityDayData, target: HTMLElement) => void;
    onLeaveDay: () => void;
    scrollRef: React.RefObject<HTMLDivElement | null>;
}

const ActivityHeatmapGrid: React.FC<GridProps> = ({
    weeks,
    monthLabels,
    dayLabels,
    formatDate,
    onSelectDay,
    onHoverDay,
    onLeaveDay,
    scrollRef,
}) => (
    <div className="flex justify-center">
        <div
            ref={scrollRef}
            className="w-full max-w-4xl overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
        >
            <div className="relative inline-flex min-w-[600px] flex-col">
                <MonthLabelsRow
                    weeks={weeks}
                    monthLabels={monthLabels}
                />

                <div className="flex gap-0.5 sm:gap-1">
                    <DayLabelsCol dayLabels={dayLabels} />

                    <div className="flex gap-0.5 sm:gap-1">
                        {weeks.map((week) => (
                            <div
                                key={week[0].dateKey}
                                data-testid="week-column"
                                className="flex shrink-0 flex-col gap-0.5 sm:gap-1"
                            >
                                {week.map((day) => (
                                    <ActivityHeatmapCell
                                        key={day.dateKey}
                                        day={day}
                                        formatDate={formatDate}
                                        onSelectDay={onSelectDay}
                                        onHoverDay={onHoverDay}
                                        onLeaveDay={onLeaveDay}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <ActivityHeatmapLegend />
            </div>
        </div>
    </div>
);

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
    recipes = EMPTY_RECIPES,
    comments = EMPTY_COMMENTS,
    challengeSubmissions = EMPTY_CHALLENGES,
    activities = EMPTY_ACTIVITIES,
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

    const handleLeaveDay = () => {
        setHoveredDay(null);
        setTooltipPosition(null);
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
                <ActivityHeatmapGrid
                    weeks={weeks}
                    monthLabels={monthLabels}
                    dayLabels={dayLabels}
                    formatDate={formatDate}
                    onSelectDay={handleSelectDay}
                    onHoverDay={showTooltip}
                    onLeaveDay={handleLeaveDay}
                    scrollRef={scrollContainerRef}
                />
                <ActivityHeatmapTooltip
                    hoveredDay={hoveredDay}
                    tooltipPosition={tooltipPosition}
                    formatDate={formatDate}
                />
            </div>
        </Container>
    );
};

export default ActivityHeatmap;
