'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/navigation/Heading';
import SearchInput from '@/app/components/inputs/SearchInput';
import Avatar from '@/app/components/utils/Avatar';
import { FiSearch } from 'react-icons/fi';
import { AiFillDelete } from 'react-icons/ai';
import Image from 'next/image';
import debounce from 'lodash/debounce';

interface RelatedContentStepProps {
    isLoading: boolean;
    selectedCoCooks: any[];
    selectedLinkedRecipes: any[];
    onAddCoCook: (user: any) => void;
    onRemoveCoCook: (userId: string) => void;
    onAddLinkedRecipe: (recipe: any) => void;
    onRemoveLinkedRecipe: (recipeId: string) => void;
}

const RelatedContentStep: React.FC<RelatedContentStepProps> = ({
    isLoading,
    selectedCoCooks,
    selectedLinkedRecipes,
    onAddCoCook,
    onRemoveCoCook,
    onAddLinkedRecipe,
    onRemoveLinkedRecipe,
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'users' | 'recipes'>('users');
    const [searchResults, setSearchResults] = useState<{
        users: any[];
        recipes: any[];
    }>({ users: [], recipes: [] });

    const debouncedSearch = useRef(
        debounce(
            async (
                query: string,
                type: string,
                tFunction: Function,
                setResults: Function
            ) => {
                if (query.length < 2) {
                    setResults({ users: [], recipes: [] });
                    return;
                }

                try {
                    const response = await axios.get(
                        `/api/search?q=${encodeURIComponent(query)}&type=${type}`
                    );
                    setResults(response.data);
                } catch (error) {
                    console.error('Search failed:', error);
                    toast.error(tFunction('search_failed') || 'Search failed');
                }
            },
            300
        )
    ).current;

    const handleSearch = useCallback(
        (query: string) => {
            debouncedSearch(query, searchType, t, setSearchResults);
        },
        [debouncedSearch, searchType, t]
    );

    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery, handleSearch]);

    return (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('related_content') || 'Related Content'}
                subtitle={
                    t('related_content_subtitle') ||
                    'Add co-cooks and related recipes'
                }
            />

            {/* Tab selection for co-cooks vs related recipes */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    className={`flex-1 px-4 py-2 text-center ${
                        searchType === 'users'
                            ? 'border-green-450 text-green-450 border-b-2 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => {
                        setSearchType('users');
                        setSearchQuery('');
                    }}
                >
                    {t('co_cooks') || 'Co-Cooks'}
                </button>
                <button
                    className={`flex-1 px-4 py-2 text-center ${
                        searchType === 'recipes'
                            ? 'border-green-450 text-green-450 border-b-2 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => {
                        setSearchType('recipes');
                        setSearchQuery('');
                    }}
                >
                    {t('linked_recipes') || 'Linked Recipes'}
                </button>
            </div>

            {/* Search input with integrated dropdown */}
            <div className="relative">
                <SearchInput
                    id="search"
                    label={
                        searchType === 'users'
                            ? t('search_users') || 'Search Users'
                            : t('search_recipes') || 'Search Recipes'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading}
                    dataCy="search-input"
                    icon={FiSearch}
                    results={searchResults}
                    onSelectResult={(result) => {
                        if (searchType === 'users') {
                            onAddCoCook(result);
                        } else {
                            onAddLinkedRecipe(result);
                        }
                        setSearchQuery('');
                    }}
                    searchType={searchType}
                    maxSelected={searchType === 'users' ? 4 : 2}
                    isSelected={(id) =>
                        searchType === 'users'
                            ? selectedCoCooks.some((cook) => cook.id === id)
                            : selectedLinkedRecipes.some(
                                  (recipe) => recipe.id === id
                              )
                    }
                    emptyMessage={
                        searchType === 'users'
                            ? t('no_users_found') || 'No users found'
                            : t('no_recipes_found') || 'No recipes found'
                    }
                />
            </div>

            {/* Display of selected items */}
            <div className="space-y-4">
                {/* Selected co-cooks */}
                {searchType === 'users' && selectedCoCooks.length > 0 && (
                    <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t('selected_co_cooks') || 'Selected Co-Cooks'}
                            <span className="ml-1 text-xs text-gray-400">
                                ({selectedCoCooks.length}/4)
                            </span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedCoCooks.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-2 rounded-full bg-gray-100 py-1 pr-2 pl-1 dark:bg-gray-800"
                                >
                                    <Avatar
                                        src={user.image}
                                        size={24}
                                    />
                                    <span className="text-sm dark:text-neutral-100">
                                        {user.name}
                                    </span>
                                    <button
                                        onClick={() => onRemoveCoCook(user.id)}
                                        className="ml-1 text-gray-500 hover:text-rose-500"
                                    >
                                        <AiFillDelete size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Selected linked recipes */}
                {searchType === 'recipes' &&
                    selectedLinkedRecipes.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t('selected_linked_recipes') ||
                                    'Selected Linked Recipes'}
                                <span className="ml-1 text-xs text-gray-400">
                                    ({selectedLinkedRecipes.length}/2)
                                </span>
                            </h3>
                            <div className="flex flex-col gap-2">
                                {selectedLinkedRecipes.map((recipe) => (
                                    <div
                                        key={recipe.id}
                                        className="flex items-center justify-between rounded-lg border p-2 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                                <Image
                                                    src={
                                                        recipe.imageSrc ||
                                                        '/advocado.webp'
                                                    }
                                                    fill
                                                    className="object-cover"
                                                    alt={recipe.title}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium dark:text-neutral-100">
                                                    {recipe.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {recipe.user.name}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                onRemoveLinkedRecipe(recipe.id)
                                            }
                                            className="text-gray-500 hover:text-rose-500"
                                        >
                                            <AiFillDelete size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default RelatedContentStep;
