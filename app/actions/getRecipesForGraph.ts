import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    userId?: string;
}

export default async function getRecipesForGraph(params: IParams) {
    try {
        const { userId } = params;
        const cacheKey = `recipes:graph:${userId}`;

        try {
            const cachedData = await redisCache.get(cacheKey);

            if (cachedData) {
                logger.info('getRecipesForGraph - cache hit', { userId });
                return JSON.parse(cachedData);
            }
        } catch (error: any) {
            logger.error('getRecipesForGraph - cache get error', {
                error: error.message,
                userId,
            });
        }

        logger.info('getRecipesForGraph - start', { userId: params.userId });

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

        try {
            await redisCache.set(
                cacheKey,
                JSON.stringify(safeRecipes),
                'EX',
                86400
            ); // 1 day
        } catch (error: any) {
            logger.error('getRecipesForGraph - cache set error', {
                error: error.message,
                userId,
            });
        }

        return safeRecipes;
    } catch (error: any) {
        logger.error('getRecipesForGraph - error', {
            error: error.message,
            userId: params.userId,
        });
        throw new Error(error);
    }
}
