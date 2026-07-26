import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';

export default async function getPlannings() {
    try {
        const currentUser = await getCurrentUser();

        const cacheKey = 'plannings:public';
        let allPublicPlannings = null;

        try {
            const cachedData = await redisCache.get(cacheKey);
            if (cachedData) {
                logger.info('getPlannings - cache hit', { cacheKey });
                allPublicPlannings = JSON.parse(cachedData);
            }
        } catch (cacheError: any) {
            logger.error('getPlannings - cache get error', {
                error: cacheError.message,
            });
        }

        const mapToSafe = (plan: any) => ({
            ...plan,
            createdAt:
                typeof plan.createdAt === 'string'
                    ? plan.createdAt
                    : plan.createdAt.toISOString(),
            updatedAt:
                typeof plan.updatedAt === 'string'
                    ? plan.updatedAt
                    : plan.updatedAt.toISOString(),
            user: plan.user
                ? {
                      ...plan.user,
                      createdAt:
                          typeof plan.user.createdAt === 'string'
                              ? plan.user.createdAt
                              : plan.user.createdAt.toISOString(),
                      updatedAt:
                          typeof plan.user.updatedAt === 'string'
                              ? plan.user.updatedAt
                              : plan.user.updatedAt.toISOString(),
                      emailVerified:
                          typeof plan.user.emailVerified === 'string'
                              ? plan.user.emailVerified
                              : plan.user.emailVerified?.toISOString() || null,
                  }
                : undefined,
            meals: plan.meals
                ? plan.meals.map((meal: any) => ({
                      ...meal,
                      recipe: meal.recipe
                          ? {
                                ...meal.recipe,
                                createdAt:
                                    typeof meal.recipe.createdAt === 'string'
                                        ? meal.recipe.createdAt
                                        : meal.recipe.createdAt.toISOString(),
                                user: meal.recipe.user
                                    ? {
                                          ...meal.recipe.user,
                                          createdAt:
                                              typeof meal.recipe.user
                                                  .createdAt === 'string'
                                                  ? meal.recipe.user.createdAt
                                                  : meal.recipe.user.createdAt.toISOString(),
                                          updatedAt:
                                              typeof meal.recipe.user
                                                  .updatedAt === 'string'
                                                  ? meal.recipe.user.updatedAt
                                                  : meal.recipe.user.updatedAt.toISOString(),
                                          emailVerified:
                                              typeof meal.recipe.user
                                                  .emailVerified === 'string'
                                                  ? meal.recipe.user
                                                        .emailVerified
                                                  : meal.recipe.user.emailVerified?.toISOString() ||
                                                    null,
                                      }
                                    : undefined,
                            }
                          : undefined,
                  }))
                : [],
        });

        if (!allPublicPlannings) {
            logger.info('getPlannings - cache miss', { cacheKey });
            const plannings = await prisma.planning.findMany({
                where: {
                    isPrivate: false,
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
                orderBy: {
                    createdAt: 'desc',
                },
            });

            allPublicPlannings = plannings.map(mapToSafe);

            try {
                await redisCache.set(
                    cacheKey,
                    JSON.stringify(allPublicPlannings),
                    'EX',
                    86400
                ); // 1 day
            } catch (cacheError: any) {
                logger.error('getPlannings - cache set error', {
                    error: cacheError.message,
                });
            }
        }

        // 1. Derive community plannings (all public ones, excluding user's own if logged in to avoid duplication)
        const communityPlannings = allPublicPlannings.filter(
            (plan: any) => !currentUser || plan.userId !== currentUser.id
        );

        // 2. Fetch user's own plannings if logged in
        let myPlannings: any[] = [];
        if (currentUser) {
            myPlannings = await prisma.planning.findMany({
                where: {
                    userId: currentUser.id,
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
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }

        // 3. Fetch user's saved plannings if logged in
        let savedPlannings: any[] = [];
        if (
            currentUser &&
            currentUser.savedPlanningIds &&
            currentUser.savedPlanningIds.length > 0
        ) {
            savedPlannings = await prisma.planning.findMany({
                where: {
                    id: {
                        in: currentUser.savedPlanningIds,
                    },
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
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }

        return {
            myPlannings: myPlannings.map(mapToSafe),
            communityPlannings,
            savedPlannings: savedPlannings.map(mapToSafe),
        };
    } catch (error: any) {
        logger.error('getPlannings - error', { error: error.message });
        return {
            myPlannings: [],
            communityPlannings: [],
            savedPlannings: [],
        };
    }
}
