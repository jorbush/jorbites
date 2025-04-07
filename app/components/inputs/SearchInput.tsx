'use client';

import { IconType } from 'react-icons';
import { Fragment } from 'react';
import Avatar from '@/app/components/utils/Avatar';
import Image from 'next/image';
import { AiOutlinePlus } from 'react-icons/ai';
import VerificationBadge from '@/app/components/VerificationBadge';

interface SearchResult {
    id: string;
    name?: string;
    image?: string;
    title?: string;
    imageSrc?: string;
    user?: {
        name: string;
        image: string;
    };
    verified?: boolean;
    level?: number;
}

interface SearchInputProps {
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
    };
    onSelectResult?: (result: SearchResult) => void;
    searchType: 'users' | 'recipes';
    maxSelected?: number;
    isSelected?: (id: string) => boolean;
    emptyMessage?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
    id,
    label,
    type = 'text',
    disabled,
    value,
    onChange,
    icon: Icon,
    dataCy,
    results = { users: [], recipes: [] },
    onSelectResult,
    searchType,
    maxSelected = 0,
    isSelected,
    emptyMessage = 'No results found',
}) => {
    const hasResults =
        searchType === 'users'
            ? results.users && results.users.length > 0
            : results.recipes && results.recipes.length > 0;

    const searchResults =
        searchType === 'users' ? results.users || [] : results.recipes || [];

    const showResults = value.length >= 2;

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
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                    placeholder=" "
                    type={type}
                    className={`peer w-full rounded-md border-2 bg-white p-4 pt-6 font-light outline-hidden transition disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-neutral-100 ${Icon ? 'pl-9' : 'pl-4'} border-neutral-300 focus:border-black dark:focus:border-white ${showResults && hasResults ? 'rounded-b-none border-b-0' : ''}`}
                    data-cy={dataCy}
                />
                <label
                    htmlFor={id}
                    className={`text-md absolute top-5 z-10 origin-[0] -translate-y-3 transform duration-150 ${Icon ? 'left-9' : 'left-4'} text-zinc-400 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75`}
                >
                    {label}
                </label>
            </div>

            {/* Dropdown results */}
            {showResults && (
                <div
                    className={`absolute z-20 w-full rounded-b-md border-2 border-t-0 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 ${!hasResults ? 'border-t-2' : ''}`}
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                    {hasResults
                        ? searchResults.map((result) => (
                              <div
                                  key={result.id}
                                  className={`flex cursor-pointer items-center justify-between gap-2 border-t border-gray-100 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${isSelected && isSelected(result.id) ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                  onClick={() =>
                                      onSelectResult && onSelectResult(result)
                                  }
                              >
                                  {searchType === 'users' ? (
                                      <Fragment>
                                          <div className="flex items-center gap-2">
                                              <Avatar
                                                  src={result.image}
                                                  size={32}
                                              />
                                              <div className="flex items-center">
                                                  <span className="font-medium dark:text-neutral-100">
                                                      {result.name}
                                                  </span>
                                                  {result.verified && (
                                                      <VerificationBadge className="ml-1" />
                                                  )}
                                              </div>
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                  Level {result.level}
                                              </span>
                                          </div>
                                      </Fragment>
                                  ) : (
                                      <Fragment>
                                          <div className="flex items-center gap-3">
                                              <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                                  <Image
                                                      src={
                                                          result.imageSrc ||
                                                          '/avocado.webp'
                                                      }
                                                      fill
                                                      className="object-cover"
                                                      alt={
                                                          result.title ||
                                                          'Recipe'
                                                      }
                                                  />
                                              </div>
                                              <div className="flex flex-col">
                                                  <span className="font-medium dark:text-neutral-100">
                                                      {result.title}
                                                  </span>
                                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                                      {result.user?.name}
                                                  </span>
                                              </div>
                                          </div>
                                      </Fragment>
                                  )}
                                  {onSelectResult && (
                                      <button
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              onSelectResult(result);
                                          }}
                                          disabled={
                                              (isSelected &&
                                                  isSelected(result.id)) ||
                                              (maxSelected > 0 &&
                                                  isSelected &&
                                                  searchResults.filter((r) =>
                                                      isSelected(r.id)
                                                  ).length >= maxSelected)
                                          }
                                          className={`rounded-full p-1 ${isSelected && isSelected(result.id) ? 'text-gray-400' : 'text-green-450 hover:bg-green-100 dark:hover:bg-green-900'}`}
                                      >
                                          <AiOutlinePlus size={20} />
                                      </button>
                                  )}
                              </div>
                          ))
                        : value.length >= 2 && (
                              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                  {emptyMessage}
                              </div>
                          )}
                </div>
            )}
        </div>
    );
};

export default SearchInput;
