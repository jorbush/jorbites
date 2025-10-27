'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface HorizontalScrollSectionProps {
    title: string;
    emptyMessage?: string;
    children: React.ReactNode;
    hasItems: boolean;
}

// Constants for scroll behavior
const SCROLL_TOLERANCE = 10; // Pixel tolerance for edge detection
const SCROLL_PERCENTAGE = 0.8; // Percentage of viewport width to scroll

const HorizontalScrollSection: React.FC<HorizontalScrollSectionProps> = ({
    title,
    emptyMessage = 'No items found',
    children,
    hasItems,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScrollPosition = useCallback(() => {
        if (!scrollContainerRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } =
            scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(
            scrollLeft < scrollWidth - clientWidth - SCROLL_TOLERANCE
        );
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;

        const scrollAmount =
            scrollContainerRef.current.clientWidth * SCROLL_PERCENTAGE;
        const newScrollLeft =
            scrollContainerRef.current.scrollLeft +
            (direction === 'left' ? -scrollAmount : scrollAmount);

        scrollContainerRef.current.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth',
        });
    };

    // Set up window resize event listener on mount
    React.useEffect(() => {
        window.addEventListener('resize', checkScrollPosition);
        return () => window.removeEventListener('resize', checkScrollPosition);
    }, [checkScrollPosition]);

    // Check scroll position on mount and when children change
    React.useEffect(() => {
        checkScrollPosition();
    }, [children, checkScrollPosition]);

    return (
        <div className="mb-10">
            <h2 className="mb-5 text-2xl font-bold dark:text-neutral-100">
                {title}
            </h2>

            {!hasItems ? (
                <p className="text-neutral-500 dark:text-neutral-400">
                    {emptyMessage}
                </p>
            ) : (
                <div className="group relative">
                    {/* Left scroll button */}
                    {showLeftArrow && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white group-hover:block dark:bg-neutral-800/90 dark:hover:bg-neutral-800"
                            aria-label="Scroll left"
                        >
                            <FiChevronLeft className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
                        </motion.button>
                    )}

                    {/* Scrollable container */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={checkScrollPosition}
                        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth px-2 pb-2"
                    >
                        {children}
                    </div>

                    {/* Left fade overlay */}
                    <div className="pointer-events-none absolute top-0 left-0 h-full w-5 bg-gradient-to-r from-white to-transparent dark:from-neutral-900" />

                    {/* Right fade overlay */}
                    <div className="pointer-events-none absolute top-0 right-0 h-full w-5 bg-gradient-to-l from-white to-transparent dark:from-neutral-900" />

                    {/* Right scroll button */}
                    {showRightArrow && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white group-hover:block dark:bg-neutral-800/90 dark:hover:bg-neutral-800"
                            aria-label="Scroll right"
                        >
                            <FiChevronRight className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
                        </motion.button>
                    )}
                </div>
            )}
        </div>
    );
};

export default HorizontalScrollSection;
