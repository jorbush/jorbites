import prisma from '@/app/lib/prismadb';
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

export interface IRecipesParams {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    orderBy?: OrderByType;
    startDate?: string;
    endDate?: string;
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
        logger.info('getRecipes - start', { params });
        const {
            category,
            search,
            page = 1,
            limit = 10,
            orderBy = OrderByType.NEWEST,
            startDate,
            endDate,
        } = params;

        let query: any = {};

        if (typeof category === 'string') {
            query.category = category;
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

        // Rate limiting with per-user limits (higher for authenticated users)
        if (process.env.ENV === 'production') {
            const currentUser = await getCurrentUser();
            const rateLimitKey = currentUser
                ? currentUser.id
                : ((await headers()).get('x-forwarded-for') ?? 'unknown-ip');

            // Use different rate limits for authenticated vs unauthenticated users
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
        return {
            data: {
                recipes: safeRecipes,
                totalRecipes,
                totalPages: Math.ceil(totalRecipes / limit),
                currentPage: page,
            },
            error: null,
        };
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
