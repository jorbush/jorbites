import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    recipeId?: string;
}

export default async function getRecipeById(params: IParams) {
    try {
        const { recipeId } = params;
        const cacheKey = `recipe:${recipeId}`;

        try {
            const cachedData = await redisCache.get(cacheKey);
            if (cachedData) {
                logger.info('getRecipeById - cache hit', { recipeId });
                return JSON.parse(cachedData);
            }
        } catch (cacheError: any) {
            logger.error('getRecipeById - cache get error', {
                error: cacheError.message,
                recipeId,
            });
        }

        logger.info('getRecipeById - start', { recipeId });

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

        const safeRecipe = {
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
        };

        logger.info('getRecipeById - success', { recipeId });

        try {
            await redisCache.set(
                cacheKey,
                JSON.stringify(safeRecipe),
                'EX',
                86400
            ); // 1 day
        } catch (cacheError: any) {
            logger.error('getRecipeById - cache set error', {
                error: cacheError.message,
                recipeId,
            });
        }

        return safeRecipe;
    } catch (error: any) {
        logger.error('getRecipeById - error', {
            error: error.message,
            recipeId: params.recipeId,
        });
        throw new Error(error);
    }
}
