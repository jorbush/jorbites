import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { publicUserSelect } from '@/app/lib/prisma-selects';

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
                    select: publicUserSelect,
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
            user: {
                ...recipe.user,
                createdAt: recipe.user.createdAt.toISOString(),
                updatedAt: recipe.user.updatedAt.toISOString(),
                emailVerified: null,
            },
        };
    } catch (error: any) {
        logger.error('getRecipeById - error', {
            error: error.message,
            recipeId: params.recipeId,
        });
        throw new Error(error);
    }
}
