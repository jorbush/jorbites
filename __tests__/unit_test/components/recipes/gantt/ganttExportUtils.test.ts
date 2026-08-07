import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    copyGanttTableToClipboard,
    exportGanttTableToCSV,
    exportGanttTableToPNG,
} from '@/app/components/recipes/gantt/ganttExportUtils';
import { GanttRow, GanttColumn } from '@/app/types';

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ganttExportUtils', () => {
    const mockT = (key: string, options?: { defaultValue?: string }) =>
        options?.defaultValue || key;

    const mockRows: GanttRow[] = [{ ingredient: 'Salt', group: 0 }];

    const mockCellMap: Array<Array<GanttColumn | 'spanned' | null>> = [
        [{ action: 'add', rowSpan: [0, 0], colIndex: 0 }],
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('copyGanttTableToClipboard', () => {
        it('copies table data to navigator.clipboard', async () => {
            const writeTextMock = vi.fn().mockResolvedValue(undefined);
            Object.assign(navigator, {
                clipboard: {
                    writeText: writeTextMock,
                },
            });

            const result = await copyGanttTableToClipboard(
                ['Preheat oven'],
                mockRows,
                mockCellMap,
                1,
                mockT as any
            );

            expect(result).toBe(true);
            expect(writeTextMock).toHaveBeenCalled();
            expect(writeTextMock.mock.calls[0][0]).toContain('Preheat oven');
            expect(writeTextMock.mock.calls[0][0]).toContain('Salt');
            expect(writeTextMock.mock.calls[0][0]).toContain('add');
        });
    });

    describe('exportGanttTableToCSV', () => {
        it('triggers CSV download with data URI', () => {
            const appendChildSpy = vi
                .spyOn(document.body, 'appendChild')
                .mockImplementation((node) => node);
            const removeChildSpy = vi
                .spyOn(document.body, 'removeChild')
                .mockImplementation((node) => node);

            exportGanttTableToCSV(
                ['Preheat oven'],
                mockRows,
                mockCellMap,
                1,
                mockT as any
            );

            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();

            const addedLink = appendChildSpy.mock
                .calls[0][0] as HTMLAnchorElement;
            expect(addedLink.getAttribute('href')).toContain(
                'data:text/csv;charset=utf-8,'
            );

            appendChildSpy.mockRestore();
            removeChildSpy.mockRestore();
        });
    });

    describe('exportGanttTableToPNG', () => {
        it('handles null element safely', async () => {
            await exportGanttTableToPNG(null, 'Recipe Title', mockT as any);
        });
    });
});
