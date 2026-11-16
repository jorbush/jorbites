'use client';

import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export interface SearchBarProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
    onClear?: () => void;
    placeholder: string;
    clearLabel?: string;
    submitLabel?: string;
    showSubmitButton?: boolean;
    disabled?: boolean;
    className?: string;
    inputWrapperClassName?: string;
    inputClassName?: string;
    dataTestId?: string;
    dataCy?: string;
    clearTestId?: string;
    clearDataCy?: string;
    submitTestId?: string;
    submitDataCy?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    id,
    value,
    onChange,
    onSubmit,
    onClear,
    placeholder,
    clearLabel = 'Clear search',
    submitLabel = 'Search',
    showSubmitButton = false,
    disabled = false,
    className = '',
    inputWrapperClassName = 'w-full sm:max-w-sm',
    inputClassName = '',
    dataTestId,
    dataCy,
    clearTestId,
    clearDataCy,
    submitTestId,
    submitDataCy,
}) => {
    const inputId = id ?? dataTestId ?? dataCy ?? 'search-bar-input';
    const resolvedClearTestId =
        clearTestId ?? (dataTestId ? `${dataTestId}-clear` : undefined);
    const resolvedClearDataCy =
        clearDataCy ?? (dataCy ? `${dataCy}-clear` : undefined);
    const resolvedSubmitTestId =
        submitTestId ?? (dataTestId ? `${dataTestId}-submit` : undefined);
    const resolvedSubmitDataCy =
        submitDataCy ?? (dataCy ? `${dataCy}-submit` : undefined);

    const handleClear = () => {
        onChange('');
        onClear?.();
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit?.();
    };

    const content = (
        <div
            className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className}`}
        >
            <div className={`relative ${inputWrapperClassName}`}>
                <label
                    htmlFor={inputId}
                    className="sr-only"
                >
                    {placeholder}
                </label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <FiSearch
                        className="size-4 text-neutral-400"
                        aria-hidden="true"
                    />
                </div>
                <input
                    id={inputId}
                    type="text"
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`focus:border-green-450 focus:ring-green-450/30 dark:focus:border-green-450 w-full rounded-xl border border-neutral-200/80 bg-white/80 py-2 pr-9 pl-10 text-base text-neutral-900 shadow-2xs transition-colors duration-200 outline-none placeholder:text-neutral-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:text-white dark:placeholder:text-neutral-500 ${inputClassName}`}
                    data-testid={dataTestId}
                    data-cy={dataCy}
                    aria-label={placeholder}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={disabled}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-1 text-neutral-400 transition-colors duration-200 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-neutral-200"
                        aria-label={clearLabel}
                        data-testid={resolvedClearTestId}
                        data-cy={resolvedClearDataCy}
                    >
                        <FiX className="size-4" />
                    </button>
                )}
            </div>

            {showSubmitButton && onSubmit && (
                <button
                    type="submit"
                    disabled={disabled}
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                    data-testid={resolvedSubmitTestId}
                    data-cy={resolvedSubmitDataCy}
                >
                    {submitLabel}
                </button>
            )}
        </div>
    );

    if (onSubmit) {
        return <form onSubmit={handleFormSubmit}>{content}</form>;
    }

    return content;
};

export default SearchBar;
