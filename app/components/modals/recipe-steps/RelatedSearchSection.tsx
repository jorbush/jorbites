'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';
import SearchInput from '@/app/components/inputs/SearchInput';

export interface RelatedSearchSectionProps {
    searchType: 'recipes' | 'quests';
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResults: { recipes: any[]; quests: any[] };
    isLoading: boolean;
    selectedLinkedRecipes: any[];
    selectedQuest: any | null;
    onAddLinkedRecipe: (recipe: any) => void;
    onSelectQuest: (quest: any) => void;
}

const RelatedSearchSection: React.FC<RelatedSearchSectionProps> = ({
    searchType,
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    selectedLinkedRecipes,
    selectedQuest,
    onAddLinkedRecipe,
    onSelectQuest,
}) => {
    const { t } = useTranslation();

    const isRecipe = searchType === 'recipes';

    const handleSelectResult = (result: any) => {
        if (isRecipe) {
            onAddLinkedRecipe(result);
        } else {
            onSelectQuest(result);
        }
        setSearchQuery('');
    };

    const isSelected = (id: string) =>
        isRecipe
            ? selectedLinkedRecipes.some((recipe) => recipe.id === id)
            : selectedQuest?.id === id;

    return (
        <div className="relative">
            <SearchInput
                id="search"
                label={
                    isRecipe
                        ? t('search_recipes') || 'Search Recipes'
                        : t('search_quests') || 'Search Quests'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                dataCy="search-input"
                icon={FiSearch}
                results={searchResults}
                onSelectResult={handleSelectResult}
                searchType={searchType}
                maxSelected={isRecipe ? 2 : 1}
                isSelected={isSelected}
                emptyMessage={
                    isRecipe
                        ? t('no_recipes_found') || 'No recipes found'
                        : t('no_quests_found') || 'No quests found'
                }
            />
        </div>
    );
};

export default RelatedSearchSection;
