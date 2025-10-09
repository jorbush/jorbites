import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

import getCurrentUser from './getCurrentUser';

export default async function getFavoriteRecipes() {
    try {
        logger.info('getFavoriteRecipes - start');
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            logger.info('getFavoriteRecipes - no current user');
            return [];
        }

        const favorites = await prisma.recipe.findMany({
            where: {
                id: {
                    in: [...(currentUser.favoriteIds || [])],
                },
            },
        });

        const safeFavorites = favorites.map((favorite) => ({
            ...favorite,
            createdAt: favorite.createdAt.toString(),
        }));

        logger.info('getFavoriteRecipes - success', {
            count: safeFavorites.length,
            userId: currentUser.id,
        });
        return safeFavorites;
    } catch (error: any) {
        logger.error('getFavoriteRecipes - error', { error: error.message });
        throw new Error(error);
    }
}
