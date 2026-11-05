'use client';

import { ReactNode } from 'react';

interface PreferenceCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    iconBgColor: string;
    iconDarkBgColor?: string;
    iconColor: string;
    glowColor?: string;
}

const PreferenceCard: React.FC<PreferenceCardProps> = ({
    title,
    value,
    icon,
    iconBgColor,
    iconDarkBgColor = 'dark:bg-neutral-800',
    iconColor,
    glowColor,
}) => {
    const hasValue = Boolean(value && value !== '-');

    return (
        <div className="shadow-xs group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/70 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800/90 dark:hover:border-neutral-700 sm:p-5">
            {glowColor && (
                <div
                    className={`pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20 dark:opacity-20 dark:group-hover:opacity-30 ${glowColor}`}
                />
            )}
            <div className="flex items-center gap-3.5 sm:gap-4">
                <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 sm:size-12 ${iconBgColor} ${iconDarkBgColor} ring-1 ring-black/5 dark:ring-white/10`}
                >
                    <div className={`text-xl sm:text-2xl ${iconColor}`}>
                        {icon}
                    </div>
                </div>
                <div className="flex flex-col">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
                        {title}
                    </p>
                    <p
                        className={`mt-0.5 text-base font-bold capitalize tracking-tight sm:text-lg ${
                            hasValue
                                ? 'text-neutral-900 dark:text-neutral-50'
                                : 'text-neutral-400 dark:text-neutral-500'
                        }`}
                    >
                        {value}
                    </p>
                </div>
            </div>
            {hasValue && (
                <div className="flex shrink-0 items-center pl-2">
                    <div
                        className={`size-2 rounded-full ${iconColor.replace('text-', 'bg-')} opacity-80`}
                    />
                </div>
            )}
        </div>
    );
};

export default PreferenceCard;
