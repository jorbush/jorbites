'use client';

import React from 'react';
import { CUISINE_FLAGS } from './cuisineFlags';

interface CuisineIconProps {
    cuisine: string;
    size?: number;
    className?: string;
}

export const CuisineIcon: React.FC<CuisineIconProps> = ({
    cuisine,
    size = 20,
    className = '',
}) => {
    const normalized = cuisine.trim();
    const id = `clip-${normalized.toLowerCase().replace(/\s+/g, '-')}`;
    const flagContent = CUISINE_FLAGS[normalized];

    if (!flagContent) {
        return <span className="text-lg">🌍</span>;
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={`inline-block shrink-0 rounded-full shadow-xs ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <clipPath id={id}>
                    <circle
                        cx="50"
                        cy="50"
                        r="50"
                    />
                </clipPath>
            </defs>
            <g clipPath={`url(#${id})`}>{flagContent}</g>
        </svg>
    );
};
