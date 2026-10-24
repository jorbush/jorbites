import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';
import { SafeCooksnap } from '@/app/types';

interface IParams {
    recipeId?: string;
}

export default async function getCooksnapsByRecipeId(
    params: IParams
): Promise<SafeCooksnap[]> {
    try {
        const { recipeId } = params;
        if (!recipeId) {
            return [];
        }

        const cacheKey = `recipe:cooksnaps:${recipeId}`;

        try {
            const cachedData = await redisCache.get(cacheKey);
            if (cachedData) {
                logger.info('getCooksnapsByRecipeId - cache hit', { recipeId });
                return JSON.parse(cachedData);
            }
        } catch (cacheError: any) {
            logger.error('getCooksnapsByRecipeId - cache get error', {
                error: cacheError.message,
                recipeId,
            });
        }

        logger.info('getCooksnapsByRecipeId - start', {
            recipeId: params.recipeId,
        });

        const query: any = {};

        if (recipeId) {
            query.recipeId = recipeId;
        }

        const cooksnaps = await prisma.cooksnap.findMany({
            where: query,
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

        const safeCooksnaps: SafeCooksnap[] = cooksnaps.map((cooksnap) => ({
            ...cooksnap,
            createdAt: cooksnap.createdAt.toISOString(),
            updatedAt: cooksnap.updatedAt.toISOString(),
        }));

        logger.info('getCooksnapsByRecipeId - success', {
            recipeId,
            count: safeCooksnaps.length,
        });

        try {
            await redisCache.set(
                cacheKey,
                JSON.stringify(safeCooksnaps),
                'EX',
                86400
            ); // 1 day
        } catch (cacheError: any) {
            logger.error('getCooksnapsByRecipeId - cache set error', {
                error: cacheError.message,
                recipeId,
            });
        }

        return safeCooksnaps;
    } catch (error: any) {
        logger.error('getCooksnapsByRecipeId - error', {
            error: error.message,
            recipeId: params.recipeId,
        });
        return [];
    }
}
