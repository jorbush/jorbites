'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/navigation/Heading';
import SearchInput from '@/app/components/inputs/SearchInput';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import { FiSearch, FiUsers, FiTarget, FiYoutube } from 'react-icons/fi';
import { IoRestaurantOutline } from 'react-icons/io5';
import debounce from 'lodash/debounce';
import Input from '@/app/components/inputs/Input';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import { validateYouTubeUrl } from '@/app/utils/validation';
import { SelectedCoCooksList } from './SelectedCoCooksList';
import { SelectedQuestDisplay } from './SelectedQuestDisplay';
import { SelectedLinkedRecipesList } from './SelectedLinkedRecipesList';

interface RelatedContentStepProps {
    isLoading: boolean;
    selectedCoCooks: any[];
    selectedLinkedRecipes: any[];
    selectedQuest: any | null;
    onAddCoCook: (user: any) => void;
    onRemoveCoCook: (userId: string) => void;
    onAddLinkedRecipe: (recipe: any) => void;
    onRemoveLinkedRecipe: (recipeId: string) => void;
    onSelectQuest: (quest: any) => void;
    onRemoveQuest: () => void;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
}

const RelatedContentStep: React.FC<RelatedContentStepProps> = ({
    isLoading,
    selectedCoCooks,
    selectedLinkedRecipes,
    selectedQuest,
    onAddCoCook,
    onRemoveCoCook,
    onAddLinkedRecipe,
    onRemoveLinkedRecipe,
    onSelectQuest,
    onRemoveQuest,
    register,
    errors,
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<
        'users' | 'recipes' | 'quests' | 'videos'
    >('users');
    const [searchResults, setSearchResults] = useState<{
        users: any[];
        recipes: any[];
        quests: any[];
    }>({ users: [], recipes: [], quests: [] });

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
        {
            id: 'quests',
            label: t('quests') || 'Quests',
            icon: <FiTarget />,
        },
        {
            id: 'videos',
            label: t('videos') || 'Videos',
            icon: <FiYoutube />,
        },
    ];

    const debouncedSearch = useMemo(
        () =>
            debounce(
                async (
                    query: string,
                    type: string,
                    tFunction: Function,
                    setResults: Function
                ) => {
                    if (query.length < 2) {
                        setResults({ users: [], recipes: [], quests: [] });
                        return;
                    }

                    try {
                        if (type === 'quests') {
                            const response = await axios.get(
                                `/api/quests?status=open&q=${encodeURIComponent(query)}`
                            );
                            setResults({
                                users: [],
                                recipes: [],
                                quests: response.data.quests,
                            });
                        } else {
                            const response = await axios.get(
                                `/api/search?q=${encodeURIComponent(query)}&type=${type}`
                            );
                            setResults({ ...response.data, quests: [] });
                        }
                    } catch (error) {
                        console.error('Search failed:', error);
                        toast.error(
                            tFunction('search_failed') || 'Search failed'
                        );
                    }
                },
                300
            ),
        []
    );

    const handleSearch = useCallback(
        (query: string) => {
            debouncedSearch(query, searchType, t, setSearchResults);
        },
        [debouncedSearch, searchType, t]
    );

    const handleTabChange = (tabId: string) => {
        setSearchType(tabId as 'users' | 'recipes' | 'quests' | 'videos');
        setSearchQuery('');
    };

    useEffect(() => {
        handleSearch(searchQuery);

        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, handleSearch, debouncedSearch]);

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
            <Tabs
                tabs={tabs}
                activeTab={searchType}
                onTabChange={handleTabChange}
                data-testid="related-content-tabs"
                responsiveLabels={true}
            />

            {/* Search input with integrated dropdown - hide for videos tab */}
            {searchType !== 'videos' && (
                <div className="relative">
                    <SearchInput
                        id="search"
                        label={
                            searchType === 'users'
                                ? t('search_users') || 'Search Users'
                                : searchType === 'recipes'
                                  ? t('search_recipes') || 'Search Recipes'
                                  : t('search_quests') || 'Search Quests'
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
                            } else if (searchType === 'recipes') {
                                onAddLinkedRecipe(result);
                            } else {
                                onSelectQuest(result);
                            }
                            setSearchQuery('');
                        }}
                        searchType={searchType}
                        maxSelected={
                            searchType === 'users'
                                ? 4
                                : searchType === 'recipes'
                                  ? 2
                                  : 1
                        }
                        isSelected={(id) =>
                            searchType === 'users'
                                ? selectedCoCooks.some((cook) => cook.id === id)
                                : searchType === 'recipes'
                                  ? selectedLinkedRecipes.some(
                                        (recipe) => recipe.id === id
                                    )
                                  : selectedQuest?.id === id
                        }
                        emptyMessage={
                            searchType === 'users'
                                ? t('no_users_found') || 'No users found'
                                : searchType === 'recipes'
                                  ? t('no_recipes_found') || 'No recipes found'
                                  : t('no_quests_found') || 'No quests found'
                        }
                    />
                </div>
            )}

            {/* Display of selected items */}
            <div className="space-y-4">
                {searchType === 'users' && (
                    <SelectedCoCooksList
                        selectedCoCooks={selectedCoCooks}
                        onRemoveCoCook={onRemoveCoCook}
                        t={t}
                    />
                )}

                {searchType === 'quests' && (
                    <SelectedQuestDisplay
                        selectedQuest={selectedQuest}
                        onRemoveQuest={onRemoveQuest}
                        t={t}
                    />
                )}

                {searchType === 'recipes' && (
                    <SelectedLinkedRecipesList
                        selectedLinkedRecipes={selectedLinkedRecipes}
                        onRemoveLinkedRecipe={onRemoveLinkedRecipe}
                        t={t}
                    />
                )}
            </div>

            {/* YouTube URL Input - only show in Videos tab */}
            {searchType === 'videos' && (
                <div className="space-y-3">
                    <Input
                        id="youtubeUrl"
                        label={t('youtube_url_optional')}
                        type="url"
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                        dataCy="youtube-url-input"
                        validation={{
                            validate: (value: string) =>
                                validateYouTubeUrl(
                                    value,
                                    t('invalid_youtube_url') ||
                                        'Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)'
                                ),
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default RelatedContentStep;
