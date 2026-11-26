'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FiInfo } from 'react-icons/fi';

export interface InfoTooltipProps {
    text: string;
    ariaLabel: string;
    icon?: React.ReactNode;
    iconSize?: number;
    anchorToParent?: boolean;
    triggerTestId?: string;
    tooltipTestId?: string;
    className?: string;
    triggerClassName?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
    text,
    ariaLabel,
    icon,
    iconSize = 14,
    anchorToParent = false,
    triggerTestId,
    tooltipTestId,
    className = '',
    triggerClassName = '',
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastTouchTimeRef = useRef<number>(0);
    const tooltipId = useId();

    const isOpen = isHovered || isFocused || isPinned;

    const closeAll = useCallback(() => {
        setIsHovered(false);
        setIsFocused(false);
        setIsPinned(false);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                closeAll();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeAll();
            }
        };

        document.addEventListener('mousedown', handlePointerDownOutside);
        document.addEventListener('touchstart', handlePointerDownOutside, {
            passive: true,
        });
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDownOutside);
            document.removeEventListener(
                'touchstart',
                handlePointerDownOutside
            );
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeAll]);

    const handleTouchStart = () => {
        lastTouchTimeRef.current = Date.now();
    };

    const handleMouseEnter = () => {
        if (Date.now() - lastTouchTimeRef.current < 500) return;
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleFocus = () => {
        if (Date.now() - lastTouchTimeRef.current < 500) return;
        setIsFocused(true);
    };

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node)) {
            setIsFocused(false);
            setIsPinned(false);
        }
    };

    const handleClick = () => {
        if (isPinned) {
            closeAll();
        } else {
            setIsPinned(true);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`inline-flex items-center ${anchorToParent ? '' : 'relative'} ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <button
                type="button"
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                aria-describedby={isOpen ? tooltipId : undefined}
                data-testid={triggerTestId}
                onTouchStart={handleTouchStart}
                onClick={handleClick}
                className={`focus-visible:ring-green-450/30 inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors focus:outline-hidden focus-visible:ring-2 ${
                    triggerClassName ||
                    'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
                }`}
            >
                {icon ?? (
                    <FiInfo
                        size={iconSize}
                        aria-hidden="true"
                    />
                )}
            </button>

            {isOpen && (
                <div
                    id={tooltipId}
                    role="tooltip"
                    data-testid={tooltipTestId}
                    className={`absolute bottom-full z-20 mb-2 w-max max-w-[min(18rem,calc(100vw-4rem))] rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-left text-xs leading-relaxed font-normal tracking-normal text-neutral-600 normal-case shadow-lg dark:border-neutral-700/80 dark:bg-neutral-900 dark:text-neutral-300 ${
                        anchorToParent ? 'left-0' : 'left-1/2 -translate-x-1/2'
                    }`}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

export default InfoTooltip;
