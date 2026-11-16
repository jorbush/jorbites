'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BsPinAngleFill } from 'react-icons/bs';
import { SafeRecipe, SafeUser } from '@/app/types';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import OrderByDropdown from '@/app/components/navbar/OrderByDropdown';
import Pagination from '@/app/components/navigation/Pagination';
import EmptyState from '@/app/components/utils/EmptyState';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';

const EMPTY_RECIPES: SafeRecipe[] = [];

interface ProfileRecipesContentProps {
    recipes: SafeRecipe[];
    pinnedRecipes?: SafeRecipe[];
    currentUser?: SafeUser | null;
    isOwnProfile: boolean;
    totalPages: number;
    currentPage: number;
    searchParams: any;
    isSearching?: boolean;
    onClearSearch?: () => void;
}

const ProfileRecipesContent: React.FC<ProfileRecipesContentProps> = ({
    recipes,
    pinnedRecipes = EMPTY_RECIPES,
    currentUser,
    isOwnProfile,
    totalPages,
    currentPage,
    searchParams,
    isSearching = false,
    onClearSearch,
}) => {
    const { t } = useTranslation();
    const visiblePinnedRecipes = isSearching ? EMPTY_RECIPES : pinnedRecipes;
    const hasRecipes = recipes.length > 0 || visiblePinnedRecipes.length > 0;

    if (!hasRecipes) {
        if (isSearching) {
            return (
                <div data-testid="profile-recipes-search-empty">
                    <EmptySearchResults
                        title={String(
                            t(
                                'no_recipes_matching_search',
                                'No recipes match your search'
                            )
                        )}
                        subtitle={String(
                            t(
                                'no_search_results_subtitle',
                                'Try searching with different keywords or check your spelling.'
                            )
                        )}
                        clearLabel={String(t('clear_search', 'Clear search'))}
                        onClearSearch={onClearSearch}
                        clearTestId="profile-recipes-search-clear"
                    />
                </div>
            );
        }

        return (
            <div
                className="py-12"
                data-testid="profile-recipes-empty"
            >
                <EmptyState
                    title={t('no_recipes_found') || 'No recipes found'}
                    subtitle={
                        t('looks_like_this_user_has_not_created_recipes.') ||
                        'Looks like this user has not created recipes.'
                    }
                />
            </div>
        );
    }

    return (
        <div data-testid="profile-recipes-content">
            {visiblePinnedRecipes.length > 0 && (
                <div className="mb-8 w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/40">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="border-green-450/30 bg-green-450/20 dark:border-green-450/30 dark:bg-green-450/15 dark:text-green-450 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-neutral-800">
                            <BsPinAngleFill className="text-green-450 size-3" />
                            {t('pinned_recipes')}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {visiblePinnedRecipes.map((recipe: any) => (
                            <RecipeCard
                                currentUser={currentUser}
                                key={`pinned-${recipe.id}`}
                                data={recipe}
                                canPin={
                                    !!(
                                        isOwnProfile &&
                                        currentUser?.id === recipe.userId
                                    )
                                }
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-4 flex justify-end">
                <OrderByDropdown />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {recipes.map((recipe: any) => (
                    <RecipeCard
                        currentUser={currentUser}
                        key={recipe.id}
                        data={recipe}
                        canPin={
                            !!(
                                isOwnProfile &&
                                currentUser?.id === recipe.userId
                            )
                        }
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    searchParams={searchParams}
                />
            )}
        </div>
    );
};

export default ProfileRecipesContent;
