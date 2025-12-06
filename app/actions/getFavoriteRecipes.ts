import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { SafeRecipe } from '@/app/types';

import getCurrentUser from './getCurrentUser';

export interface IFavoriteRecipesParams {
    page?: number;
    limit?: number;
}

export interface FavoriteRecipesResponse {
    recipes: SafeRecipe[];
    totalRecipes: number;
    totalPages: number;
    currentPage: number;
}

export default async function getFavoriteRecipes(
    params: IFavoriteRecipesParams = {}
): Promise<FavoriteRecipesResponse> {
    try {
        const { page = 1, limit = 10 } = params;
        logger.info('getFavoriteRecipes - start', { params });
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            logger.info('getFavoriteRecipes - no current user');
            return {
                recipes: [],
                totalRecipes: 0,
                totalPages: 0,
                currentPage: page,
            };
        }

        const favoriteIds = currentUser.favoriteIds || [];
        const totalRecipes = favoriteIds.length;

        const favorites = await prisma.recipe.findMany({
            where: {
                id: {
                    in: favoriteIds,
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const safeFavorites = favorites.map((favorite) => ({
            ...favorite,
            createdAt: favorite.createdAt.toString(),
        }));

        logger.info('getFavoriteRecipes - success', {
            count: safeFavorites.length,
            totalRecipes,
            page,
            limit,
            userId: currentUser.id,
        });
        return {
            recipes: safeFavorites,
            totalRecipes,
            totalPages: Math.ceil(totalRecipes / limit),
            currentPage: page,
        };
    } catch (error: any) {
        logger.error('getFavoriteRecipes - error', { error: error.message });
        throw new Error(error);
    }
}
