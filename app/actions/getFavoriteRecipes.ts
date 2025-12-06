import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { SafeRecipe } from '@/app/types';
import { DESKTOP_RECIPES_LIMIT } from '@/app/utils/constants';

import getCurrentUser from './getCurrentUser';
import { ServerResponse } from './getRecipes';

export interface IFavoriteRecipesParams {
    page?: string;
    limit?: string;
}

export interface RecipesResponse {
    recipes: SafeRecipe[];
    totalRecipes: number;
    totalPages: number;
    currentPage: number;
}

export default async function getFavoriteRecipes(
    params: IFavoriteRecipesParams
): Promise<ServerResponse<RecipesResponse>> {
    try {
        logger.info('getFavoriteRecipes - start');
        const currentUser = await getCurrentUser();
        const page = params.page ? parseInt(params.page, 10) : 1;
        const limit = params.limit
            ? parseInt(params.limit, 10)
            : DESKTOP_RECIPES_LIMIT;

        if (!currentUser) {
            logger.info('getFavoriteRecipes - no current user');
            return {
                data: null,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to view favorites.',
                },
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
            userId: currentUser.id,
        });
        return {
            data: {
                recipes: safeFavorites,
                totalRecipes,
                totalPages: Math.ceil(totalRecipes / limit),
                currentPage: page,
            },
            error: null,
        };
    } catch (error: any) {
        logger.error('getFavoriteRecipes - error', { error: error.message });
        return {
            data: null,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to get favorite recipes',
            },
        };
    }
}
