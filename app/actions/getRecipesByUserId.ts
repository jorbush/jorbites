import prisma from '@/app/lib/prismadb';
import { Prisma } from '@prisma/client';
import { logger } from '@/app/lib/axiom/server';
import {
    OrderByType,
    applyOrderByWhereFilters,
    getPrismaOrderByClause,
} from '@/app/utils/filter';
import { SafeRecipe } from '@/app/types';
import { toSafeRecipe } from '@/app/utils/toSafeRecipe';

interface IParams {
    userId?: string;
    orderBy?: OrderByType;
    page?: number;
    limit?: number;
    search?: string;
}

export interface RecipesByUserIdResponse {
    recipes: SafeRecipe[];
    totalRecipes: number;
    totalPages: number;
    currentPage: number;
}

export default async function getRecipesByUserId(
    params: IParams
): Promise<RecipesByUserIdResponse> {
    try {
        logger.info('getRecipesByUserId - start', { userId: params.userId });
        const {
            userId,
            orderBy = OrderByType.NEWEST,
            page = 1,
            limit = 12,
            search,
        } = params;

        const baseWhere: Prisma.RecipeWhereInput = {
            userId: userId,
        };

        const trimmedSearch = typeof search === 'string' ? search.trim() : '';
        if (trimmedSearch) {
            baseWhere.OR = [
                {
                    title: {
                        contains: trimmedSearch,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: trimmedSearch,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const where = applyOrderByWhereFilters(baseWhere, orderBy);

        const recipes = await prisma.recipe.findMany({
            where,
            orderBy: getPrismaOrderByClause(orderBy),
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalRecipes = await prisma.recipe.count({
            where,
        });

        const safeRecipes = recipes.map(toSafeRecipe);

        logger.info('getRecipesByUserId - success', {
            userId,
            count: safeRecipes.length,
            totalRecipes,
            page,
            limit,
            orderBy,
        });
        return {
            recipes: safeRecipes,
            totalRecipes,
            totalPages: Math.ceil(totalRecipes / limit),
            currentPage: page,
        };
    } catch (error: any) {
        logger.error('getRecipesByUserId - error', {
            error: error.message,
            userId: params.userId,
        });
        throw new Error(error);
    }
}
