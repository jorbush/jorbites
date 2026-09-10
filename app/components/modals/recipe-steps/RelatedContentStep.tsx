'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Heading from '@/app/components/navigation/Heading';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import { FiTarget, FiYoutube } from 'react-icons/fi';
import { IoRestaurantOutline } from 'react-icons/io5';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import { SelectedQuestDisplay } from './SelectedQuestDisplay';
import { SelectedLinkedRecipesList } from './SelectedLinkedRecipesList';
import { useRelatedContentSearch } from './useRelatedContentSearch';
import RelatedSearchSection from './RelatedSearchSection';
import RelatedYouTubeSection from './RelatedYouTubeSection';

interface RelatedContentStepProps {
    isLoading: boolean;
    selectedLinkedRecipes: any[];
    selectedQuest: any | null;
    onAddLinkedRecipe: (recipe: any) => void;
    onRemoveLinkedRecipe: (recipeId: string) => void;
    onSelectQuest: (quest: any) => void;
    onRemoveQuest: () => void;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
}

const RelatedContentStep: React.FC<RelatedContentStepProps> = ({
    isLoading,
    selectedLinkedRecipes,
    selectedQuest,
    onAddLinkedRecipe,
    onRemoveLinkedRecipe,
    onSelectQuest,
    onRemoveQuest,
    register,
    errors,
}) => {
    const { t } = useTranslation();
    const [searchType, setSearchType] = useState<
        'recipes' | 'quests' | 'videos'
    >('recipes');

    const { searchQuery, setSearchQuery, searchResults } =
        useRelatedContentSearch(searchType, t);

    // Define tabs for the component
    const tabs: Tab[] = [
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

    const handleTabChange = (tabId: string) => {
        setSearchType(tabId as 'recipes' | 'quests' | 'videos');
        setSearchQuery('');
    };

    return (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('related_content') || 'Related Content'}
                subtitle={
                    t('related_content_subtitle') ||
                    'Add linked recipes, quests, and videos'
                }
            />

            {/* Tab selection for related content */}
            <Tabs
                tabs={tabs}
                activeTab={searchType}
                onTabChange={handleTabChange}
                data-testid="related-content-tabs"
                responsiveLabels={true}
            />

            {/* Search input with integrated dropdown - hide for videos tab */}
            {searchType !== 'videos' && (
                <RelatedSearchSection
                    searchType={searchType}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchResults={searchResults}
                    isLoading={isLoading}
                    selectedLinkedRecipes={selectedLinkedRecipes}
                    selectedQuest={selectedQuest}
                    onAddLinkedRecipe={onAddLinkedRecipe}
                    onSelectQuest={onSelectQuest}
                />
            )}

            {/* Display of selected items */}
            <div className="space-y-4">
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
                <RelatedYouTubeSection
                    isLoading={isLoading}
                    register={register}
                    errors={errors}
                />
            )}
        </div>
    );
};

export default RelatedContentStep;
