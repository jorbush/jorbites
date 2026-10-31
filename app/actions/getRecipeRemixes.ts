import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';
import { SafeRecipe } from '@/app/types';
import { toSafeRecipe } from '@/app/utils/toSafeRecipe';

interface IParams {
    recipeId?: string;
}

export default async function getRecipeRemixes(
    params: IParams
): Promise<SafeRecipe[]> {
    try {
        const { recipeId } = params;
        if (!recipeId) {
            return [];
        }

        const cacheKey = `recipe:remixes:${recipeId}`;

        try {
            const cachedData = await redisCache.get(cacheKey);
            if (cachedData) {
                logger.info('getRecipeRemixes - cache hit', { recipeId });
                return JSON.parse(cachedData);
            }
        } catch (cacheError: any) {
            logger.error('getRecipeRemixes - cache get error', {
                error: cacheError.message,
                recipeId,
            });
        }

        logger.info('getRecipeRemixes - start', { recipeId });

        const remixes = await prisma.recipe.findMany({
            where: {
                forkedFromRecipeId: recipeId,
            },
            take: 20,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        verified: true,
                        level: true,
                        badges: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const safeRemixes = remixes.map((recipe) => toSafeRecipe(recipe));

        logger.info('getRecipeRemixes - success', {
            recipeId,
            count: safeRemixes.length,
        });

        try {
            await redisCache.set(
                cacheKey,
                JSON.stringify(safeRemixes),
                'EX',
                86400
            );
        } catch (cacheError: any) {
            logger.error('getRecipeRemixes - cache set error', {
                error: cacheError.message,
                recipeId,
            });
        }

        return safeRemixes as SafeRecipe[];
    } catch (error: any) {
        logger.error('getRecipeRemixes - error', {
            error: error.message,
            recipeId: params.recipeId,
        });
        return [];
    }
}
