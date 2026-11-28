'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Modal from '@/app/components/modals/Modal';
import { useRecipeSelectSearch } from '@/app/components/modals/useRecipeSelectSearch';
import { RecipeSelectFilters } from '@/app/components/modals/RecipeSelectFilters';
import { RecipeSelectResults } from '@/app/components/modals/RecipeSelectResults';
import {
    MacroSuggestionContext,
    RecipeSelectBudgetBar,
} from '@/app/components/modals/RecipeSelectBudgetBar';

interface RecipeSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (recipe: any) => void;
    suggestionContext?: MacroSuggestionContext | null;
}

const RecipeSelectModalContent: React.FC<
    Omit<RecipeSelectModalProps, 'isOpen'>
> = ({ onClose, onSelect, suggestionContext }) => {
    const { t } = useTranslation();
    const {
        query,
        difficulty,
        selectedTags,
        excludedAllergens,
        macroBudget,
        results,
        isLoading,
        hasActiveFilters,
        handleQueryChange,
        handleToggleDifficulty,
        handleToggleTag,
        handleToggleAllergen,
        handleSetMacroBudgetField,
        handleClearFilters,
        resetSearch,
    } = useRecipeSelectSearch(suggestionContext?.initialBudget);

    const handleClose = () => {
        resetSearch();
        onClose();
    };

    const handleSelectRecipe = (recipe: any) => {
        onSelect(recipe);
        handleClose();
    };

    const canShowNoResults = query.trim().length >= 2 || hasActiveFilters;

    const modalTitle = suggestionContext
        ? String(
              t('fill_remaining_macros', {
                  defaultValue: 'Fill remaining macros',
              }) || 'Fill remaining macros'
          )
        : String(t('select_recipe') || 'Select Recipe');

    const bodyContent = (
        <div className="flex flex-col gap-4 text-black dark:text-neutral-100">
            {suggestionContext && (
                <RecipeSelectBudgetBar
                    suggestionContext={suggestionContext}
                    macroBudget={macroBudget}
                    onSetMacroBudgetField={handleSetMacroBudgetField}
                    t={t}
                />
            )}

            {/* Search Bar */}
            <div className="relative">
                <FiSearch
                    className="absolute top-3.5 left-3 text-neutral-400"
                    size={18}
                    aria-hidden="true"
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder={String(
                        t('search_recipes_placeholder') ||
                            'Search recipes by title...'
                    )}
                    aria-label={String(
                        t('search_recipes_placeholder') || 'Search recipes'
                    )}
                    data-cy="recipe-select-search-input"
                    className="focus:border-green-450 focus:ring-green-450/30 w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pr-4 pl-10 text-sm font-light text-neutral-900 outline-hidden focus:ring-2 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                />
            </div>

            <RecipeSelectFilters
                difficulty={difficulty}
                selectedTags={selectedTags}
                excludedAllergens={excludedAllergens}
                hasActiveFilters={hasActiveFilters}
                onToggleDifficulty={handleToggleDifficulty}
                onToggleTag={handleToggleTag}
                onToggleAllergen={handleToggleAllergen}
                onClearFilters={handleClearFilters}
                t={t}
            />

            <RecipeSelectResults
                results={results}
                isLoading={isLoading}
                canShowNoResults={canShowNoResults}
                onSelectRecipe={handleSelectRecipe}
                t={t}
            />
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={handleClose}
            onSubmit={handleClose}
            title={modalTitle}
            actionLabel={String(t('cancel') || 'Cancel')}
            body={bodyContent}
        />
    );
};

const RecipeSelectModal: React.FC<RecipeSelectModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    suggestionContext,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <RecipeSelectModalContent
            onClose={onClose}
            onSelect={onSelect}
            suggestionContext={suggestionContext}
        />
    );
};

export default RecipeSelectModal;
