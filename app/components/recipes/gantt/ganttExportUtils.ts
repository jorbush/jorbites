import { GanttRow, GanttColumn } from '@/app/types';
import { toast } from 'react-hot-toast';
import { TFunction } from 'i18next';

export const copyGanttTableToClipboard = async (
    preSteps: string[],
    rows: GanttRow[],
    cellMap: Array<Array<GanttColumn | 'spanned' | null>>,
    totalCols: number,
    t: TFunction
): Promise<boolean> => {
    try {
        let textContent = '';
        if (Array.isArray(preSteps) && preSteps.length > 0) {
            textContent += preSteps.map((s) => `• ${s}`).join('\n') + '\n\n';
        }

        const headerRow = ['Ingredient'];
        for (let c = 0; c < totalCols; c++) {
            headerRow.push(`Step ${c + 1}`);
        }
        textContent += headerRow.join('\t') + '\n';

        rows.forEach((row, rIdx) => {
            const rowCells = [row.ingredient];
            for (let cIdx = 0; cIdx < totalCols; cIdx++) {
                const cell = cellMap[rIdx][cIdx];
                if (cell && cell !== 'spanned') {
                    rowCells.push(cell.action || '');
                } else {
                    rowCells.push('');
                }
            }
            textContent += rowCells.join('\t') + '\n';
        });

        await navigator.clipboard.writeText(textContent.trim());
        toast.success(
            t('copied_to_clipboard', {
                defaultValue: 'Copied to clipboard!',
            })
        );
        return true;
    } catch {
        toast.error('Failed to copy');
        return false;
    }
};

export const exportGanttTableToCSV = (
    preSteps: string[],
    rows: GanttRow[],
    cellMap: Array<Array<GanttColumn | 'spanned' | null>>,
    totalCols: number,
    t: TFunction
) => {
    try {
        const csvRows: string[][] = [];

        if (Array.isArray(preSteps) && preSteps.length > 0) {
            preSteps.forEach((step) => {
                csvRows.push([`• ${step}`]);
            });
            csvRows.push([]);
        }

        const headerRow = ['Ingredient'];
        for (let c = 0; c < totalCols; c++) {
            headerRow.push(`Step ${c + 1}`);
        }
        csvRows.push(headerRow);

        rows.forEach((row, rIdx) => {
            const rowCells = [row.ingredient];
            for (let cIdx = 0; cIdx < totalCols; cIdx++) {
                const cell = cellMap[rIdx][cIdx];
                if (cell && cell !== 'spanned') {
                    rowCells.push(cell.action || '');
                } else {
                    rowCells.push('');
                }
            }
            csvRows.push(rowCells);
        });

        const csvContent = csvRows
            .map((r) =>
                r
                    .map((field) => `"${(field || '').replace(/"/g, '""')}"`)
                    .join(',')
            )
            .join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);

        try {
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'gantt-table.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(
                t('downloaded_sheet', { defaultValue: 'Sheet downloaded!' })
            );
        } finally {
            URL.revokeObjectURL(url);
        }
    } catch {
        toast.error('Failed to export sheet');
    }
};

export const exportGanttTableToPNG = async (
    element: HTMLDivElement | null,
    t: TFunction
) => {
    if (!element) return;
    try {
        const width = element.offsetWidth || 800;
        const height = element.offsetHeight || 400;

        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(scale, scale);

        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? '#171717' : '#ffffff';
        ctx.fillRect(0, 0, width, height);

        const clonedNode = element.cloneNode(true) as HTMLElement;
        const btnBar = clonedNode.querySelector(
            '[data-testid="gantt-table-controls"]'
        );
        if (btnBar) {
            btnBar.remove();
        }

        const data = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml" class="${document.documentElement.className}">
                        <style>
                            ${Array.from(document.styleSheets)
                                .flatMap((sheet) => {
                                    try {
                                        return Array.from(sheet.cssRules).map(
                                            (rule) => rule.cssText
                                        );
                                    } catch {
                                        return [];
                                    }
                                })
                                .join('\n')}
                        </style>
                        <div style="padding: 16px; background-color: ${isDark ? '#171717' : '#ffffff'}; color: ${isDark ? '#f5f5f5' : '#171717'};">
                            ${clonedNode.innerHTML}
                        </div>
                    </div>
                </foreignObject>
            </svg>
        `;

        const svgBlob = new Blob([data], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(svgBlob);

        try {
            await new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        ctx.drawImage(img, 0, 0);
                        const pngUrl = canvas.toDataURL('image/png');
                        const link = document.createElement('a');
                        link.href = pngUrl;
                        link.download = 'gantt-table.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success(
                            t('downloaded_png', {
                                defaultValue: 'PNG downloaded!',
                            })
                        );
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                };
                img.onerror = (err) => {
                    reject(err);
                };
                img.src = url;
            });
        } finally {
            URL.revokeObjectURL(url);
        }
    } catch {
        toast.error('Failed to export PNG');
    }
};
