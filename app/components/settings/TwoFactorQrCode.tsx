import React, { useMemo } from 'react';
import { generateQrMatrix } from '@/app/utils/qrcode';

interface TwoFactorQrCodeProps {
    value: string;
}

export const TwoFactorQrCode: React.FC<TwoFactorQrCodeProps> = ({ value }) => {
    const matrix = useMemo(() => {
        try {
            return generateQrMatrix(value);
        } catch {
            return null;
        }
    }, [value]);

    if (!matrix || matrix.length === 0) return null;

    const size = matrix.length;
    const quietZone = 2;
    const viewBoxSize = size + quietZone * 2;

    return (
        <div
            className="inline-flex items-center justify-center rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-xs"
            data-testid="two-factor-qr-code"
        >
            <svg
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                className="size-44"
                shapeRendering="crispEdges"
                role="img"
                aria-label="QR Code"
            >
                <rect
                    width={viewBoxSize}
                    height={viewBoxSize}
                    fill="#ffffff"
                />
                {matrix.map((row, r) =>
                    row.map((isDark, c) =>
                        isDark ? (
                            <rect
                                key={`${r}-${c}`}
                                x={c + quietZone}
                                y={r + quietZone}
                                width={1}
                                height={1}
                                fill="#171717"
                            />
                        ) : null
                    )
                )}
            </svg>
        </div>
    );
};
