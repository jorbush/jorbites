'use client';

import React from 'react';

export interface CertificateProgressProps {
    progress: number;
}

const CertificateProgress: React.FC<CertificateProgressProps> = ({
    progress,
}) => (
    <div
        className="space-y-1.5"
        data-testid="certificate-progress"
    >
        <div className="flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span>Progress</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
                {progress}%
            </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border border-neutral-300/20 bg-neutral-200 dark:border-neutral-700/20 dark:bg-neutral-800">
            <div
                className="bg-green-450 h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
                data-testid="certificate-progress-bar"
            />
        </div>
    </div>
);

export default CertificateProgress;
