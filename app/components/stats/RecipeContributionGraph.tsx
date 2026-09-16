'use client';

import { useTranslation } from 'react-i18next';
import { useState, useMemo, useRef, useEffect } from 'react';
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

const useContributionCalendar = (
    recipes: Array<{ id: string; createdAt: string }>,
    language: string
) => {
    const { weeks } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const recipeMap = new Map<string, number>();

        recipes.forEach((recipe) => {
            const recipeDate = new Date(recipe.createdAt);
            recipeDate.setHours(0, 0, 0, 0);
            const dateKey = recipeDate.toISOString().split('T')[0];
            recipeMap.set(dateKey, (recipeMap.get(dateKey) || 0) + 1);
        });

        const todayDayOfWeek = today.getDay();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - todayDayOfWeek - 52 * 7);

        const weeksArray: DayData[][] = [];
        const date = new Date(startDate);
        for (let i = 0; i < 371; i++) {
            if (i > 0) {
                date.setDate(date.getDate() + 1);
            }
            const dateKey = date.toISOString().split('T')[0];
            const count = recipeMap.get(dateKey) || 0;

            let level = 0;
            if (count > 0) {
                if (count === 1) level = 1;
                else if (count === 2) level = 2;
                else if (count === 3) level = 3;
                else level = 4;
            }

            const dayData: DayData = {
                date: new Date(date),
                count,
                level,
            };

            if (i % 7 === 0) {
                weeksArray.push([]);
            }
            weeksArray[weeksArray.length - 1].push(dayData);
        }

        return { weeks: weeksArray };
    }, [recipes]);

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

    return { weeks, monthLabels };
};

interface ContributionCellProps {
    day: DayData;
    onSelect: (day: DayData, element: HTMLElement) => void;
    onHover: (day: DayData, element: HTMLElement) => void;
    onLeave: () => void;
    formatDate: (date: Date) => string;
    t: (key: string) => string;
}

const ContributionCell: React.FC<ContributionCellProps> = ({
    day,
    onSelect,
    onHover,
    onLeave,
    formatDate,
    t,
}) => {
    const title =
        day.count > 0
            ? `${formatDate(day.date)}: ${day.count} ${day.count === 1 ? t('recipe') : t('recipes')}`
            : formatDate(day.date);

    return (
        <button
            type="button"
            className={`aspect-square size-2.5 shrink-0 rounded-xs transition-colors sm:size-3 sm:rounded-sm ${getDayColor(
                day.level
            )} ${
                day.count > 0
                    ? 'hover:ring-green-450/50 cursor-pointer hover:ring-2'
                    : 'cursor-pointer hover:ring-1 hover:ring-neutral-400/30'
            }`}
            onClick={(e) => onSelect(day, e.currentTarget)}
            onMouseEnter={(e) => onHover(day, e.currentTarget)}
            onMouseLeave={onLeave}
            title={title}
            aria-label={formatDate(day.date)}
        />
    );
};

interface ContributionMonthLabelsProps {
    weeks: DayData[][];
    monthLabels: Array<{ weekIndex: number; month: string }>;
}

