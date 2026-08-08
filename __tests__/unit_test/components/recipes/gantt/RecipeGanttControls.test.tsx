import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { RecipeGanttControls } from '@/app/components/recipes/gantt/RecipeGanttControls';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) =>
            options?.defaultValue || key,
    }),
}));

describe('RecipeGanttControls', () => {
    const onExportSheet = vi.fn();
    const onExportPNG = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders Sheet and PNG buttons', () => {
        render(
            <RecipeGanttControls
                onExportSheet={onExportSheet}
                onExportPNG={onExportPNG}
            />
        );

        expect(screen.getByTestId('gantt-table-sheet-btn')).toBeDefined();
        expect(screen.getByTestId('gantt-table-png-btn')).toBeDefined();
        expect(screen.getByText('Sheet')).toBeDefined();
        expect(screen.getByText('PNG')).toBeDefined();
    });

    it('triggers callbacks when action buttons are clicked', () => {
        render(
            <RecipeGanttControls
                onExportSheet={onExportSheet}
                onExportPNG={onExportPNG}
            />
        );

        fireEvent.click(screen.getByTestId('gantt-table-sheet-btn'));
        expect(onExportSheet).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('gantt-table-png-btn'));
        expect(onExportPNG).toHaveBeenCalledTimes(1);
    });
});
