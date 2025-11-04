'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    renderButton: (
        isOpen: boolean,
        selectedValue: string,
        selectedLabel: string
    ) => ReactNode;
    ariaLabel?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    renderButton,
    ariaLabel,
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

    const handleOptionClick = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedLabel =
        options.find((option) => option.value === value)?.label || '';

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                role="button"
                className="cursor-pointer"
            >
                {renderButton(isOpen, value, selectedLabel)}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="dark:bg-dark absolute top-full right-0 z-50 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:text-neutral-100"
                    >
                        <div className="w-max cursor-pointer">
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() =>
                                        handleOptionClick(option.value)
                                    }
                                    className={`flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                        value === option.value
                                            ? 'bg-green-450/10 text-green-450 dark:bg-green-450/20 dark:text-green-450'
                                            : 'text-neutral-700 dark:text-neutral-300'
                                    }`}
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
};

export default Dropdown;
