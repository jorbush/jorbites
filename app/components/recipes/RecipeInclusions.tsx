'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import { useRecipeInclusions } from '@/app/hooks/useRecipeInclusions';
import RecipeListsSection from '@/app/components/recipes/RecipeListsSection';
import RecipePlanningsSection from '@/app/components/recipes/RecipePlanningsSection';
import RecipeQuestsSection from '@/app/components/recipes/RecipeQuestsSection';

interface RecipeInclusionsProps {
    recipeId: string;
    currentUser?: SafeUser | null;
}

export const RecipeInclusions: React.FC<RecipeInclusionsProps> = ({
    recipeId,
    currentUser,
}) => {
    const { lists, plannings, quests } = useRecipeInclusions(recipeId);

    const hasLists = lists.length > 0;
    const hasPlannings = plannings.length > 0;
    const hasQuests = quests.length > 0;

    if (!hasLists && !hasPlannings && !hasQuests) {
        return null;
    }

    return (
        <>
            {hasLists && (
                <div className="mt-2">
                    <RecipeListsSection lists={lists} />
                </div>
            )}
            {hasPlannings && (
                <div className="mt-2">
                    <RecipePlanningsSection
                        plannings={plannings}
                        currentUser={currentUser}
                    />
                </div>
            )}
            {hasQuests && (
                <div className="mt-2">
                    <RecipeQuestsSection quests={quests} />
                </div>
            )}
        </>
    );
};

export default RecipeInclusions;
