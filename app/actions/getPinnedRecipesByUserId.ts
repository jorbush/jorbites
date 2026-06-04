import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';
import { SafeRecipe } from '@/app/types';

export default async function getPinnedRecipesByUserId(
    userId: string
): Promise<SafeRecipe[]> {
    try {
        if (!userId) {
            return [];
        }

        const cacheKey = `pinned_recipes:${userId}`;

        try {
            const cachedData = await redisCache.get(cacheKey);
            if (cachedData) {
                logger.info('getPinnedRecipesByUserId - cache hit', { userId });
                return JSON.parse(cachedData);
            }
        } catch (cacheError: any) {
            logger.error('getPinnedRecipesByUserId - cache get error', {
                error: cacheError.message,
                userId,
            });
        }

        logger.info('getPinnedRecipesByUserId - start', { userId });

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                pinnedRecipeIds: true,
            },
        });

        if (
            !user ||
            !user.pinnedRecipeIds ||
            user.pinnedRecipeIds.length === 0
        ) {
            logger.info('getPinnedRecipesByUserId - no pinned recipes found', {
                userId,
            });
            return [];
        }

        const recipes = await prisma.recipe.findMany({
            where: {
                id: {
                    in: user.pinnedRecipeIds,
                },
            },
        });

        const orderedRecipes = user.pinnedRecipeIds
            .map((id) => recipes.find((recipe) => recipe.id === id))
            .filter((recipe): recipe is (typeof recipes)[0] => !!recipe);

        const safeRecipes = orderedRecipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toString(),
        }));

        logger.info('getPinnedRecipesByUserId - success', {
            userId,
            count: safeRecipes.length,
        });

        try {
            await redisCache.set(
                cacheKey,
                JSON.stringify(safeRecipes),
                'EX',
                86400 // 1 day
            );
        } catch (cacheError: any) {
            logger.error('getPinnedRecipesByUserId - cache set error', {
                error: cacheError.message,
                userId,
            });
        }

        return safeRecipes;
    } catch (error: any) {
        logger.error('getPinnedRecipesByUserId - error', {
            error: error.message,
            userId,
        });
        return [];
    }
}
