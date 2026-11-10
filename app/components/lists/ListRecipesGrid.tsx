'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineDelete } from 'react-icons/ai';
import { SafeRecipe, SafeUser } from '@/app/types';
import RecipeCard from '@/app/components/recipes/RecipeCard';

export interface ListRecipesGridProps {
    recipes: (SafeRecipe & { user: SafeUser })[];
    currentUser?: SafeUser | null;
    isOwner: boolean;
    deletingId: string;
    onRemoveRecipe: (recipeId: string) => void;
}

const ListRecipesGrid: React.FC<ListRecipesGridProps> = ({
    recipes,
    currentUser,
    isOwner,
    deletingId,
    onRemoveRecipe,
}) => {
    const { t } = useTranslation();

    if (recipes.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <p className="text-sm">
                    {String(
                        t('list_no_recipes') || 'No recipes in this list yet'
                    )}
                </p>
            </div>
        );
    }

    const deleteActionLabel = String(t('delete') || 'Delete');

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {recipes.map((recipe) => (
                <RecipeCard
                    currentUser={currentUser}
                    key={recipe.id}
                    data={recipe}
                    user={recipe.user}
                    onAction={isOwner ? onRemoveRecipe : undefined}
                    disabled={deletingId === recipe.id}
                    actionLabel={deleteActionLabel}
                    actionIcon={isOwner ? AiOutlineDelete : undefined}
                />
            ))}
        </div>
    );
};

export default ListRecipesGrid;
