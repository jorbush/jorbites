'use client';

import { useTranslation } from 'react-i18next';
import { useState, useMemo, useRef } from 'react';
import Container from '@/app/components/utils/Container';
import { formatDateLanguage } from '@/app/utils/date-utils';

interface RecipeContributionGraphProps {
    recipes: Array<{ id: string; createdAt: string }>;
}

interface DayData {
    date: Date;
    count: number;
    level: number; // 0-4
}

/** Tailwind colour classes per intensity level */
const LEVEL_CLASSES = [
    'bg-neutral-100 dark:bg-neutral-800',
    'bg-green-450/30 dark:bg-green-450/20',
    'bg-green-450/50 dark:bg-green-450/40',
    'bg-green-450/70 dark:bg-green-450/60',
    'bg-green-450   dark:bg-green-450',
] as const;

const getDayColor = (level: number) =>
    LEVEL_CLASSES[level as 0 | 1 | 2 | 3 | 4] ?? LEVEL_CLASSES[0];

const RecipeContributionGraph: React.FC<RecipeContributionGraphProps> = ({
    recipes,
}) => {
    const { t, i18n } = useTranslation();
    const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
    const [tooltipAnchor, setTooltipAnchor] = useState<{
        cellLeft: number;
        cellTop: number;
    } | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // ── Build week grid ──────────────────────────────────────────────────────
    const { weeks } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const recipeMap = new Map<string, number>();
        recipes.forEach((recipe) => {
            const d = new Date(recipe.createdAt);
            d.setHours(0, 0, 0, 0);
            const key = d.toISOString().split('T')[0];
            recipeMap.set(key, (recipeMap.get(key) || 0) + 1);
        });

        // Start from the Sunday of the week 52 weeks ago
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - today.getDay() - 52 * 7);

        const weeksArray: DayData[][] = [];
        const date = new Date(startDate);

        for (let i = 0; i < 371; i++) {
            if (i > 0) date.setDate(date.getDate() + 1);
            const key = date.toISOString().split('T')[0];
            const count = recipeMap.get(key) || 0;
            let level = 0;
            if (count === 1) level = 1;
            else if (count === 2) level = 2;
            else if (count === 3) level = 3;
            else if (count >= 4) level = 4;

            if (i % 7 === 0) weeksArray.push([]);
            weeksArray[weeksArray.length - 1].push({
                date: new Date(date),
                count,
                level,
            });
        }

        return { weeks: weeksArray };
    }, [recipes]);

    // ── Month labels ─────────────────────────────────────────────────────────
    const monthLabels = useMemo(() => {
        const labels: Array<{ weekIndex: number; month: string }> = [];
        let lastMonth = '';
        weeks.forEach((week, weekIndex) => {
            const firstDay = week[0]?.date;
            if (!firstDay) return;
            const month = formatDateLanguage(firstDay, 'MMM', i18n.language);
            if (month !== lastMonth) {
                labels.push({ weekIndex, month });
                lastMonth = month;
            }
        });
        return labels;
    }, [weeks, i18n.language]);

    // ── Day-of-week labels ───────────────────────────────────────────────────
    const dayLabels = [
        t('day_sun'),
        t('day_mon'),
        t('day_tue'),
        t('day_wed'),
        t('day_thu'),
        t('day_fri'),
        t('day_sat'),
    ];

    // ── Tooltip helpers ──────────────────────────────────────────────────────
    const formatDate = (date: Date) =>
        formatDateLanguage(date, 'MMM d, yyyy', i18n.language);

    const handleDayEnter = (
        day: DayData,
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        if (day.count === 0) return;
        const cell = e.currentTarget.getBoundingClientRect();
        const grid = gridRef.current?.getBoundingClientRect();
        if (!grid) return;
        setHoveredDay(day);
        setTooltipAnchor({
            cellLeft: cell.left - grid.left + cell.width / 2,
            cellTop: cell.top - grid.top,
        });
    };

    const handleDayLeave = () => {
        setHoveredDay(null);
        setTooltipAnchor(null);
    };

    if (recipes.length === 0) return null;

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <Container>
            <div className="w-full py-4">
                <h2 className="mb-4 px-2 text-lg font-semibold sm:text-xl dark:text-neutral-100">
                    {t('recipe_contribution_graph')}
                </h2>

                {/* Scrollable outer wrapper */}
                <div className="scrollbar-hide w-full overflow-x-auto">
                    {/*
                     * Inner wrapper:
                     *   --cell: size of each square
                     *   --gap:  gap between squares
                     * These two values drive everything so nothing misaligns.
                     */}
                    <div
                        ref={gridRef}
                        className="relative inline-flex flex-col"
                        style={
                            {
                                '--cell': '11px',
                                '--gap': '3px',
                            } as React.CSSProperties
                        }
                    >
                        {/* Month labels row */}
                        <div className="mb-1 flex">
                            {/* Spacer matching the day-label column */}
                            <div
                                className="shrink-0"
                                style={{ width: 26 }}
                            />
                            {/* One cell-sized slot per week */}
                            <div
                                className="flex"
                                style={{ gap: 'var(--gap)' }}
                            >
                                {weeks.map((week, wi) => {
                                    const label = monthLabels.find(
                                        (l) => l.weekIndex === wi
                                    );
                                    return (
                                        <div
                                            key={week[0].date.toISOString()}
                                            className="flex shrink-0 items-start overflow-visible"
                                            style={{
                                                width: 'var(--cell)',
                                            }}
                                        >
                                            {label && (
                                                <span className="text-[10px] leading-none whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                                                    {label.month}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Grid + day labels */}
                        <div
                            className="flex"
                            style={{ gap: 'var(--gap)' }}
                        >
                            {/* Day-of-week labels column */}
                            <div
                                className="flex shrink-0 flex-col"
                                style={{ gap: 'var(--gap)', width: 26 }}
                            >
                                {dayLabels.map((label, idx) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-end pr-1"
                                        style={{ height: 'var(--cell)' }}
                                    >
                                        {idx % 2 !== 0 && (
                                            <span className="text-[9px] leading-none text-neutral-500 dark:text-neutral-400">
                                                {label}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Week columns */}
                            <div
                                className="flex"
                                style={{ gap: 'var(--gap)' }}
                            >
                                {weeks.map((week) => (
                                    <div
                                        key={week[0].date.toISOString()}
                                        className="flex flex-col"
                                        style={{ gap: 'var(--gap)' }}
                                    >
                                        {week.map((day) => (
                                            <div
                                                key={day.date.toISOString()}
                                                className={[
                                                    'shrink-0 rounded-sm transition-all duration-150',
                                                    getDayColor(day.level),
                                                    day.count > 0
                                                        ? 'hover:ring-green-450/60 cursor-pointer hover:ring-2 hover:ring-offset-0 hover:brightness-110'
                                                        : '',
                                                ].join(' ')}
                                                style={{
                                                    width: 'var(--cell)',
                                                    height: 'var(--cell)',
                                                }}
                                                onMouseEnter={(e) =>
                                                    handleDayEnter(day, e)
                                                }
                                                onMouseLeave={handleDayLeave}
                                                aria-label={
                                                    day.count > 0
                                                        ? `${formatDate(day.date)}: ${day.count} ${day.count === 1 ? t('recipe') : t('recipes')}`
                                                        : formatDate(day.date)
                                                }
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tooltip — positioned relative to the grid wrapper */}
                        {hoveredDay && tooltipAnchor && (
                            <div
                                className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white shadow-xl dark:bg-neutral-950"
                                style={{
                                    left: tooltipAnchor.cellLeft,
                                    top: tooltipAnchor.cellTop - 8,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span className="font-semibold">
                                    {hoveredDay.count}{' '}
                                    {hoveredDay.count === 1
                                        ? t('recipe')
                                        : t('recipes')}
                                </span>{' '}
                                {t('on')} {formatDate(hoveredDay.date)}
                            </div>
                        )}

                        {/* Legend */}
                        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
                            <span>{t('less')}</span>
                            <div
                                className="flex"
                                style={{ gap: 'var(--gap)' }}
                            >
                                {LEVEL_CLASSES.map((cls, i) => (
                                    <div
                                        key={i}
                                        className={`shrink-0 rounded-sm ${cls}`}
                                        style={{
                                            width: 'var(--cell)',
                                            height: 'var(--cell)',
                                        }}
                                    />
                                ))}
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
