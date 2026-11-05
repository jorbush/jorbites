'use client';

import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    iconBgColor: string;
    iconDarkBgColor?: string;
    iconColor: string;
    glowColor?: string;
    footer?: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    iconBgColor,
    iconDarkBgColor = 'dark:bg-neutral-800',
    iconColor,
    glowColor,
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
                    <span className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                        {value.slice(0, -1)}
                    </span>
                    <span className="ml-0.5 text-base font-bold text-neutral-400 dark:text-neutral-500 sm:text-lg">
                        h
                    </span>
                </div>
            );
        }
        return (
            <span className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                {value}
            </span>
        );
    };

    return (
        <div className="shadow-xs group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/70 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800/90 dark:hover:border-neutral-700 sm:p-5">
            {glowColor && (
                <div
                    className={`pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20 dark:opacity-20 dark:group-hover:opacity-30 ${glowColor}`}
                />
            )}
            <div>
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
                        {title}
                    </p>
                    <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 sm:size-10 ${iconBgColor} ${iconDarkBgColor} ring-1 ring-black/5 dark:ring-white/10`}
                    >
                        <div className={`text-base sm:text-lg ${iconColor}`}>
                            {icon}
                        </div>
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
