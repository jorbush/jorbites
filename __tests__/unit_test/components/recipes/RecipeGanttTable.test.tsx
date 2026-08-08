import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { RecipeGanttTable } from '@/app/components/recipes/RecipeGanttTable';
import { GanttTable } from '@/app/types';

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) =>
            options?.defaultValue || key,
    }),
}));

describe('RecipeGanttTable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    const mockGanttTable: GanttTable = {
        preSteps: ['Preheat oven to 350°F (170°C)', 'Butter and flour pan'],
        rows: [
            { ingredient: 'Butter', group: 0 },
            { ingredient: 'Sugar', group: 0 },
            { ingredient: 'Flour', group: 1 },
        ],
        columns: [
            { action: 'melt', rowSpan: [0, 0], colIndex: 0 },
            { action: 'mix', rowSpan: [0, 1], colIndex: 1 },
            { action: 'fold in', rowSpan: [0, 2], colIndex: 2 },
        ],
    };

    it('renders nothing when ganttTable is null or undefined', () => {
        const { container } = render(<RecipeGanttTable ganttTable={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when ganttTable rows is empty', () => {
        const emptyTable: GanttTable = {
            preSteps: [],
            rows: [],
            columns: [],
        };
        const { container } = render(
            <RecipeGanttTable ganttTable={emptyTable} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders section title and preSteps', () => {
        render(<RecipeGanttTable ganttTable={mockGanttTable} />);

        expect(screen.getByTestId('gantt-table-section')).toBeDefined();
        expect(screen.getByText('Gantt Table')).toBeDefined();
        expect(screen.getByText('Preheat oven to 350°F (170°C)')).toBeDefined();
        expect(screen.getByText('Butter and flour pan')).toBeDefined();
    });

    it('renders all ingredients as rows using th element', () => {
        render(<RecipeGanttTable ganttTable={mockGanttTable} />);

        const butterHeader = screen.getByRole('rowheader', { name: 'Butter' });
        expect(butterHeader).toBeDefined();
        expect(screen.getByText('Sugar')).toBeDefined();
        expect(screen.getByText('Flour')).toBeDefined();
    });

    it('renders action cells with correct text', () => {
        render(<RecipeGanttTable ganttTable={mockGanttTable} />);

        expect(screen.getByText('melt')).toBeDefined();
        expect(screen.getByText('mix')).toBeDefined();
        expect(screen.getByText('fold in')).toBeDefined();
    });

    it('handles negative rowSpan and out-of-bounds rowSpan safely', () => {
        const malformedTable: GanttTable = {
            preSteps: [],
            rows: [
                { ingredient: 'Salt', group: -1 },
                { ingredient: 'Water', group: 0 },
            ],
            columns: [
                { action: 'stir', rowSpan: [-5, 10], colIndex: 0 },
                { action: 'ignore', rowSpan: [0, 1], colIndex: -1 }, // negative colIndex
            ],
        };

        render(<RecipeGanttTable ganttTable={malformedTable} />);

        expect(screen.getByText('Salt')).toBeDefined();
        expect(screen.getByText('Water')).toBeDefined();
        expect(screen.getByText('stir')).toBeDefined();
        expect(screen.queryByText('ignore')).toBeNull();
    });

    it('renders table with empty columns array gracefully', () => {
        const rowsOnlyTable: GanttTable = {
            preSteps: ['Prestep 1'],
            rows: [{ ingredient: 'Milk', group: 0 }],
            columns: [],
        };

        render(<RecipeGanttTable ganttTable={rowsOnlyTable} />);

        expect(screen.getByText('Milk')).toBeDefined();
        expect(screen.getByText('Prestep 1')).toBeDefined();
    });

    it('renders Sheet and PNG action buttons', () => {
        render(<RecipeGanttTable ganttTable={mockGanttTable} />);

        expect(screen.getByTestId('gantt-table-sheet-btn')).toBeDefined();
        expect(screen.getByTestId('gantt-table-png-btn')).toBeDefined();
        expect(screen.getByText('Sheet')).toBeDefined();
        expect(screen.getByText('PNG')).toBeDefined();
    });
});
