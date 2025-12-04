import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { OrderByType, getPrismaOrderByClause } from '@/app/utils/filter';

interface IParams {
    userId?: string;
    orderBy?: OrderByType;
}

export default async function getAllRecipesByUserId(params: IParams) {
    try {
        logger.info('getAllRecipesByUserId - start', {
            userId: params.userId,
        });
        const { userId, orderBy = OrderByType.NEWEST } = params;

        const recipes = await prisma.recipe.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                createdAt: true,
            },
            orderBy: getPrismaOrderByClause(orderBy),
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toString(),
        }));

        logger.info('getAllRecipesByUserId - success', {
            userId,
            count: safeRecipes.length,
            orderBy,
        });
        return safeRecipes;
    } catch (error: any) {
        logger.error('getAllRecipesByUserId - error', {
            error: error.message,
            userId: params.userId,
        });
        throw new Error(error);
    }
}
