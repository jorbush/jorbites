import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
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

        it('calculates full width considering scrollWidth of overflowing children', async () => {
            const mockContainer = document.createElement('div');
            Object.defineProperty(mockContainer, 'offsetWidth', { value: 320 });
            Object.defineProperty(mockContainer, 'offsetHeight', { value: 200 });
            Object.defineProperty(mockContainer, 'scrollWidth', { value: 320 });

            const mockChildTable = document.createElement('table');
            Object.defineProperty(mockChildTable, 'scrollWidth', { value: 1200 });
            mockContainer.appendChild(mockChildTable);

            // Mock HTMLCanvasElement context
            const mockCtx = {
                scale: vi.fn(),
                fillStyle: '',
                fillRect: vi.fn(),
                drawImage: vi.fn(),
            };
            const mockCanvas = {
                width: 0,
                height: 0,
                getContext: vi.fn().mockReturnValue(mockCtx),
                toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
            };

            const originalCreateElement = document.createElement.bind(document);
            vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
                if (tagName.toLowerCase() === 'canvas') {
                    return mockCanvas as unknown as HTMLCanvasElement;
                }
                return originalCreateElement(tagName, options);
            });

            const appendChildSpy = vi
                .spyOn(document.body, 'appendChild')
                .mockImplementation((node) => node);
            const removeChildSpy = vi
                .spyOn(document.body, 'removeChild')
                .mockImplementation((node) => node);

            // Mock Image load behavior
            class MockImage {
                onload: (() => void) | null = null;
                onerror: ((err: any) => void) | null = null;
                _src = '';
                set src(val: string) {
                    this._src = val;
                    setTimeout(() => {
                        if (this.onload) this.onload();
                    }, 0);
                }
                get src() {
                    return this._src;
                }
            }
            vi.stubGlobal('Image', MockImage);

            await exportGanttTableToPNG(mockContainer, 'Recipe Title', mockT as any);

            expect(mockCanvas.width).toBe((1200 + 32) * 2);
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();

            vi.unstubAllGlobals();
            vi.restoreAllMocks();
        });
    });
});
