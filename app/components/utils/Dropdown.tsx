'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

export interface DropdownOption<T = string> {
    value: T;
    label: string;
}

interface DropdownProps<T = string> {
    options: DropdownOption<T>[];
    value: T;
    onChange: (value: T) => void;
    label?: string;
    ariaLabel?: string;
    buttonClassName?: string;
    dropdownClassName?: string;
    optionClassName?: string;
    selectedOptionClassName?: string;
    renderButton?: (props: {
        currentLabel: string;
        isOpen: boolean;
    }) => ReactNode;
    align?: 'left' | 'right';
    width?: 'full' | 'auto';
    dataCy?: string;
}

function Dropdown<T = string>({
    options,
    value,
    onChange,
    label,
    ariaLabel,
    buttonClassName = 'flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
    dropdownClassName = 'dark:bg-dark absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:text-neutral-100',
    optionClassName = 'flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700',
    selectedOptionClassName = 'bg-green-450/10 text-green-450 dark:bg-green-450/20 dark:text-green-450',
    renderButton,
    align = 'left',
    width = 'full',
    dataCy,
}: DropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentOption = options.find((opt) => opt.value === value);
    const currentLabel = currentOption?.label || options[0]?.label || '';

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

    const handleSelect = (optionValue: T) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const alignmentClass = align === 'right' ? 'right-0' : 'left-0';
    const widthClass = width === 'full' ? 'w-full' : 'w-max';

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            {renderButton ? (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={ariaLabel || label}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    data-cy={dataCy}
                >
                    {renderButton({ currentLabel, isOpen })}
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={buttonClassName}
                    aria-label={ariaLabel || label}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    data-cy={dataCy}
                >
                    <span>{currentLabel}</span>
                    <FiChevronDown
                        size={14}
                        className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`${dropdownClassName} ${alignmentClass}`}
                        role="listbox"
                    >
                        <div className={`cursor-pointer ${widthClass}`}>
                            {options.map((option) => (
                                <div
                                    key={String(option.value)}
                                    onClick={() => handleSelect(option.value)}
                                    role="option"
                                    aria-selected={value === option.value}
                                    className={`${optionClassName} ${
                                        value === option.value
                                            ? selectedOptionClassName
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
}

export default Dropdown;
