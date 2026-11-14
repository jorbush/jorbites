'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface HorizontalScrollSectionProps {
    title: string;
    emptyMessage?: string;
    children: React.ReactNode;
    hasItems: boolean;
    fadeColorClassName?: string;
}

// Constants for scroll behavior
const SCROLL_TOLERANCE = 10; // Pixel tolerance for edge detection
const SCROLL_PERCENTAGE = 0.8; // Percentage of viewport width to scroll

const HorizontalScrollSection: React.FC<HorizontalScrollSectionProps> = ({
    title,
    emptyMessage = 'No items found',
    children,
    hasItems,
    fadeColorClassName = 'from-white dark:from-dark',
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    const checkScrollPosition = useCallback(() => {
        if (!scrollContainerRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } =
            scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < maxScroll - SCROLL_TOLERANCE);
        setScrollProgress(
            maxScroll > 0 ? Math.min(1, Math.max(0, scrollLeft / maxScroll)) : 0
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

    // Set up ResizeObserver to check scroll position on container size or content size changes
    const checkScrollPositionRef = useRef(checkScrollPosition);

    useEffect(() => {
        checkScrollPositionRef.current = checkScrollPosition;
    }, [checkScrollPosition]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handler = () => {
            checkScrollPositionRef.current();
        };

        if (typeof ResizeObserver === 'undefined') {
            handler();
            window.addEventListener('resize', handler);
            return () => window.removeEventListener('resize', handler);
        }

        const resizeObserver = new ResizeObserver(handler);
        resizeObserver.observe(container);

        // Initial check
        handler();

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const isScrollable = showLeftArrow || showRightArrow;

    return (
        <div className="mb-10">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold dark:text-neutral-100">
                    {title}
                </h2>
                {hasItems && isScrollable && (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            disabled={!showLeftArrow}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 text-neutral-700 shadow-2xs transition-colors duration-200 hover:bg-neutral-100 disabled:cursor-default disabled:opacity-35 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-700"
                            aria-label="Scroll left"
                        >
                            <FiChevronLeft className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            disabled={!showRightArrow}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 text-neutral-700 shadow-2xs transition-colors duration-200 hover:bg-neutral-100 disabled:cursor-default disabled:opacity-35 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-700"
                            aria-label="Scroll right"
                        >
                            <FiChevronRight className="size-4" />
                        </button>
                    </div>
                )}
            </div>

            {!hasItems ? (
                <p className="text-neutral-500 dark:text-neutral-400">
                    {emptyMessage}
                </p>
            ) : (
                <>
                    <div className="group/scroll relative">
                        {/* Left scroll button (desktop hover) */}
                        {showLeftArrow && (
                            <button
                                type="button"
                                onClick={() => scroll('left')}
                                className="absolute top-1/2 left-0 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 shadow-lg transition-[opacity,background-color] duration-200 ease-in-out hover:bg-white md:group-hover/scroll:block dark:bg-neutral-800/90 dark:hover:bg-neutral-800"
                                aria-label="Scroll left"
                            >
                                <FiChevronLeft className="size-6 text-neutral-700 dark:text-neutral-200" />
                            </button>
                        )}

                        {/* Scrollable container */}
                        <div
                            ref={scrollContainerRef}
                            onScroll={checkScrollPosition}
                            className="scrollbar-hide flex snap-x snap-mandatory scroll-px-1 gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:scroll-px-3 sm:px-3"
                        >
                            {children}
                        </div>

                        {/* Left fade overlay */}
                        {showLeftArrow && (
                            <div
                                className={`pointer-events-none absolute top-0 left-0 hidden h-full w-6 bg-gradient-to-r to-transparent md:block ${fadeColorClassName}`}
                            />
                        )}

                        {/* Right fade overlay */}
                        {showRightArrow && (
                            <div
                                className={`pointer-events-none absolute top-0 right-0 hidden h-full w-10 bg-gradient-to-l to-transparent md:block ${fadeColorClassName}`}
                            />
                        )}

                        {/* Right scroll button (desktop hover) */}
                        {showRightArrow && (
                            <button
                                type="button"
                                onClick={() => scroll('right')}
                                className="absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 shadow-lg transition-[opacity,background-color] duration-200 ease-in-out hover:bg-white md:group-hover/scroll:block dark:bg-neutral-800/90 dark:hover:bg-neutral-800"
                                aria-label="Scroll right"
                            >
                                <FiChevronRight className="size-6 text-neutral-700 dark:text-neutral-200" />
                            </button>
                        )}
                    </div>

                    {/* Minimalist mobile scroll indicator */}
                    {isScrollable && (
                        <div
                            className="mt-2 flex justify-center md:hidden"
                            aria-hidden="true"
                        >
                            <div className="h-1 w-16 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
                                <div
                                    className="bg-green-450 h-full w-6 rounded-full transition-transform duration-150"
                                    style={{
                                        transform: `translateX(${scrollProgress * 40}px)`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HorizontalScrollSection;
