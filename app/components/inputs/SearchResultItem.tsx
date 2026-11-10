'use client';

import React from 'react';
import Avatar from '@/app/components/utils/Avatar';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import VerificationBadge from '@/app/components/VerificationBadge';
import { AiOutlinePlus } from 'react-icons/ai';
import type { SearchResult } from './SearchInput';

interface SearchResultItemProps {
    result: SearchResult;
    searchType: 'users' | 'recipes' | 'quests';
    isDisabled: boolean;
    isSelected: boolean;
    onSelectResult?: (result: SearchResult) => void;
}

const UserResultContent: React.FC<{ result: SearchResult }> = ({ result }) => (
    <div className="flex items-center gap-2">
        <Avatar
            src={result.image}
            size={32}
        />
        <div className="flex items-center">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {result.name}
            </span>
            {result.verified && <VerificationBadge className="ml-1" />}
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Level {result.level}
        </span>
    </div>
);

const RecipeResultContent: React.FC<{ result: SearchResult }> = ({
    result,
}) => (
    <div className="flex items-center gap-3">
        <div className="relative size-10 overflow-hidden rounded-md">
            <CustomProxyImage
                src={result.imageSrc || '/avocado.webp'}
                fill
                className="object-cover"
                alt={result.title || 'Recipe'}
                quality="auto:eco"
            />
        </div>
        <div className="flex flex-col">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {result.title}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {result.user?.name}
            </span>
        </div>
    </div>
);

const QuestResultContent: React.FC<{ result: SearchResult }> = ({ result }) => (
    <div className="flex flex-1 flex-col gap-1">
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {result.title}
        </span>
        <span className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
            {result.description}
        </span>
    </div>
);

const SearchResultContent: React.FC<{
    result: SearchResult;
    searchType: 'users' | 'recipes' | 'quests';
}> = ({ result, searchType }) => {
    switch (searchType) {
        case 'users':
            return <UserResultContent result={result} />;
        case 'recipes':
            return <RecipeResultContent result={result} />;
        case 'quests':
            return <QuestResultContent result={result} />;
        default:
            return null;
    }
};

const SearchResultItem: React.FC<SearchResultItemProps> = ({
    result,
    searchType,
    isDisabled,
    isSelected,
    onSelectResult,
}) => {
    return (
        <button
            type="button"
            disabled={isDisabled}
            className={`flex w-full cursor-pointer items-center justify-between gap-2 border-t border-neutral-100 p-3 text-left hover:bg-neutral-50 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-700 ${
                isSelected ? 'bg-neutral-100 dark:bg-neutral-700' : ''
            }`}
            onClick={() => onSelectResult?.(result)}
        >
            <SearchResultContent
                result={result}
                searchType={searchType}
            />
            {onSelectResult && (
                <div
                    className={`rounded-full p-1 ${
                        isSelected
                            ? 'text-neutral-400 dark:text-neutral-500'
                            : 'text-green-450'
                    }`}
                >
                    <AiOutlinePlus size={20} />
                </div>
            )}
        </button>
    );
};

export default SearchResultItem;
