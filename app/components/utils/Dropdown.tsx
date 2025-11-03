'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownProps {
    buttonContent: ReactNode;
    children: ReactNode;
    buttonAriaLabel: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    buttonContent,
    children,
    buttonAriaLabel,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-2 text-sm text-neutral-600 shadow-xs transition hover:bg-neutral-200 hover:shadow-md lg:px-3 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                aria-label={buttonAriaLabel}
                aria-expanded={isOpen}
            >
                {buttonContent}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="dark:bg-dark absolute top-full right-0 z-50 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:text-neutral-100"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-max cursor-pointer">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;
