import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { OrderByType, getPrismaOrderByClause } from '@/app/utils/filter';
import { SafeRecipe } from '@/app/types';

interface IParams {
    userId?: string;
    orderBy?: OrderByType;
    page?: number;
    limit?: number;
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
        } = params;

        const recipes = await prisma.recipe.findMany({
            where: {
                userId: userId,
            },
            orderBy: getPrismaOrderByClause(orderBy),
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalRecipes = await prisma.recipe.count({
            where: {
                userId: userId,
            },
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toString(),
            updatedAt: recipe.updatedAt.toString(),
        }));

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
