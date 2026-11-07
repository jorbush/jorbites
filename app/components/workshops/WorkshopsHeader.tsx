'use client';

import React from 'react';
import { IconType } from 'react-icons';

interface WorkshopsHeaderProps {
    icon: IconType;
    title: string;
    description?: string | undefined | null;
    action?: React.ReactNode;
}

const WorkshopsHeader: React.FC<WorkshopsHeaderProps> = ({
    icon: Icon,
    title,
    description,
    action,
}) => {
    return (
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                    <Icon
                        className="text-2xl sm:text-3xl"
                        aria-hidden="true"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {action && (
                <div className="hidden md:block md:shrink-0">{action}</div>
            )}
        </div>
    );
};

export default WorkshopsHeader;
