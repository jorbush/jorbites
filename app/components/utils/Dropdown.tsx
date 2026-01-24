'use client';

import { useState, useRef, useEffect, ReactNode, KeyboardEvent } from 'react';
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
    chevronClassName?: string;
    showNotification?: boolean;
    className?: string;
    dropdownClassName?: string;
    optionClassName?: (
        option: DropdownOption<T>,
        isSelected: boolean
    ) => string;
    'data-cy'?: string;
}

function Dropdown<T extends string>({
    options,
    value,
    onChange,
    buttonContent,
    ariaLabel,
    showChevron = true,
    chevronClassName = '',
    showNotification = false,
    className = '',
    dropdownClassName = '',
    optionClassName,
    'data-cy': dataCy,
}: DropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);

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
            const currentIndex = options.findIndex(
                (opt) => opt.value === value
            );
            setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            setFocusedIndex(-1);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, options, value]);

    const handleOptionClick = (optionValue: T) => {
        onChange(optionValue);
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
            } else {
                setFocusedIndex((prev) =>
                    prev < options.length - 1 ? prev + 1 : prev
                );
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (isOpen) {
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (isOpen && focusedIndex >= 0) {
                handleOptionClick(options[focusedIndex].value);
            } else {
                setIsOpen(!isOpen);
            }
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setIsOpen(false);
            buttonRef.current?.focus();
        } else if (event.key === 'Home') {
            event.preventDefault();
            if (isOpen) {
                setFocusedIndex(0);
            }
        } else if (event.key === 'End') {
            event.preventDefault();
            if (isOpen) {
                setFocusedIndex(options.length - 1);
            }
        }
    };

    const getOptionClassName = (option: DropdownOption<T>, index: number) => {
        const isSelected = option.value === value;
        const isFocused = index === focusedIndex;
        if (optionClassName) {
            return optionClassName(option, isSelected);
        }
        return `flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition border-0 bg-transparent ${
            isFocused
                ? 'bg-neutral-200 dark:bg-neutral-600'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
        } ${
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
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className={
                    className ||
                    'relative flex cursor-pointer items-center gap-1 rounded-full bg-neutral-100 px-2 py-2 text-sm text-neutral-600 shadow-xs transition hover:bg-neutral-200 hover:shadow-md lg:px-3 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                data-cy={dataCy}
            >
                {buttonContent}
                {showChevron && (
                    <FiChevronDown
                        size={14}
                        className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${chevronClassName}`}
                    />
                )}
                {showNotification && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                )}
            </button>

            {isOpen && (
                <div
                    className={`${
                        dropdownClassName ||
                        'dark:bg-dark absolute top-full right-0 z-50 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:text-neutral-100'
                    } animate-dropdown-open`}
                    style={{
                        animation: 'dropdownFadeIn 0.2s ease-out forwards',
                    }}
                >
                    <div
                        ref={listboxRef}
                        role="listbox"
                        aria-label={ariaLabel}
                        className="w-max"
                    >
                        {options.map((option, index) => (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={option.value === value}
                                onClick={() => handleOptionClick(option.value)}
                                className={getOptionClassName(option, index)}
                            >
                                <span className="whitespace-nowrap">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dropdown;
