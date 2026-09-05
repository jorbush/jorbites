import { GanttRow, GanttColumn } from '@/app/types';
import { toast } from 'react-hot-toast';
import { TFunction } from 'i18next';

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

        // Add UTF-8 BOM (\uFEFF) so Excel and spreadsheet apps correctly render UTF-8 characters like ñ, á, é, •
        const bom = '\uFEFF';
        const csvContent =
            bom +
            csvRows
                .map((r) =>
                    r
                        .map(
                            (field) => `"${(field || '').replace(/"/g, '""')}"`
                        )
                        .join(',')
                )
                .join('\n');

        const encodedUri =
            'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'gantt-table.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(
            t('downloaded_sheet', { defaultValue: 'Sheet downloaded!' })
        );
    } catch {
        toast.error(
            t('failed_to_export_sheet', {
                defaultValue: 'Failed to export sheet',
            })
        );
    }
};

export const exportGanttTableToPNG = async (
    element: HTMLDivElement | null,
    titleText: string,
    t: TFunction
) => {
    if (!element) return;
    try {
        let maxChildScrollWidth = 0;
        element.querySelectorAll('*').forEach((child) => {
            if (child.scrollWidth > maxChildScrollWidth) {
                maxChildScrollWidth = child.scrollWidth;
            }
        });

        const width = Math.max(
            element.offsetWidth || 0,
            element.scrollWidth || 0,
            maxChildScrollWidth ? maxChildScrollWidth + 32 : 0,
            800
        );
        const height = (element.offsetHeight || 400) + 12;

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

        const titleEl = clonedNode.querySelector('h3');
        if (titleEl && titleText) {
            titleEl.textContent = titleText;
        }

        const inlineStyles = `
            * { box-sizing: border-box; }
            body, div, table, th, td, span, h3 { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            h3 { font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: ${isDark ? '#f5f5f5' : '#171717'}; }
            [data-testid="gantt-pre-steps"], .mb-4, .mb-5, .mb-6 { margin-bottom: 24px !important; }
            .gap-1\\.5 { gap: 6px; }
            .overflow-x-auto { overflow: visible !important; width: 100% !important; }
            table { border-collapse: collapse; width: 100%; font-size: 14px; text-align: left; }
            th, td { border: 1px solid ${isDark ? '#262626' : '#e5e7eb'}; padding: 12px; }
            th { background-color: ${isDark ? '#171717' : '#f9fafb'}; color: ${isDark ? '#e5e5e5' : '#1f2937'}; white-space: nowrap; font-weight: 500; }
            .bg-amber-500\\/10 { background-color: ${isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)'}; color: ${isDark ? '#fef3c7' : '#78350f'}; }
            .bg-emerald-500\\/10 { background-color: ${isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)'}; color: ${isDark ? '#a7f3d0' : '#065f46'}; }
            .bg-sky-500\\/10 { background-color: ${isDark ? 'rgba(14,165,233,0.2)' : 'rgba(14,165,233,0.1)'}; color: ${isDark ? '#bae6fd' : '#075985'}; }
            .bg-purple-500\\/10 { background-color: ${isDark ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.1)'}; color: ${isDark ? '#e9d5ff' : '#6b21a8'}; }
            .bg-rose-500\\/10 { background-color: ${isDark ? 'rgba(244,63,94,0.2)' : 'rgba(244,63,94,0.1)'}; color: ${isDark ? '#fecdd3' : '#9f1239'}; }
        `;

        const data = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml">
                        <style>${inlineStyles}</style>
                        <div style="padding: 16px; background-color: ${isDark ? '#171717' : '#ffffff'}; color: ${isDark ? '#f5f5f5' : '#171717'};">
                            ${clonedNode.innerHTML}
                        </div>
                    </div>
                </foreignObject>
            </svg>
        `;

        const svgDataUri =
            'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);

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
            img.onerror = (err) => reject(err);
            img.src = svgDataUri;
        });
    } catch {
        toast.error(
            t('failed_to_export_png', { defaultValue: 'Failed to export PNG' })
        );
    }
};
