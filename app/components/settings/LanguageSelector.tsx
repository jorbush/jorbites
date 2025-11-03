'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

interface LanguageOption {
    value: string;
    label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
    { value: 'es', label: 'Castellano' },
    { value: 'en', label: 'English' },
    { value: 'ca', label: 'Català' },
];

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = i18n.language || LANGUAGE_OPTIONS[0].value;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLanguageChange = (languageValue: string) => {
        i18n.changeLanguage(languageValue);
        setIsDropdownOpen(false);
    };

    const getCurrentLanguageLabel = () => {
        const option = LANGUAGE_OPTIONS.find(
            (lang) => lang.value === currentLanguage
        );
        return option?.label || LANGUAGE_OPTIONS[0].label;
    };

    return (
        <div
            className="relative inline-flex flex-col gap-2"
            data-cy="language-selector"
        >
            <div className="flex-1">
                <p className="text-left">{t('select_your_language')}</p>
            </div>
            <div
                className="relative"
                ref={dropdownRef}
            >
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    aria-label={
                        t('select_your_language') || 'Select your language'
                    }
                    aria-expanded={isDropdownOpen}
                    data-cy="language-dropdown"
                >
                    <span>{getCurrentLanguageLabel()}</span>
                    <FiChevronDown
                        size={14}
                        className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="dark:bg-dark absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:text-neutral-100"
                        >
                            <div className="cursor-pointer">
                                {LANGUAGE_OPTIONS.map((lang) => (
                                    <div
                                        key={lang.value}
                                        onClick={() =>
                                            handleLanguageChange(lang.value)
                                        }
                                        className={`flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                            currentLanguage === lang.value
                                                ? 'bg-green-450/10 text-green-450 dark:bg-green-450/20 dark:text-green-450'
                                                : 'text-neutral-700 dark:text-neutral-300'
                                        }`}
                                    >
                                        <span className="whitespace-nowrap">
                                            {lang.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LanguageSelector;
