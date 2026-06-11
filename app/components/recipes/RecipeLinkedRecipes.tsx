'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import RecipeCard from '@/app/components/recipes/RecipeCard';

interface RecipeLinkedRecipesProps {
    isLoadingRelatedData: boolean;
    linkedRecipes: any[];
    currentUser?: SafeUser | null;
    mounted: boolean;
    t: any;
}

export const RecipeLinkedRecipes: React.FC<RecipeLinkedRecipesProps> = ({
    isLoadingRelatedData,
    linkedRecipes,
    currentUser,
    mounted,
    t,
}) => {
    if (isLoadingRelatedData) {
        return (
            <>
                <hr />
                <div className="dark:text-neutral-100">
                    <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                        {mounted
                            ? t('linked_recipes') || 'Linked Recipes'
                            : 'linked_recipes'}
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Loading skeletons */}
                        <div className="h-64 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                        <div className="hidden h-64 animate-pulse rounded-lg bg-neutral-200 sm:block dark:bg-neutral-800" />
                    </div>
                </div>
            </>
        );
    }

    if (linkedRecipes.length === 0) {
        return null;
    }

    return (
        <>
            <hr />
            <div className="dark:text-neutral-100">
                <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                    {mounted
                        ? t('linked_recipes') || 'Linked Recipes'
                        : 'linked_recipes'}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {linkedRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            data={recipe}
                            currentUser={currentUser}
                            user={recipe.user}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};
