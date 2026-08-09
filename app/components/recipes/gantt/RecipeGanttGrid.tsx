'use client';

import React from 'react';
import { GanttRow, GanttColumn } from '@/app/types';

const GROUP_BACKGROUNDS = [
    'bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200',
    'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200',
    'bg-sky-500/10 dark:bg-sky-500/20 text-sky-900 dark:text-sky-200',
    'bg-purple-500/10 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200',
    'bg-rose-500/10 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200',
];

interface RecipeGanttGridProps {
    rows: GanttRow[];
    totalCols: number;
    cellMap: Array<Array<GanttColumn | 'spanned' | null>>;
    tableLabel: string;
}

export const RecipeGanttGrid: React.FC<RecipeGanttGridProps> = ({
    rows,
    totalCols,
    cellMap,
    tableLabel,
}) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table
                className="w-full border-collapse text-left text-sm"
                aria-label={tableLabel}
            >
                <tbody>
                    {rows.map((row, rIdx) => {
                        const rawGroup =
                            typeof row?.group === 'number' && !isNaN(row.group)
                                ? row.group
                                : 0;
                        const groupIndex = Math.abs(rawGroup);
                        const bgClass =
                            GROUP_BACKGROUNDS[
                                groupIndex % GROUP_BACKGROUNDS.length
                            ];

                        return (
                            <tr
                                key={`row-${row.ingredient}-${rIdx}`}
                                className="border-b border-neutral-200 last:border-b-0 dark:border-neutral-800"
                            >
                                <th
                                    scope="row"
                                    className="min-w-[160px] border-r border-neutral-200 bg-neutral-50 p-3 font-medium whitespace-nowrap text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                                >
                                    {row.ingredient}
                                </th>
                                {Array.from({ length: totalCols }).map(
                                    (_, cIdx) => {
                                        const cell = cellMap[rIdx][cIdx];
                                        if (cell === 'spanned') {
                                            return null;
                                        }
                                        if (cell) {
                                            const rawStart = Math.max(
                                                0,
                                                Math.min(
                                                    cell.rowSpan[0],
                                                    rows.length - 1
                                                )
                                            );
                                            const rawEnd = Math.max(
                                                rawStart,
                                                Math.min(
                                                    cell.rowSpan[1],
                                                    rows.length - 1
                                                )
                                            );
                                            const spanCount =
                                                rawEnd - rawStart + 1;

                                            return (
                                                <td
                                                    key={`cell-${row.ingredient}-${cIdx}`}
                                                    rowSpan={spanCount}
                                                    className={`border border-neutral-200 p-3 text-center align-middle font-medium dark:border-neutral-800 ${bgClass}`}
                                                >
                                                    {cell.action}
                                                </td>
                                            );
                                        }
                                        return (
                                            <td
                                                key={`empty-${row.ingredient}-${cIdx}`}
                                                className="border border-neutral-200 bg-transparent p-3 dark:border-neutral-800"
                                                aria-label="Empty"
                                            />
                                        );
                                    }
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default RecipeGanttGrid;
