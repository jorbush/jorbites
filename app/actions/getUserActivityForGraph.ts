import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    userId?: string;
}

export interface UserActivityGraphData {
    recipes: Array<{ id: string; createdAt: string; questId?: string | null }>;
    comments: Array<{
        id: string;
        createdAt: string;
        isCooked: boolean;
        rating: number | null;
    }>;
    challengeSubmissions: Array<{ id: string; createdAt: string }>;
}

export async function invalidateUserActivityCache(userId: string) {
    try {
        await Promise.all([
            redisCache.del(`user:activity:graph:${userId}`),
            redisCache.del(`recipes:graph:${userId}`),
        ]);
        logger.info('invalidateUserActivityCache - success', { userId });
    } catch (error: any) {
        logger.error('invalidateUserActivityCache - error', {
            error: error.message,
            userId,
        });
    }
}

export default async function getUserActivityForGraph(
    params: IParams
): Promise<UserActivityGraphData> {
    try {
        const { userId } = params;
        if (!userId) {
            return {
                recipes: [],
                comments: [],
                challengeSubmissions: [],
            };
        }

        const cacheKey = `user:activity:graph:${userId}`;

        try {
            const cachedData = await redisCache.get(cacheKey);
            if (cachedData) {
                logger.info('getUserActivityForGraph - cache hit', { userId });
                return JSON.parse(cachedData);
            }
        } catch (error: any) {
            logger.error('getUserActivityForGraph - cache get error', {
                error: error.message,
                userId,
            });
        }

        logger.info('getUserActivityForGraph - start', { userId });

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 375); // 53 weeks covers calendar range

        const [recipes, comments] = await Promise.all([
            prisma.recipe.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: startDate,
                    },
                },
                select: {
                    id: true,
                    createdAt: true,
                    questId: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.comment.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: startDate,
                    },
                },
                select: {
                    id: true,
                    createdAt: true,
                    isCooked: true,
                    rating: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);

        const challengeSubmissions = recipes
            .filter((r) => Boolean(r.questId))
            .map((r) => ({
                id: r.id,
                createdAt: r.createdAt.toISOString(),
            }));

        const result: UserActivityGraphData = {
            recipes: recipes.map((r) => ({
                id: r.id,
                createdAt: r.createdAt.toISOString(),
                questId: r.questId,
            })),
            comments: comments.map((c) => ({
                id: c.id,
                createdAt: c.createdAt.toISOString(),
                isCooked: Boolean(c.isCooked),
                rating: c.rating ?? null,
            })),
            challengeSubmissions,
        };

        try {
            await redisCache.set(cacheKey, JSON.stringify(result), 'EX', 86400);
        } catch (error: any) {
            logger.error('getUserActivityForGraph - cache set error', {
                error: error.message,
                userId,
            });
        }

        logger.info('getUserActivityForGraph - success', {
            userId,
            recipesCount: result.recipes.length,
            commentsCount: result.comments.length,
            challengesCount: result.challengeSubmissions.length,
        });

        return result;
    } catch (error: any) {
        logger.error('getUserActivityForGraph - error', {
            error: error.message,
            userId: params.userId,
        });
        return {
            recipes: [],
            comments: [],
            challengeSubmissions: [],
        };
    }
}
