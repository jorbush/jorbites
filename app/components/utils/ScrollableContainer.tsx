import React from 'react';

interface ScrollableContainerProps {
    children?: React.ReactNode;
    className?: string;
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
    children,
    className = '',
}) => {
    return (
        <div className={`relative ${className}`}>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
                {children}
            </div>
            {/* Left fade overlay */}
            <div className="pointer-events-none absolute top-0 left-0 h-full w-2 bg-gradient-to-r from-white to-transparent dark:from-neutral-900" />
            {/* Right fade overlay */}
            <div className="pointer-events-none absolute top-0 right-0 h-full w-2 bg-gradient-to-l from-white to-transparent dark:from-neutral-900" />
        </div>
    );
};

export default ScrollableContainer;
