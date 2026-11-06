'use client';

import React from 'react';

interface StatItemProps {
    value: number | string;
    label: string;
    flexDirection: 'row' | 'col';
}

const StatItem: React.FC<StatItemProps> = ({ value, label, flexDirection }) => (
    <div
        className={`flex ${
            flexDirection === 'row' ? 'flex-row' : 'flex-col'
        } items-center gap-1`}
    >
        <p
            className={`text-green-450 font-bold ${
                flexDirection !== 'row' ? 'text-lg' : 'text-sm'
            }`}
        >
            {value}
        </p>
        <p
            className={`text-neutral-500 dark:text-neutral-400 ${
                flexDirection !== 'row' ? 'text-sm' : 'text-xs'
            }`}
        >
            {label}
        </p>
    </div>
);

export default StatItem;
