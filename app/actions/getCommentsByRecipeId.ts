import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    recipeId?: string;
}

export default async function getCommentsByRecipeId(params: IParams) {
    try {
        const { recipeId } = params;
        const cacheKey = `recipe:comments:${recipeId}`;

        try {
            const cachedData = await redisCache.get(cacheKey);
            if (cachedData) {
                logger.info('getCommentsByRecipeId - cache hit', { recipeId });
                return JSON.parse(cachedData);
            }
        } catch (cacheError: any) {
            logger.error('getCommentsByRecipeId - cache get error', {
                error: cacheError.message,
                recipeId,
            });
        }

        logger.info('getCommentsByRecipeId - start', {
            recipeId: params.recipeId,
        });

        const query: any = {};

        if (recipeId) {
            query.recipeId = recipeId;
        }

        const comments = await prisma.comment.findMany({
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

        const safeComments = comments.map((comment) => ({
            ...comment,
            createdAt: comment.createdAt.toISOString(),
        }));

        logger.info('getCommentsByRecipeId - success', {
            recipeId,
            count: safeComments.length,
        });

        try {
            await redisCache.set(
                cacheKey,
                JSON.stringify(safeComments),
                'EX',
                86400
            ); // 1 day
        } catch (cacheError: any) {
            logger.error('getCommentsByRecipeId - cache set error', {
                error: cacheError.message,
                recipeId,
            });
        }

        return safeComments;
    } catch (error: any) {
        logger.error('getCommentsByRecipeId - error', {
            error: error.message,
            recipeId: params.recipeId,
        });
        throw new Error(error);
    }
}
