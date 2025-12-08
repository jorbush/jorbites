import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import { isMobile } from '@/app/utils/deviceDetector';
import { headers } from 'next/headers';
import {
    MOBILE_RECIPES_LIMIT,
    DESKTOP_RECIPES_LIMIT,
} from '@/app/utils/constants';

import getCurrentUser from '@/app/actions/getCurrentUser';
import getFavoriteRecipes, {
    IFavoriteRecipesParams,
} from '@/app/actions/getFavoriteRecipes';

import FavoritesClient from './FavoritesClient';

interface FavoritesPageProps {
    searchParams: Promise<IFavoriteRecipesParams>;
}

const FavoritesPage = async ({ searchParams }: FavoritesPageProps) => {
    const resolvedParams = await searchParams;
    const favoriteRecipesResponse = await getFavoriteRecipes({
        ...resolvedParams,
        limit: isMobile((await headers()).get('user-agent') || '')
            ? MOBILE_RECIPES_LIMIT
            : DESKTOP_RECIPES_LIMIT,
    });
    const currentUser = await getCurrentUser();

    if (favoriteRecipesResponse.totalRecipes === 0) {
        // Check if it's because of filters or truly no favorites
        const hasFilters =
            resolvedParams.category ||
            resolvedParams.search ||
            resolvedParams.startDate ||
            resolvedParams.endDate;

        return (
            <ClientOnly>
                <EmptyState
                    title={
                        hasFilters
                            ? 'No matching favorites found'
                            : 'No favorites found'
                    }
                    subtitle={
                        hasFilters
                            ? 'Try changing or removing some of your filters.'
                            : 'Looks like you have no favorite recipes.'
                    }
                    showReset={hasFilters}
                />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <FavoritesClient
                recipes={favoriteRecipesResponse.recipes}
                currentUser={currentUser}
                totalPages={favoriteRecipesResponse.totalPages}
                currentPage={favoriteRecipesResponse.currentPage}
                searchParams={resolvedParams}
            />
        </ClientOnly>
    );
};

export default FavoritesPage;
