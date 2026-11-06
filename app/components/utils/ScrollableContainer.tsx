import React from 'react';

interface ScrollableContainerProps {
    children?: React.ReactNode;
    className?: string;
    fadeColorClassName?: string;
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
    children,
    className = '',
    fadeColorClassName = 'from-white dark:from-neutral-800',
}) => {
    return (
        <div className={`relative ${className}`}>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto px-1 pb-2">
                {children}
            </div>
            {/* Left fade overlay */}
            <div
                className={`pointer-events-none absolute top-0 left-0 h-full w-1.5 bg-gradient-to-r to-transparent ${fadeColorClassName}`}
            />
            {/* Right fade overlay */}
            <div
                className={`pointer-events-none absolute top-0 right-0 h-full w-1.5 bg-gradient-to-l to-transparent ${fadeColorClassName}`}
            />
        </div>
    );
};

export default ScrollableContainer;
