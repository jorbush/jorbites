import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    userId?: string;
}

export default async function getRecipesForGraph(params: IParams) {
    try {
        logger.info('getRecipesForGraph - start', { userId: params.userId });
        const { userId } = params;

        // Get all recipes for the contribution graph (no pagination)
        const recipes = await prisma.recipe.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toString(),
        }));

        logger.info('getRecipesForGraph - success', {
            userId,
            count: safeRecipes.length,
        });
        return safeRecipes;
    } catch (error: any) {
        logger.error('getRecipesForGraph - error', {
            error: error.message,
            userId: params.userId,
        });
        throw new Error(error);
    }
}
