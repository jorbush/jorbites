'use client';

import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    iconBgColor?: string;
    iconDarkBgColor?: string;
    iconColor?: string;
    footer?: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    iconBgColor = 'bg-neutral-100',
    iconDarkBgColor = 'dark:bg-neutral-800',
    iconColor = 'text-neutral-700 dark:text-neutral-300',
    footer,
}) => {
    const renderValue = () => {
        if (
            typeof value === 'string' &&
            value.endsWith('h') &&
            !isNaN(Number(value.slice(0, -1)))
        ) {
            return (
                <div className="flex items-baseline">
                    <span className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
                        {value.slice(0, -1)}
                    </span>
                    <span className="ml-0.5 text-base font-semibold text-neutral-400 sm:text-lg dark:text-neutral-500">
                        h
                    </span>
                </div>
            );
        }
        return (
            <span className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
                {value}
            </span>
        );
    };

    return (
        <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-colors duration-200 hover:border-neutral-300 sm:p-5 dark:border-neutral-800 dark:bg-neutral-800/90 dark:hover:border-neutral-700">
            <div>
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                        {title}
                    </p>
                    <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-base sm:size-10 sm:text-lg ${iconBgColor} ${iconDarkBgColor} ${iconColor}`}
                    >
                        {icon}
                    </div>
                </div>
                <div className="mt-2 flex items-baseline">{renderValue()}</div>
            </div>
            {footer && (
                <div className="mt-3.5 flex items-center border-t border-neutral-100 pt-2.5 text-xs text-neutral-500 dark:border-neutral-800/80 dark:text-neutral-400">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default StatCard;
