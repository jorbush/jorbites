import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { RecipeGanttGrid } from '@/app/components/recipes/gantt/RecipeGanttGrid';
import { GanttRow, GanttColumn } from '@/app/types';

describe('RecipeGanttGrid', () => {
    afterEach(() => {
        cleanup();
    });

    const mockRows: GanttRow[] = [
        { ingredient: 'Butter', group: 0 },
        { ingredient: 'Sugar', group: 1 },
    ];

    const cellMap: Array<Array<GanttColumn | 'spanned' | null>> = [
        [
            { action: 'melt', rowSpan: [0, 0], colIndex: 0 },
            { action: 'mix', rowSpan: [0, 1], colIndex: 1 },
        ],
        [null, 'spanned'],
    ];

    it('renders ingredients and action cells correctly', () => {
        render(
            <RecipeGanttGrid
                rows={mockRows}
                totalCols={2}
                cellMap={cellMap}
                tableLabel="Gantt Table"
            />
        );

        expect(screen.getByRole('rowheader', { name: 'Butter' })).toBeDefined();
        expect(screen.getByRole('rowheader', { name: 'Sugar' })).toBeDefined();
        expect(screen.getByText('melt')).toBeDefined();
        expect(screen.getByText('mix')).toBeDefined();

        // Check that empty cells have an accessible aria-label="Empty"
        const emptyCell = screen.getByRole('cell', { name: 'Empty' });
        expect(emptyCell).toBeDefined();
    });
});
