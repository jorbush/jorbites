'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BsPinAngleFill } from 'react-icons/bs';
import { SafeRecipe, SafeUser } from '@/app/types';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import OrderByDropdown from '@/app/components/navbar/OrderByDropdown';
import Pagination from '@/app/components/navigation/Pagination';
import EmptyState from '@/app/components/utils/EmptyState';

interface ProfileRecipesContentProps {
    recipes: SafeRecipe[];
    pinnedRecipes?: SafeRecipe[];
    currentUser?: SafeUser | null;
    isOwnProfile: boolean;
    totalPages: number;
    currentPage: number;
    searchParams: any;
}

const ProfileRecipesContent: React.FC<ProfileRecipesContentProps> = ({
    recipes,
    pinnedRecipes = [],
    currentUser,
    isOwnProfile,
    totalPages,
    currentPage,
    searchParams,
}) => {
    const { t } = useTranslation();
    const hasRecipes = recipes.length > 0 || pinnedRecipes.length > 0;

    if (!hasRecipes) {
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
            {pinnedRecipes.length > 0 && (
                <div className="mb-8 w-full">
                    <div className="mb-4 flex items-center gap-2">
                        <BsPinAngleFill
                            className="text-green-450"
                            size={22}
                        />
                        <h2 className="text-xl font-semibold dark:text-neutral-100">
                            {t('pinned_recipes')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {pinnedRecipes.map((recipe: any) => (
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
                    <hr className="mt-8 border-neutral-200 dark:border-neutral-800" />
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
