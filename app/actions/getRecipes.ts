import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { SafeRecipe } from '@/app/types';
import {
    IRecipeFilterParams,
    OrderByType,
    buildRecipeWhereClause,
    getPrismaOrderByClause,
} from '@/app/utils/filter';
import { logger } from '@/app/lib/axiom/server';
import {
    authenticatedRatelimit,
    unauthenticatedRatelimit,
} from '@/app/lib/ratelimit';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { headers } from 'next/headers';
import { toSafeRecipe } from '@/app/utils/toSafeRecipe';

export interface IRecipesParams extends IRecipeFilterParams {
    page?: number;
    limit?: number;
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
        const { page = 1, limit = 10, orderBy = OrderByType.NEWEST } = params;

        const query = buildRecipeWhereClause({
            ...params,
            orderBy,
        });

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

        const safeRecipes = recipes.map(toSafeRecipe);

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
