'use client';

import React from 'react';
import { GanttTable } from '@/app/types';
import { useTranslation } from 'react-i18next';
import useIsMounted from '@/app/hooks/useIsMounted';

interface RecipeGanttTableProps {
    ganttTable?: GanttTable | null;
}

const GROUP_BACKGROUNDS = [
    'bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200',
    'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200',
    'bg-sky-500/10 dark:bg-sky-500/20 text-sky-900 dark:text-sky-200',
    'bg-purple-500/10 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200',
    'bg-rose-500/10 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200',
];

export const RecipeGanttTable: React.FC<RecipeGanttTableProps> = ({
    ganttTable,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();

    if (
        !ganttTable ||
        !Array.isArray(ganttTable.rows) ||
        ganttTable.rows.length === 0 ||
        !Array.isArray(ganttTable.columns)
    ) {
        return null;
    }

    const { preSteps = [], rows = [], columns = [] } = ganttTable;

    // Find total column count (guarding against invalid/negative colIndex)
    const maxColIndex = columns.reduce((max, col) => {
        if (typeof col?.colIndex === 'number' && col.colIndex >= 0) {
            return Math.max(max, col.colIndex);
        }
        return max;
    }, -1);

    const totalCols = maxColIndex + 1;

    // Build grid matrix of action cells for HTML <table>
    // cellMap[rowIndex][colIndex] = column object or 'spanned'
    const cellMap: Array<Array<(typeof columns)[0] | 'spanned' | null>> =
        Array.from({ length: rows.length }, () => Array(totalCols).fill(null));

    columns.forEach((col) => {
        if (
            !col ||
            !Array.isArray(col.rowSpan) ||
            col.rowSpan.length < 2 ||
            typeof col.colIndex !== 'number' ||
            col.colIndex < 0 ||
            col.colIndex >= totalCols
        ) {
            return;
        }

        const rawStart = col.rowSpan[0];
        const rawEnd = col.rowSpan[1];

        if (typeof rawStart !== 'number' || typeof rawEnd !== 'number') {
            return;
        }

        // Clamp rowSpan indices to prevent out-of-bounds array access and invalid HTML rowSpan values
        const startRow = Math.max(0, Math.min(rawStart, rows.length - 1));
        const endRow = Math.max(startRow, Math.min(rawEnd, rows.length - 1));

        for (let r = startRow; r <= endRow; r++) {
            if (r === startRow) {
                cellMap[r][col.colIndex] = col;
            } else {
                cellMap[r][col.colIndex] = 'spanned';
            }
        }
    });

    const tableLabel = mounted
        ? t('gantt_table', { defaultValue: 'Cooking Flow' })
        : 'Cooking Flow';

    return (
        <>
            <hr />
            <div
                className="dark:text-neutral-100"
                data-cy="gantt-table-section"
                data-testid="gantt-table-section"
            >
                <div className="mb-4 flex flex-row items-center gap-2 text-xl font-semibold">
                    {tableLabel}
                </div>

                {Array.isArray(preSteps) && preSteps.length > 0 && (
                    <div className="mb-4 flex flex-col gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                        {preSteps.map((step, idx) => (
                            <div
                                key={`pre-${step}-${idx}`}
                                className="flex items-start gap-2"
                            >
                                <span className="font-semibold text-rose-500">
                                    •
                                </span>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <table
                        className="w-full border-collapse text-left text-sm"
                        aria-label={tableLabel}
                    >
                        <tbody>
                            {rows.map((row, rIdx) => {
                                const groupIndex = Math.abs(row.group || 0);
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
                                                const cell =
                                                    cellMap[rIdx][cIdx];
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
            </div>
        </>
    );
};

export default RecipeGanttTable;
