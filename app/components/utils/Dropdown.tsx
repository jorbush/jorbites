'use client';

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    KeyboardEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    ariaLabel?: string;
    buttonClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    ariaLabel,
    buttonClassName,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const handleOptionClick = useCallback(
        (optionValue: string) => {
            onChange(optionValue);
            setIsOpen(false);
        },
        [onChange]
    );

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
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
        switch (event.key) {
            case 'Escape':
                setIsOpen(false);
                break;
            case 'ArrowDown':
                event.preventDefault();
                setFocusedIndex((prevIndex) =>
                    prevIndex < options.length - 1 ? prevIndex + 1 : prevIndex
                );
                break;
            case 'ArrowUp':
                event.preventDefault();
                setFocusedIndex((prevIndex) =>
                    prevIndex > 0 ? prevIndex - 1 : 0
                );
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (focusedIndex !== -1) {
                    handleOptionClick(options[focusedIndex].value);
                } else {
                    setIsOpen(!isOpen);
                }
                break;
            default:
                break;
        }
    };

    const selectedOption = options.find((option) => option.value === value);

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) =>
                    handleKeyDown(e as any)
                }
                className={
                    buttonClassName ||
                    'relative flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-2 text-sm text-neutral-600 shadow-xs transition hover:bg-neutral-200 hover:shadow-md lg:px-3 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                role="combobox"
                tabIndex={0}
            >
                <div className="flex items-center gap-1">
                    <span className="text-sm">{selectedOption?.label}</span>
                    <FiChevronDown
                        size={14}
                        className={`transform transition-transform ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="dark:bg-dark absolute top-full right-0 z-50 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:text-neutral-100"
                        role="listbox"
                    >
                        <div className="w-max cursor-pointer">
                            {options.map((option, index) => (
                                <div
                                    key={option.value}
                                    onClick={() =>
                                        handleOptionClick(option.value)
                                    }
                                    className={`flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                        value === option.value
                                            ? 'bg-green-450/10 text-green-450 dark:bg-green-450/20 dark:text-green-450'
                                            : 'text-neutral-700 dark:text-neutral-300'
                                    } ${
                                        focusedIndex === index
                                            ? 'ring-2 ring-green-450'
                                            : ''
                                    }`}
                                    role="option"
                                    aria-selected={value === option.value}
                                    tabIndex={-1}
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
