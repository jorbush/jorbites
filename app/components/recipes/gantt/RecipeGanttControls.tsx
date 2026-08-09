'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownload } from 'react-icons/fi';
import { BsTable } from 'react-icons/bs';

interface RecipeGanttControlsProps {
    onExportSheet: () => void;
    onExportPNG: () => void;
}

export const RecipeGanttControls: React.FC<RecipeGanttControlsProps> = ({
    onExportSheet,
    onExportPNG,
}) => {
    const { t } = useTranslation();

    return (
        <div
            className="flex items-center gap-2"
            data-testid="gantt-table-controls"
        >
            <button
                type="button"
                onClick={onExportSheet}
                data-testid="gantt-table-sheet-btn"
                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                aria-label="Export Sheet"
                title="Export as CSV/Sheet"
            >
                <BsTable className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <span>{t('sheet', { defaultValue: 'Sheet' })}</span>
            </button>

            <button
                type="button"
                onClick={onExportPNG}
                data-testid="gantt-table-png-btn"
                className="flex cursor-pointer items-center gap-1.5 rounded-md bg-neutral-800 px-3.5 py-1.5 text-sm font-medium text-white shadow-xs transition hover:bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                aria-label="Export PNG"
                title="Download as PNG"
            >
                <FiDownload className="h-4 w-4" />
                <span>{t('png', { defaultValue: 'PNG' })}</span>
            </button>
        </div>
    );
};
