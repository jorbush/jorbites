'use client';

import React from 'react';
import { IconType } from 'react-icons';
import SearchResultsDropdown from './SearchResultsDropdown';

export interface SearchResult {
    id: string;
    name?: string | null;
    image?: string | null;
    title?: string | null;
    description?: string | null;
    imageSrc?: string | null;
    user?: {
        name?: string | null;
        image?: string | null;
    };
    verified?: boolean;
    level?: number;
}

export interface SearchInputProps {
    id: string;
    label: string;
    type?: string;
    disabled?: boolean;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: IconType;
    dataCy?: string;
    results?: {
        users?: SearchResult[];
        recipes?: SearchResult[];
        quests?: SearchResult[];
    };
    onSelectResult?: (result: SearchResult) => void;
    searchType: 'users' | 'recipes' | 'quests';
    maxSelected?: number;
    isSelected?: (id: string) => boolean;
    emptyMessage?: string;
}

const DEFAULT_RESULTS: NonNullable<SearchInputProps['results']> = {
    users: [],
    recipes: [],
    quests: [],
};

const getSearchResults = (
    results: SearchInputProps['results'] = DEFAULT_RESULTS,
    searchType: SearchInputProps['searchType']
): SearchResult[] => {
    switch (searchType) {
        case 'users':
            return results.users ?? [];
        case 'recipes':
            return results.recipes ?? [];
        case 'quests':
            return results.quests ?? [];
        default:
            return [];
    }
};

const SearchInput: React.FC<SearchInputProps> = ({
    id,
    label,
    type = 'text',
    disabled,
    value,
    onChange,
    icon: Icon,
    dataCy,
    results = DEFAULT_RESULTS,
    onSelectResult,
    searchType,
    maxSelected = 0,
    isSelected,
    emptyMessage = 'No results found',
}) => {
    const searchResults = getSearchResults(results, searchType);
    const hasResults = searchResults.length > 0;
    const showResults = value.length >= 2;

    const inputPadding = Icon ? 'pl-9' : 'pl-4';
    const labelPadding = Icon ? 'left-9' : 'left-4';
    const bottomBorderClass =
        showResults && hasResults ? 'rounded-b-none border-b-0' : '';

    return (
        <div className="relative w-full">
            {/* Input field */}
            <div className="relative">
                {Icon && (
                    <Icon
                        size={24}
                        className="absolute top-5 left-2 text-neutral-700 dark:text-neutral-300"
                    />
                )}
                <input
                    id={id}
                    aria-label={label}
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                    placeholder=" "
                    type={type}
                    className={`peer w-full rounded-md border-2 bg-white p-4 pt-6 font-light outline-hidden transition disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-800 dark:text-neutral-100 ${inputPadding} border-neutral-300 focus:border-black dark:border-neutral-600 dark:focus:border-white ${bottomBorderClass}`}
                    data-cy={dataCy}
                />
                <label
                    htmlFor={id}
                    className={`text-md absolute top-5 z-10 origin-[0] -translate-y-3 transform duration-150 ${labelPadding} text-neutral-400 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 dark:text-neutral-500`}
                >
                    {label}
                </label>
            </div>

            {/* Dropdown results */}
            {showResults && (
                <SearchResultsDropdown
                    searchResults={searchResults}
                    searchType={searchType}
                    hasResults={hasResults}
                    emptyMessage={emptyMessage}
                    isSelected={isSelected}
                    maxSelected={maxSelected}
                    onSelectResult={onSelectResult}
                />
            )}
        </div>
    );
};

export default SearchInput;
