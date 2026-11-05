'use client';

import { ReactNode } from 'react';

interface PreferenceCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    iconBgColor?: string;
    iconDarkBgColor?: string;
    iconColor?: string;
}

const PreferenceCard: React.FC<PreferenceCardProps> = ({
    title,
    value,
    icon,
    iconBgColor = 'bg-neutral-100',
    iconDarkBgColor = 'dark:bg-neutral-800',
    iconColor = 'text-neutral-700 dark:text-neutral-300',
}) => {
    const hasValue = Boolean(value && value !== '-');

    return (
        <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-colors duration-200 hover:border-neutral-300 sm:gap-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-800/90 dark:hover:border-neutral-700">
            <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-xl sm:size-12 sm:text-2xl ${iconBgColor} ${iconDarkBgColor} ${iconColor}`}
            >
                {icon}
            </div>
            <div className="flex flex-col">
                <p className="text-xs font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                    {title}
                </p>
                <p
                    className={`mt-0.5 text-base font-bold tracking-tight capitalize sm:text-lg ${
                        hasValue
                            ? 'text-neutral-900 dark:text-neutral-100'
                            : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
};

export default PreferenceCard;
