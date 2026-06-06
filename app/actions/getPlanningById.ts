import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';
import { redisCache } from '@/app/lib/redis';

interface IParams {
    planningId?: string;
}

export default async function getPlanningById(params: IParams) {
    try {
        const { planningId } = params;

        if (!planningId) {
            return null;
        }

        const cacheKey = `planning:${planningId}`;
        try {
            const cachedData = await redisCache.get(cacheKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                // Extra safety: do not return from cache if it's somehow a private plan
                if (!parsedData.isPrivate) {
                    logger.info('getPlanningById - cache hit', { planningId });
                    return parsedData;
                }
                logger.warn('getPlanningById - cache hit but plan is private', {
                    planningId,
                });
            }
        } catch (error: any) {
            logger.error('getPlanningById - cache error', {
                error: error.message,
                planningId,
            });
        }

        const planning = await prisma.planning.findUnique({
            where: {
                id: planningId,
            },
            include: {
                user: {
                    select: USER_SELECT_FIELDS,
                },
                meals: {
                    include: {
                        recipe: {
                            include: {
                                user: {
                                    select: USER_SELECT_FIELDS,
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!planning) {
            return null;
        }

        const safePlanning = {
            ...planning,
            createdAt: planning.createdAt.toISOString(),
            updatedAt: planning.updatedAt.toISOString(),
            user: planning.user
                ? {
                      ...planning.user,
                      createdAt: planning.user.createdAt.toISOString(),
                      updatedAt: planning.user.updatedAt.toISOString(),
                      emailVerified:
                          planning.user.emailVerified?.toISOString() || null,
                  }
                : undefined,
            meals: planning.meals
                ? planning.meals.map((meal) => ({
                      ...meal,
                      recipe: meal.recipe
                          ? {
                                ...meal.recipe,
                                createdAt: meal.recipe.createdAt.toISOString(),
                                user: meal.recipe.user
                                    ? {
                                          ...meal.recipe.user,
                                          createdAt:
                                              meal.recipe.user.createdAt.toISOString(),
                                          updatedAt:
                                              meal.recipe.user.updatedAt.toISOString(),
                                          emailVerified:
                                              meal.recipe.user.emailVerified?.toISOString() ||
                                              null,
                                      }
                                    : undefined,
                            }
                          : undefined,
                  }))
                : [],
        };

        try {
            if (!safePlanning.isPrivate) {
                await redisCache.set(
                    cacheKey,
                    JSON.stringify(safePlanning),
                    'EX',
                    86400
                ); // 1 day
            }
        } catch (error: any) {
            logger.error('getPlanningById - cache set error', {
                error: error.message,
                planningId,
            });
        }

        return safePlanning;
    } catch (error: any) {
        logger.error('getPlanningById - error', {
            error: error.message,
            params,
        });
        return null;
    }
}
