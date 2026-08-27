'use client';

import React from 'react';
import { DraftProgress } from '@/app/types/draft';
import Tooltip from '@/app/components/utils/Tooltip';

interface DraftProgressBarProps {
    progress: DraftProgress;
}

const DraftProgressBar: React.FC<DraftProgressBarProps> = ({ progress }) => {
    return (
        <div
            className="flex flex-row items-center gap-1.5"
            data-testid="draft-progress-bar"
        >
            {progress.stepDetails.map((step) => (
                <Tooltip
                    key={step.name}
                    text={step.name}
                    position="top"
                >
                    <div
                        data-testid="draft-progress-dot"
                        className={`h-2 w-2 rounded-full ${
                            step.completed
                                ? 'bg-green-450'
                                : 'bg-neutral-200 dark:bg-neutral-700'
                        }`}
                    />
                </Tooltip>
            ))}
        </div>
    );
};

export default DraftProgressBar;
