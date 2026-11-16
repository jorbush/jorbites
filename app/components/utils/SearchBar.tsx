'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiX } from 'react-icons/fi';

export interface SearchBarProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder: string;
    clearLabel?: string;
    className?: string;
    inputWrapperClassName?: string;
    dataTestId?: string;
    clearDataTestId?: string;
    dataCy?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    id = 'search-input',
    value,
    onChange,
    onClear,
    onKeyDown,
    placeholder,
    clearLabel,
    className = '',
    inputWrapperClassName = 'relative w-full sm:max-w-xs',
    dataTestId,
    clearDataTestId,
    dataCy,
}) => {
    const { t } = useTranslation();
    const resolvedClearLabel =
        clearLabel ?? String(t('clear_search', 'Clear search'));

    const handleClear = () => {
        if (onClear) {
            onClear();
            return;
        }
        onChange('');
    };

    return (
        <div className={`flex justify-end ${className}`.trim()}>
            <div className={inputWrapperClassName}>
                <label
                    htmlFor={id}
                    className="sr-only"
                >
                    {placeholder}
                </label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <FiSearch className="size-4 text-neutral-400" />
                </div>
                <input
                    id={id}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-xl border border-neutral-200/80 bg-white/80 py-2 pr-9 pl-10 text-base text-neutral-900 shadow-2xs transition-colors duration-200 outline-none placeholder:text-neutral-400 focus:ring-2 md:text-sm dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:text-white dark:placeholder:text-neutral-500"
                    data-testid={dataTestId}
                    data-cy={dataCy}
                    aria-label={placeholder}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-1 text-neutral-400 transition-colors duration-200 hover:text-neutral-600 dark:hover:text-neutral-200"
                        aria-label={resolvedClearLabel}
                        data-testid={clearDataTestId}
                    >
                        <FiX className="size-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export interface EmptySearchResultsProps {
    message: string;
    clearLabel?: string;
    onClearSearch?: () => void;
    dataTestId?: string;
    clearDataTestId?: string;
    className?: string;
}

export const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
    message,
    clearLabel,
    onClearSearch,
    dataTestId,
    clearDataTestId,
    className = '',
}) => {
    const { t } = useTranslation();
    const resolvedClearLabel =
        clearLabel ?? String(t('clear_search', 'Clear search'));

    return (
        <div
            className={`rounded-2xl border border-neutral-200/80 bg-white/80 px-6 py-10 text-center dark:border-neutral-800/80 dark:bg-neutral-900/60 ${className}`.trim()}
            data-testid={dataTestId}
        >
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {message}
            </p>
            {onClearSearch && (
                <button
                    type="button"
                    onClick={onClearSearch}
                    className="mt-3 cursor-pointer text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
                    data-testid={clearDataTestId}
                >
                    {resolvedClearLabel}
                </button>
            )}
        </div>
    );
};

export default SearchBar;
