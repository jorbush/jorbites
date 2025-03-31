'use client';

import React, { useState, ReactNode } from 'react';

interface TooltipProps {
    text: string;
    children: ReactNode;
    position?: 'top' | 'right' | 'bottom' | 'left';
    delay?: number;
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
    text,
    children,
    position = 'top',
    delay = 300,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
        right: 'left-full top-1/2 -translate-y-1/2 ml-1',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
        left: 'right-full top-1/2 -translate-y-1/2 mr-1',
    };

    return (
        <div
            className={`group relative inline-block ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {isVisible && (
                <div
                    className={`pointer-events-none absolute z-1 rounded-sm bg-white px-2 py-1 text-xs whitespace-nowrap text-gray-800 opacity-100 shadow-md dark:bg-gray-700 dark:text-white ${positionClasses[position]}`}
                    data-testid="tooltip"
                >
                    {text}
                    <div
                        className={`absolute h-0 w-0 border-4 border-transparent ${
                            position === 'top'
                                ? `bottom-[-8px] left-1/2 -translate-x-1/2 border-t-white dark:border-t-gray-700`
                                : position === 'right'
                                  ? `top-1/2 left-[-8px] -translate-y-1/2 border-r-white dark:border-r-gray-700`
                                  : position === 'bottom'
                                    ? `top-[-8px] left-1/2 -translate-x-1/2 border-b-white dark:border-b-gray-700`
                                    : `top-1/2 right-[-8px] -translate-y-1/2 border-l-white dark:border-l-gray-700`
                        }`}
                    />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
