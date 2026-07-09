import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import { Metadata } from 'next';
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

export const metadata: Metadata = {
    title: 'Mis Favoritos | Jorbites',
    description: 'Todas tus recetas favoritas guardadas en un solo lugar.',
};

interface FavoritesPageProps {
    searchParams: Promise<IFavoriteRecipesParams>;
}

const FavoritesPage = async ({ searchParams }: FavoritesPageProps) => {
    const [resolvedParams, userHeaders] = await Promise.all([
        searchParams,
        headers(),
    ]);

    const [favoriteRecipesResponse, currentUser] = await Promise.all([
        getFavoriteRecipes({
            ...resolvedParams,
            limit: isMobile(userHeaders.get('user-agent') || '')
                ? MOBILE_RECIPES_LIMIT
                : DESKTOP_RECIPES_LIMIT,
        }),
        getCurrentUser(),
    ]);

    if (favoriteRecipesResponse.totalRecipes === 0) {
        // Check if it's because of filters or truly no favorites
        const hasFilters = !!(
            resolvedParams.category ||
            resolvedParams.search ||
            resolvedParams.startDate ||
            resolvedParams.endDate ||
            resolvedParams.minCalories ||
            resolvedParams.maxCalories ||
            resolvedParams.minYield ||
            resolvedParams.maxYield ||
            resolvedParams.recipeCuisine
        );

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
                    height="h-auto"
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
