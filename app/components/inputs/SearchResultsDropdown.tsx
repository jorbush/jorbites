'use client';

import React from 'react';
import SearchResultItem from './SearchResultItem';
import type { SearchResult } from './SearchInput';

interface SearchResultsDropdownProps {
    searchResults: SearchResult[];
    searchType: 'users' | 'recipes' | 'quests';
    hasResults: boolean;
    emptyMessage: string;
    isSelected?: (id: string) => boolean;
    maxSelected?: number;
    onSelectResult?: (result: SearchResult) => void;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
    searchResults,
    searchType,
    hasResults,
    emptyMessage,
    isSelected,
    maxSelected = 0,
    onSelectResult,
}) => {
    const isMaxReached =
        maxSelected > 0 &&
        Boolean(isSelected) &&
        searchResults.filter((r) => isSelected?.(r.id)).length >= maxSelected;

    return (
        <div
            className={`absolute z-20 w-full rounded-b-md border-2 border-t-0 bg-white shadow-md dark:border-neutral-600 dark:bg-neutral-800 ${
                !hasResults ? 'border-t-2' : ''
            }`}
            style={{ maxHeight: '300px', overflowY: 'auto' }}
        >
            {hasResults ? (
                searchResults.map((result) => {
                    const isSelectedItem = Boolean(isSelected?.(result.id));
                    const isResultDisabled = isSelectedItem || isMaxReached;

                    return (
                        <SearchResultItem
                            key={result.id}
                            result={result}
                            searchType={searchType}
                            isDisabled={isResultDisabled}
                            isSelected={isSelectedItem}
                            onSelectResult={onSelectResult}
                        />
                    );
                })
            ) : (
                <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                    {emptyMessage}
                </div>
            )}
        </div>
    );
};

export default SearchResultsDropdown;
