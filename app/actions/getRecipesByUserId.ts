import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    userId?: string;
}

export default async function getRecipesByUserId(params: IParams) {
    try {
        logger.info('getRecipesByUserId - start', { userId: params.userId });
        const { userId } = params;

        const recipes = await prisma.recipe.findMany({
            where: {
                userId: userId,
            },
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toString(),
        }));

        logger.info('getRecipesByUserId - success', {
            userId,
            count: safeRecipes.length,
        });
        return safeRecipes;
    } catch (error: any) {
        logger.error('getRecipesByUserId - error', {
            error: error.message,
            userId: params.userId,
        });
        throw new Error(error);
    }
}
