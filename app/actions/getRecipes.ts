import prisma from '@/app/lib/prismadb';
import { Prisma } from '@prisma/client';
import { redisCache } from '@/app/lib/redis';
import { SafeRecipe } from '@/app/types';
import {
    OrderByType,
    getPrismaOrderByClause,
    getDateRangeFilter,
} from '@/app/utils/filter';
import { logger } from '@/app/lib/axiom/server';
import {
    authenticatedRatelimit,
    unauthenticatedRatelimit,
} from '@/app/lib/ratelimit';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { headers } from 'next/headers';
import { RECIPE_CUISINES } from '@/app/utils/constants';

export interface IRecipesParams {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    orderBy?: OrderByType;
    startDate?: string;
    endDate?: string;
    minCalories?: number | string;
    maxCalories?: number | string;
    minYield?: number | string;
    maxYield?: number | string;
    recipeCuisine?: string;
}

export interface ServerResponse<T> {
    data: T | null;
    error: {
        code: string;
        message: string;
    } | null;
}

export interface RecipesResponse {
    recipes: SafeRecipe[];
    totalRecipes: number;
    totalPages: number;
    currentPage: number;
}

export default async function getRecipes(
    params: IRecipesParams
): Promise<ServerResponse<RecipesResponse>> {
    try {
        let cacheKey: string | undefined;
        try {
            const version =
                (await redisCache.get('recipes:global:version')) || '0';
            cacheKey = `recipes:${version}:${JSON.stringify(params)}`;
            const cachedData = await redisCache.get(cacheKey);

            if (cachedData) {
                logger.info('getRecipes - cache hit', { params });
                return JSON.parse(cachedData);
            }
        } catch (error: any) {
            logger.error('getRecipes - cache error', {
                error: error.message,
                params,
            });
        }

        logger.info('getRecipes - start', { params });
        const {
            category,
            search,
            page = 1,
            limit = 10,
            orderBy = OrderByType.NEWEST,
            startDate,
            endDate,
            minCalories,
            maxCalories,
            minYield,
            maxYield,
            recipeCuisine,
        } = params;

        let query: Prisma.RecipeWhereInput = {};

        if (typeof category === 'string') {
            query.categories = {
                has: category,
            };
        }

        if (typeof search === 'string' && search.trim()) {
            query.title = {
                contains: search.trim(),
                mode: 'insensitive',
            };
        }

        const dateRangeFilter = getDateRangeFilter(startDate, endDate);
        if (Object.keys(dateRangeFilter).length > 0) {
            query = { ...query, ...dateRangeFilter };
        }

        if (minCalories !== undefined && minCalories !== '') {
            const parsed = parseInt(minCalories.toString(), 10);
            if (!isNaN(parsed)) {
                const currentFilter = (
                    query.calories && typeof query.calories === 'object'
                        ? query.calories
                        : {}
                ) as Prisma.IntNullableFilter;
                query.calories = {
                    ...currentFilter,
                    gte: parsed,
                };
            }
        }

        if (maxCalories !== undefined && maxCalories !== '') {
            const parsed = parseInt(maxCalories.toString(), 10);
            if (!isNaN(parsed)) {
                const currentFilter = (
                    query.calories && typeof query.calories === 'object'
                        ? query.calories
                        : {}
                ) as Prisma.IntNullableFilter;
                query.calories = {
                    ...currentFilter,
                    lte: parsed,
                };
            }
        }

        if (minYield !== undefined && minYield !== '') {
            const parsed = parseInt(minYield.toString(), 10);
            if (!isNaN(parsed)) {
                const currentFilter = (
                    query.recipeYield && typeof query.recipeYield === 'object'
                        ? query.recipeYield
                        : {}
                ) as Prisma.IntNullableFilter;
                query.recipeYield = {
                    ...currentFilter,
                    gte: parsed,
                };
            }
        }

        if (maxYield !== undefined && maxYield !== '') {
            const parsed = parseInt(maxYield.toString(), 10);
            if (!isNaN(parsed)) {
                const currentFilter = (
                    query.recipeYield && typeof query.recipeYield === 'object'
                        ? query.recipeYield
                        : {}
                ) as Prisma.IntNullableFilter;
                query.recipeYield = {
                    ...currentFilter,
                    lte: parsed,
                };
            }
        }

        if (typeof recipeCuisine === 'string' && recipeCuisine.trim()) {
            const normalizedCuisine = recipeCuisine.trim();
            const matchedCuisine = RECIPE_CUISINES.find(
                (c) => c.toLowerCase() === normalizedCuisine.toLowerCase()
            );
            if (matchedCuisine) {
                query.recipeCuisine = {
                    contains: matchedCuisine,
                    mode: 'insensitive',
                };
            } else {
                query.recipeCuisine = {
                    equals: 'NON_EXISTENT_CUISINE_VAL',
                };
            }
        }

        if (process.env.ENV === 'production') {
            const currentUser = await getCurrentUser();
            const rateLimitKey = currentUser
                ? currentUser.id
                : ((await headers()).get('x-forwarded-for') ?? 'unknown-ip');

            const ratelimit = currentUser
                ? authenticatedRatelimit
                : unauthenticatedRatelimit;

            const { success, reset } = await ratelimit.limit(rateLimitKey);
            if (!success) {
                return {
                    data: null,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: `You have made too many requests. Try again in ${Math.floor((reset - Date.now()) / 1000)} seconds.`,
                    },
                };
            }
        }

        const recipes = await prisma.recipe.findMany({
            where: query,
            orderBy: getPrismaOrderByClause(orderBy),
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalRecipes = await prisma.recipe.count({
            where: query,
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
        }));

        logger.info('getRecipes - success', { totalRecipes, page, limit });

        const response = {
            data: {
                recipes: safeRecipes,
                totalRecipes,
                totalPages: Math.ceil(totalRecipes / limit),
                currentPage: page,
            },
            error: null,
        };

        try {
            if (cacheKey) {
                await redisCache.set(
                    cacheKey,
                    JSON.stringify(response),
                    'EX',
                    86400
                ); // 1 day
            }
        } catch (error: any) {
            logger.error('getRecipes - cache set error', {
                error: error.message,
                params,
            });
        }

        return response;
    } catch (error: any) {
        logger.error('getRecipes - error', { error: error.message, params });
        return {
            data: null,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to get recipes',
            },
        };
    }
}
