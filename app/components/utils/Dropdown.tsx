'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

interface DropdownOption<T> {
    value: T;
    label: string;
}

interface DropdownProps<T> {
    options: DropdownOption<T>[];
    value: T;
    onChange: (value: T) => void;
    buttonContent?: ReactNode;
    ariaLabel?: string;
    showChevron?: boolean;
    showNotification?: boolean;
    className?: string;
    dropdownClassName?: string;
    optionClassName?: (option: DropdownOption<T>, isSelected: boolean) => string;
}

function Dropdown<T extends string>({
    options,
    value,
    onChange,
    buttonContent,
    ariaLabel,
    showChevron = true,
    showNotification = false,
    className = '',
    dropdownClassName = '',
    optionClassName,
}: DropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
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

    const handleOptionClick = (optionValue: T) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const getOptionClassName = (option: DropdownOption<T>) => {
        const isSelected = option.value === value;
        if (optionClassName) {
            return optionClassName(option, isSelected);
        }
        return `flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
            isSelected
                ? 'bg-green-450/10 text-green-450 dark:bg-green-450/20 dark:text-green-450'
                : 'text-neutral-700 dark:text-neutral-300'
        }`;
    };

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={
                    className ||
                    'relative flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-2 text-sm text-neutral-600 shadow-xs transition hover:bg-neutral-200 hover:shadow-md lg:px-3 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }
                aria-label={ariaLabel}
                aria-expanded={isOpen}
            >
                {buttonContent}
                {showChevron && (
                    <FiChevronDown
                        size={14}
                        className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}
                {showNotification && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={
                            dropdownClassName ||
                            'dark:bg-dark absolute top-full right-0 z-50 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:text-neutral-100'
                        }
                    >
                        <div className="w-max cursor-pointer">
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() =>
                                        handleOptionClick(option.value)
                                    }
                                    className={getOptionClassName(option)}
                                >
                                    <span className="whitespace-nowrap">
                                        {option.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Dropdown;
