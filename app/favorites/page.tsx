import EmptyState from '@/app/components/EmptyState';
import ClientOnly from '@/app/components/ClientOnly';

import getCurrentUser from '@/app/actions/getCurrentUser';
import getFavoriteRecipes from '@/app/actions/getFavoriteRecipes';

import FavoritesClient from './FavoritesClient';

const FavoritesPage = async () => {
    const favoriteRecipes = await getFavoriteRecipes();
    const currentUser = await getCurrentUser();

    if (favoriteRecipes.length === 0) {
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
                recipes={favoriteRecipes}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
};

export default FavoritesPage;
