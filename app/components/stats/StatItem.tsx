'use client';

import React from 'react';

interface StatItemProps {
    value: number | string;
    label: string;
    flexDirection: 'row' | 'col';
}

const StatItem: React.FC<StatItemProps> = ({ value, label, flexDirection }) => (
    <div className={`flex flex-${flexDirection} items-center gap-1`}>
        <p
            className={`text-green-450 font-bold ${flexDirection !== 'row' ? 'text-lg' : 'text-sm'}`}
        >
            {value}
        </p>
        <p
            className={`text-gray-500 dark:text-gray-400 ${flexDirection !== 'row' ? 'text-sm' : 'text-xs'}`}
        >
            {label}
        </p>
    </div>
);

export default StatItem;
