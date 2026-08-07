'use client';

import React, { useState, useRef } from 'react';
import { GanttTable } from '@/app/types';
import { useTranslation } from 'react-i18next';
import useIsMounted from '@/app/hooks/useIsMounted';
import { RecipeGanttControls } from './gantt/RecipeGanttControls';
import { RecipeGanttPreSteps } from './gantt/RecipeGanttPreSteps';
import { RecipeGanttGrid } from './gantt/RecipeGanttGrid';
import {
    copyGanttTableToClipboard,
    exportGanttTableToCSV,
    exportGanttTableToPNG,
} from './gantt/ganttExportUtils';

interface RecipeGanttTableProps {
    ganttTable?: GanttTable | null;
}

export const RecipeGanttTable: React.FC<RecipeGanttTableProps> = ({
    ganttTable,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const [copied, setCopied] = useState(false);
    const tableSectionRef = useRef<HTMLDivElement>(null);

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
        ? t('gantt_table', { defaultValue: 'Gantt Table' })
        : 'Gantt Table';

    const handleCopy = async () => {
        const success = await copyGanttTableToClipboard(
            preSteps,
            rows,
            cellMap,
            totalCols,
            t
        );
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleExportSheet = () => {
        exportGanttTableToCSV(preSteps, rows, cellMap, totalCols, t);
    };

    const handleExportPNG = () => {
        exportGanttTableToPNG(tableSectionRef.current, t);
    };

    return (
        <>
            <hr />
            <div
                ref={tableSectionRef}
                className="dark:text-neutral-100"
                data-cy="gantt-table-section"
                data-testid="gantt-table-section"
            >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <h3 className="flex flex-row items-center gap-2 text-xl font-semibold">
                        {tableLabel}
                    </h3>
                    <RecipeGanttControls
                        onCopy={handleCopy}
                        onExportSheet={handleExportSheet}
                        onExportPNG={handleExportPNG}
                        copied={copied}
                    />
                </div>

                <RecipeGanttPreSteps preSteps={preSteps} />

                <RecipeGanttGrid
                    rows={rows}
                    totalCols={totalCols}
                    cellMap={cellMap}
                    tableLabel={tableLabel}
                />
            </div>
        </>
    );
};

export default RecipeGanttTable;
