import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { SafeRecipe } from '@/app/types';
import {
    OrderByType,
    getPrismaOrderByClause,
    getDateRangeFilter,
} from '@/app/utils/filter';
import { Prisma } from '@prisma/client';

import getCurrentUser from './getCurrentUser';

export interface IFavoriteRecipesParams {
    page?: number;
    limit?: number;
    orderBy?: OrderByType;
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    minCalories?: number | string;
    maxCalories?: number | string;
    minYield?: number | string;
    maxYield?: number | string;
    recipeCuisine?: string;
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
        const {
            page = 1,
            limit = 10,
            orderBy = OrderByType.NEWEST,
            category,
            search,
            startDate,
            endDate,
            minCalories,
            maxCalories,
            minYield,
            maxYield,
            recipeCuisine,
        } = params;
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

        if (favoriteIds.length === 0) {
            logger.info('getFavoriteRecipes - no favorites');
            return {
                recipes: [],
                totalRecipes: 0,
                totalPages: 0,
                currentPage: page,
            };
        }

        const whereClause: Prisma.RecipeWhereInput = {
            id: {
                in: favoriteIds,
            },
        };

        // Apply category filter
        if (typeof category === 'string') {
            whereClause.categories = {
                has: category,
            };
        }

        // Apply search filter
        if (typeof search === 'string' && search.trim()) {
            whereClause.title = {
                contains: search.trim(),
                mode: 'insensitive',
            };
        }

        // Apply date range filter
        const dateRangeFilter = getDateRangeFilter(startDate, endDate);
        if (Object.keys(dateRangeFilter).length > 0) {
            Object.assign(whereClause, dateRangeFilter);
        }

        if (minCalories !== undefined && minCalories !== '') {
            const parsed = parseInt(minCalories.toString(), 10);
            if (!isNaN(parsed)) {
                whereClause.calories = {
                    ...whereClause.calories,
                    gte: parsed,
                };
            }
        }

        if (maxCalories !== undefined && maxCalories !== '') {
            const parsed = parseInt(maxCalories.toString(), 10);
            if (!isNaN(parsed)) {
                whereClause.calories = {
                    ...whereClause.calories,
                    lte: parsed,
                };
            }
        }

        if (minYield !== undefined && minYield !== '') {
            const parsed = parseInt(minYield.toString(), 10);
            if (!isNaN(parsed)) {
                whereClause.recipeYield = {
                    ...whereClause.recipeYield,
                    gte: parsed,
                };
            }
        }

        if (maxYield !== undefined && maxYield !== '') {
            const parsed = parseInt(maxYield.toString(), 10);
            if (!isNaN(parsed)) {
                whereClause.recipeYield = {
                    ...whereClause.recipeYield,
                    lte: parsed,
                };
            }
        }

        if (typeof recipeCuisine === 'string' && recipeCuisine.trim()) {
            whereClause.recipeCuisine = {
                contains: recipeCuisine.trim(),
                mode: 'insensitive',
            };
        }

        const orderByClause = getPrismaOrderByClause(orderBy);

        const favorites = await prisma.recipe.findMany({
            where: whereClause,
            orderBy: orderByClause,
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalRecipes = await prisma.recipe.count({
            where: whereClause,
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
