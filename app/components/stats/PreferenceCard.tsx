'use client';

import { ReactNode } from 'react';

interface PreferenceCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    iconBgColor: string;
    iconDarkBgColor: string;
    iconColor: string;
}

const PreferenceCard: React.FC<PreferenceCardProps> = ({
    title,
    value,
    icon,
    iconBgColor,
    iconDarkBgColor,
    iconColor,
}) => {
    return (
        <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-xs dark:bg-neutral-800">
            <div
                className={`rounded-full ${iconBgColor} p-3 ${iconDarkBgColor}`}
            >
                <div className={`text-xl ${iconColor}`}>{icon}</div>
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {title}
                </p>
                <p className="text-green-450 text-lg font-semibold">{value}</p>
            </div>
        </div>
    );
};

export default PreferenceCard;
