import React from 'react';
import ClientOnly from '@/app/components/utils/ClientOnly';
import RecipeContributionGraph from '@/app/components/stats/RecipeContributionGraph';
import RecipeContributionGraphSkeleton from '@/app/components/stats/RecipeContributionGraphSkeleton';

interface ProfileContributionGraphProps {
    recipes: Array<{ id: string; createdAt: string }>;
}

const ProfileContributionGraph: React.FC<ProfileContributionGraphProps> = ({
    recipes,
}) => {
    if (recipes.length === 0) {
        return null;
    }

    return (
        <ClientOnly fallback={<RecipeContributionGraphSkeleton />}>
            <RecipeContributionGraph recipes={recipes} />
        </ClientOnly>
    );
};

export default ProfileContributionGraph;
