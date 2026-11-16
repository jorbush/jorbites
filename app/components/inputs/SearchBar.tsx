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

const DEFAULT_WRAPPER_CLASS = 'w-full sm:max-w-sm';

function resolveSearchBarConfig(props: SearchBarProps) {
    const {
        id,
        dataTestId,
        dataCy,
        clearTestId,
        clearDataCy,
        submitTestId,
        submitDataCy,
        clearLabel,
        submitLabel,
        className,
        inputWrapperClassName,
        inputClassName,
    } = props;

    return {
        inputId: id ?? dataTestId ?? dataCy ?? 'search-bar-input',
        clearTestId:
            clearTestId ?? (dataTestId ? `${dataTestId}-clear` : undefined),
        clearDataCy: clearDataCy ?? (dataCy ? `${dataCy}-clear` : undefined),
        submitTestId:
            submitTestId ?? (dataTestId ? `${dataTestId}-submit` : undefined),
        submitDataCy: submitDataCy ?? (dataCy ? `${dataCy}-submit` : undefined),
        clearLabel: clearLabel ?? 'Clear search',
        submitLabel: submitLabel ?? 'Search',
        className: className ?? '',
        inputWrapperClassName: inputWrapperClassName ?? DEFAULT_WRAPPER_CLASS,
        inputClassName: inputClassName ?? '',
        disabled: Boolean(props.disabled),
        showSubmit: Boolean(props.showSubmitButton && props.onSubmit),
    };
}

interface SearchClearButtonProps {
    onClick: () => void;
    disabled: boolean;
    ariaLabel: string;
    dataTestId?: string;
    dataCy?: string;
}

const SearchClearButton: React.FC<SearchClearButtonProps> = ({
    onClick,
    disabled,
    ariaLabel,
    dataTestId,
    dataCy,
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-1 text-neutral-400 transition-colors duration-200 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-neutral-200"
        aria-label={ariaLabel}
        data-testid={dataTestId}
        data-cy={dataCy}
    >
        <FiX className="size-4" />
    </button>
);

interface SearchSubmitButtonProps {
    label: string;
    disabled: boolean;
    dataTestId?: string;
    dataCy?: string;
}

const SearchSubmitButton: React.FC<SearchSubmitButtonProps> = ({
    label,
    disabled,
    dataTestId,
    dataCy,
}) => (
    <button
        type="submit"
        disabled={disabled}
        className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        data-testid={dataTestId}
        data-cy={dataCy}
    >
        {label}
    </button>
);

const SearchBar: React.FC<SearchBarProps> = (props) => {
    const {
        value,
        onChange,
        onSubmit,
        onClear,
        placeholder,
        dataTestId,
        dataCy,
    } = props;
    const config = resolveSearchBarConfig(props);

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
            className={`flex flex-col gap-3 sm:flex-row sm:items-center ${config.className}`}
        >
            <div className={`relative ${config.inputWrapperClassName}`}>
                <label
                    htmlFor={config.inputId}
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
                    id={config.inputId}
                    type="text"
                    value={value}
                    disabled={config.disabled}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`focus:border-green-450 focus:ring-green-450/30 dark:focus:border-green-450 w-full rounded-xl border border-neutral-200/80 bg-white/80 py-2 pr-9 pl-10 text-base text-neutral-900 shadow-2xs transition-colors duration-200 outline-none placeholder:text-neutral-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:text-white dark:placeholder:text-neutral-500 ${config.inputClassName}`}
                    data-testid={dataTestId}
                    data-cy={dataCy}
                    aria-label={placeholder}
                />
                {Boolean(value) && (
                    <SearchClearButton
                        onClick={handleClear}
                        disabled={config.disabled}
                        ariaLabel={config.clearLabel}
                        dataTestId={config.clearTestId}
                        dataCy={config.clearDataCy}
                    />
                )}
            </div>

            {config.showSubmit && (
                <SearchSubmitButton
                    label={config.submitLabel}
                    disabled={config.disabled}
                    dataTestId={config.submitTestId}
                    dataCy={config.submitDataCy}
                />
            )}
        </div>
    );

    if (onSubmit) {
        return <form onSubmit={handleFormSubmit}>{content}</form>;
    }

    return content;
};

export default SearchBar;
