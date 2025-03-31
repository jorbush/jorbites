'use client';

import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    iconBgColor: string;
    iconDarkBgColor: string;
    iconColor: string;
    footer?: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    iconBgColor,
    iconDarkBgColor,
    iconColor,
    footer,
}) => {
    return (
        <div className="rounded-lg bg-white p-3 shadow-xs dark:bg-gray-800">
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-green-450">
                        {value}
                    </p>
                </div>
                <div
                    className={`rounded-full ${iconBgColor} p-2 ${iconDarkBgColor}`}
                >
                    <div className={`text-lg ${iconColor}`}>{icon}</div>
                </div>
            </div>
            {footer && (
                <div className="mt-3 flex items-center text-xs">{footer}</div>
            )}
        </div>
    );
};

export default StatCard;
