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
    const onCopy = vi.fn();
    const onExportSheet = vi.fn();
    const onExportPNG = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders Copy, Sheet, and PNG buttons', () => {
        render(
            <RecipeGanttControls
                onCopy={onCopy}
                onExportSheet={onExportSheet}
                onExportPNG={onExportPNG}
                copied={false}
            />
        );

        expect(screen.getByTestId('gantt-table-copy-btn')).toBeDefined();
        expect(screen.getByTestId('gantt-table-sheet-btn')).toBeDefined();
        expect(screen.getByTestId('gantt-table-png-btn')).toBeDefined();
        expect(screen.getByText('Copy')).toBeDefined();
        expect(screen.getByText('Sheet')).toBeDefined();
        expect(screen.getByText('PNG')).toBeDefined();
    });

    it('displays Copied! when copied prop is true', () => {
        render(
            <RecipeGanttControls
                onCopy={onCopy}
                onExportSheet={onExportSheet}
                onExportPNG={onExportPNG}
                copied={true}
            />
        );

        expect(screen.getByText('Copied!')).toBeDefined();
    });

    it('triggers callbacks when action buttons are clicked', () => {
        render(
            <RecipeGanttControls
                onCopy={onCopy}
                onExportSheet={onExportSheet}
                onExportPNG={onExportPNG}
                copied={false}
            />
        );

        fireEvent.click(screen.getByTestId('gantt-table-copy-btn'));
        expect(onCopy).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('gantt-table-sheet-btn'));
        expect(onExportSheet).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('gantt-table-png-btn'));
        expect(onExportPNG).toHaveBeenCalledTimes(1);
    });
});
