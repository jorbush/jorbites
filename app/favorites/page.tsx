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
        return (
            <ClientOnly>
                <EmptyState
                    title="No favorites found"
                    subtitle="Looks like you have no favorite recipes."
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
