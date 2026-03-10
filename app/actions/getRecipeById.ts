import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    recipeId?: string;
}

export default async function getRecipeById(params: IParams) {
    try {
        logger.info('getRecipeById - start', { recipeId: params.recipeId });
        const { recipeId } = params;

        const recipe = await prisma.recipe.findUnique({
            where: {
                id: recipeId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        level: true,
                        verified: true,
                        badges: true,
                    },
                },
            },
        });

        if (!recipe) {
            logger.info('getRecipeById - recipe not found', { recipeId });
            return null;
        }

        logger.info('getRecipeById - success', { recipeId });
        return {
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
        };
    } catch (error: any) {
        logger.error('getRecipeById - error', {
            error: error.message,
            recipeId: params.recipeId,
        });
        throw new Error(error);
    }
}