const ContributionMonthLabels: React.FC<ContributionMonthLabelsProps> = ({
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
                        key={week[0].date.toISOString()}
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

interface ContributionDayLabelsProps {
    dayLabels: string[];
}

const ContributionDayLabels: React.FC<ContributionDayLabelsProps> = ({
    dayLabels,
}) => (
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

interface ContributionTooltipProps {
    hoveredDay: DayData | null;
    tooltipPosition: { x: number; y: number } | null;
    formatDate: (date: Date) => string;
    t: (key: string) => string;
}

const ContributionTooltip: React.FC<ContributionTooltipProps> = ({
    hoveredDay,
    tooltipPosition,
    formatDate,
    t,
}) => {
    if (!hoveredDay || !tooltipPosition || hoveredDay.count === 0) {
        return null;
    }

    return (
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
                {hoveredDay.count === 1 ? t('recipe') : t('recipes')} {t('on')}{' '}
                {formatDate(hoveredDay.date)}
            </div>
        </div>
    );
};

interface ContributionLegendProps {
    t: (key: string) => string;
}

const ContributionLegend: React.FC<ContributionLegendProps> = ({ t }) => (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 px-2 text-[10px] text-neutral-500 sm:gap-4 sm:text-xs dark:text-neutral-400">
        <span>{t('less')}</span>
        <div className="flex gap-0.5 sm:gap-1">
            <div className="size-2.5 shrink-0 rounded-xs bg-neutral-100 sm:size-3 sm:rounded-sm dark:bg-neutral-800" />
            <div className="bg-green-450/30 dark:bg-green-450/20 size-2.5 shrink-0 rounded-xs sm:size-3 sm:rounded-sm" />
            <div className="bg-green-450/50 dark:bg-green-450/40 size-2.5 shrink-0 rounded-xs sm:size-3 sm:rounded-sm" />
            <div className="bg-green-450/70 dark:bg-green-450/60 size-2.5 shrink-0 rounded-xs sm:size-3 sm:rounded-sm" />
            <div className="bg-green-450 dark:bg-green-450 size-2.5 shrink-0 rounded-xs sm:size-3 sm:rounded-sm" />
        </div>
        <span>{t('more')}</span>
    </div>
);

const RecipeContributionGraph: React.FC<RecipeContributionGraphProps> = ({
    recipes,
}) => {
    const { t, i18n } = useTranslation();
    const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { weeks, monthLabels } = useContributionCalendar(
        recipes,
        i18n.language
    );

    const dayLabels = [
        t('day_sun'),
        t('day_mon'),
        t('day_tue'),
        t('day_wed'),
        t('day_thu'),
        t('day_fri'),
        t('day_sat'),
    ];

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            el.scrollLeft = el.scrollWidth;
        }
    }, [weeks]);

    const showTooltip = (day: DayData, target: HTMLElement) => {
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

    const handleSelectDay = (day: DayData, target: HTMLElement) => {
        if (hoveredDay && hoveredDay.date.getTime() === day.date.getTime()) {
            setHoveredDay(null);
            setTooltipPosition(null);
        } else {
            showTooltip(day, target);
        }
    };

    const formatDate = (date: Date) =>
        formatDateLanguage(date, 'MMM d, yyyy', i18n.language);

    if (recipes.length === 0) return null;

    return (
        <Container>
            <div className="w-full py-4">
                <h2 className="mb-4 px-2 text-lg font-semibold sm:text-xl dark:text-neutral-100">
                    {t('recipe_contribution_graph')}
                </h2>
                <div className="flex justify-center">
                    <div
                        ref={scrollContainerRef}
                        className="w-full max-w-4xl overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
                    >
                        <div className="relative inline-flex min-w-[600px] flex-col">
                            <ContributionMonthLabels
                                weeks={weeks}
                                monthLabels={monthLabels}
                            />

                            <div className="flex gap-0.5 sm:gap-1">
                                <ContributionDayLabels dayLabels={dayLabels} />

                                <div className="flex gap-0.5 sm:gap-1">
                                    {weeks.map((week) => (
                                        <div
                                            key={week[0].date.toISOString()}
                                            data-testid="week-column"
                                            className="flex shrink-0 flex-col gap-0.5 sm:gap-1"
                                        >
                                            {week.map((day) => (
                                                <ContributionCell
                                                    key={day.date.toISOString()}
                                                    day={day}
                                                    onSelect={handleSelectDay}
                                                    onHover={showTooltip}
                                                    onLeave={() => {
                                                        setHoveredDay(null);
                                                        setTooltipPosition(
                                                            null
                                                        );
                                                    }}
                                                    formatDate={formatDate}
                                                    t={t}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <ContributionTooltip
                                hoveredDay={hoveredDay}
                                tooltipPosition={tooltipPosition}
                                formatDate={formatDate}
                                t={t}
                            />

                            <ContributionLegend t={t} />
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeContributionGraph;
