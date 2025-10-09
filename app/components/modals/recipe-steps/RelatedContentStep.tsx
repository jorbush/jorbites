'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/navigation/Heading';
import SearchInput from '@/app/components/inputs/SearchInput';
import Avatar from '@/app/components/utils/Avatar';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { AiFillDelete } from 'react-icons/ai';
import { IoRestaurantOutline } from 'react-icons/io5';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import debounce from 'lodash/debounce';
import Input from '@/app/components/inputs/Input';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';

interface RelatedContentStepProps {
    isLoading: boolean;
    selectedCoCooks: any[];
    selectedLinkedRecipes: any[];
    onAddCoCook: (user: any) => void;
    onRemoveCoCook: (userId: string) => void;
    onAddLinkedRecipe: (recipe: any) => void;
    onRemoveLinkedRecipe: (recipeId: string) => void;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    youtubeUrl: string;
    onYoutubeUrlChange: (value: string) => void;
}

const RelatedContentStep: React.FC<RelatedContentStepProps> = ({
    isLoading,
    selectedCoCooks,
    selectedLinkedRecipes,
    onAddCoCook,
    onRemoveCoCook,
    onAddLinkedRecipe,
    onRemoveLinkedRecipe,
    register,
    errors,
    youtubeUrl,
    onYoutubeUrlChange,
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'users' | 'recipes'>('users');
    const [searchResults, setSearchResults] = useState<{
        users: any[];
        recipes: any[];
    }>({ users: [], recipes: [] });

    // Define tabs for the component
    const tabs: Tab[] = [
        {
            id: 'users',
            label: t('co_cooks') || 'Co-Cooks',
            icon: <FiUsers />,
        },
        {
            id: 'recipes',
            label: t('linked_recipes') || 'Linked Recipes',
            icon: <IoRestaurantOutline />,
        },
    ];

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

    const handleTabChange = (tabId: string) => {
        setSearchType(tabId as 'users' | 'recipes');
        setSearchQuery('');
    };

    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery, handleSearch]);

    return (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('related_content') || 'Related Content'}
                subtitle={
                    t('related_content_subtitle') ||
                    'Add co-cooks, related recipes, and YouTube video'
                }
            />

            {/* YouTube URL Input */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                    {t('youtube_video') || 'YouTube Video'}
                </h3>
                <Input
                    id="youtubeUrl"
                    label={t('youtube_url') || 'YouTube URL (optional)'}
                    type="url"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    dataCy="youtube-url-input"
                />
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {t('youtube_url_help') ||
                        'Enter a YouTube video URL (e.g., https://youtube.com/watch?v=...)'}
                </p>
            </div>

            {/* Tab selection for co-cooks vs related recipes */}
            <Tabs
                tabs={tabs}
                activeTab={searchType}
                onTabChange={handleTabChange}
                data-testid="related-content-tabs"
            />

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
                        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-zinc-400">
                            {t('selected_co_cooks') || 'Selected Co-Cooks'}
                            <span className="ml-1 text-xs text-gray-400 dark:text-zinc-500">
                                ({selectedCoCooks.length}/4)
                            </span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedCoCooks.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-2 rounded-full bg-gray-100 py-1 pr-2 pl-1 dark:bg-zinc-800"
                                >
                                    <Avatar
                                        src={user.image}
                                        size={24}
                                    />
                                    <span className="text-sm text-zinc-900 dark:text-zinc-100">
                                        {user.name}
                                    </span>
                                    <button
                                        onClick={() => onRemoveCoCook(user.id)}
                                        className="ml-1 text-gray-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-500"
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
                            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-zinc-400">
                                {t('selected_linked_recipes') ||
                                    'Selected Linked Recipes'}
                                <span className="ml-1 text-xs text-gray-400 dark:text-zinc-500">
                                    ({selectedLinkedRecipes.length}/2)
                                </span>
                            </h3>
                            <div className="flex flex-col gap-2">
                                {selectedLinkedRecipes.map((recipe) => (
                                    <div
                                        key={recipe.id}
                                        className="flex items-center justify-between rounded-lg border border-neutral-300 bg-white p-2 dark:border-neutral-600 dark:bg-zinc-800"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                                <CustomProxyImage
                                                    src={
                                                        recipe.imageSrc ||
                                                        '/avocado.webp'
                                                    }
                                                    fill
                                                    className="object-cover"
                                                    alt={recipe.title}
                                                    quality="auto:eco"
                                                    width={40}
                                                    height={40}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    {recipe.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                                    {recipe.user.name}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                onRemoveLinkedRecipe(recipe.id)
                                            }
                                            className="text-gray-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-500"
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
