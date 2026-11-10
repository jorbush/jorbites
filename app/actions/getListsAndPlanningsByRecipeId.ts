import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';
import { toSafeRecipe } from '@/app/utils/toSafeRecipe';
import { SafeList, SafePlanning } from '@/app/types';

interface IParams {
    recipeId: string;
    userId?: string;
}

export interface RecipeInclusionsResult {
    lists: SafeList[];
    plannings: SafePlanning[];
}

const CACHE_TTL_SECONDS = 86400; // 24 hours

const mapToSafeList = (list: any): SafeList => ({
    ...list,
    createdAt:
        typeof list.createdAt?.toISOString === 'function'
            ? list.createdAt.toISOString()
            : String(list.createdAt),
    updatedAt:
        typeof list.updatedAt?.toISOString === 'function'
            ? list.updatedAt.toISOString()
            : String(list.updatedAt),
    user: list.user
        ? {
              ...list.user,
              createdAt:
                  typeof list.user.createdAt?.toISOString === 'function'
                      ? list.user.createdAt.toISOString()
                      : String(list.user.createdAt),
              updatedAt:
                  typeof list.user.updatedAt?.toISOString === 'function'
                      ? list.user.updatedAt.toISOString()
                      : String(list.user.updatedAt),
              emailVerified:
                  typeof list.user.emailVerified?.toISOString === 'function'
                      ? list.user.emailVerified.toISOString()
                      : list.user.emailVerified || null,
          }
        : undefined,
    recipes: list.recipes
        ? list.recipes.map((recipe: any) => ({
              id: recipe.id,
              title: recipe.title,
              imageSrc: recipe.imageSrc,
          }))
        : [],
});

const mapToSafePlanning = (plan: any): SafePlanning => ({
    ...plan,
    createdAt:
        typeof plan.createdAt?.toISOString === 'function'
            ? plan.createdAt.toISOString()
            : String(plan.createdAt),
    updatedAt:
        typeof plan.updatedAt?.toISOString === 'function'
            ? plan.updatedAt.toISOString()
            : String(plan.updatedAt),
    user: plan.user
        ? {
              ...plan.user,
              createdAt:
                  typeof plan.user.createdAt?.toISOString === 'function'
                      ? plan.user.createdAt.toISOString()
                      : String(plan.user.createdAt),
              updatedAt:
                  typeof plan.user.updatedAt?.toISOString === 'function'
                      ? plan.user.updatedAt.toISOString()
                      : String(plan.user.updatedAt),
              emailVerified:
                  typeof plan.user.emailVerified?.toISOString === 'function'
                      ? plan.user.emailVerified.toISOString()
                      : plan.user.emailVerified || null,
          }
        : undefined,
    meals: plan.meals
        ? plan.meals.map((meal: any) => ({
              ...meal,
              recipe: meal.recipe
                  ? {
                        ...toSafeRecipe(meal.recipe),
                        user: meal.recipe.user
                            ? {
                                  ...meal.recipe.user,
                                  createdAt:
                                      typeof meal.recipe.user.createdAt
                                          ?.toISOString === 'function'
                                          ? meal.recipe.user.createdAt.toISOString()
                                          : String(meal.recipe.user.createdAt),
                                  updatedAt:
                                      typeof meal.recipe.user.updatedAt
                                          ?.toISOString === 'function'
                                          ? meal.recipe.user.updatedAt.toISOString()
                                          : String(meal.recipe.user.updatedAt),
                                  emailVerified:
                                      typeof meal.recipe.user.emailVerified
                                          ?.toISOString === 'function'
                                          ? meal.recipe.user.emailVerified.toISOString()
                                          : meal.recipe.user.emailVerified ||
                                            null,
                              }
                            : undefined,
                    }
                  : undefined,
          }))
        : [],
});

export default async function getListsAndPlanningsByRecipeId({
    recipeId,
    userId,
}: IParams): Promise<RecipeInclusionsResult> {
    if (!recipeId) {
        return { lists: [], plannings: [] };
    }

    try {
        const publicCacheKey = `recipe:inclusions:public:${recipeId}`;
        const userCacheKey = userId
            ? `recipe:inclusions:user:${recipeId}:${userId}`
            : null;

        // 1. Fetch public inclusions (from Redis cache or Prisma)
        let publicInclusions: RecipeInclusionsResult | null = null;
        try {
            const cachedPublic = await redisCache.get(publicCacheKey);
            if (cachedPublic) {
                logger.info(
                    'getListsAndPlanningsByRecipeId - public cache hit',
                    {
                        recipeId,
                    }
                );
                publicInclusions = JSON.parse(cachedPublic);
            }
        } catch (cacheError: any) {
            logger.error(
                'getListsAndPlanningsByRecipeId - public cache get error',
                {
                    error: cacheError.message,
                    recipeId,
                }
            );
        }

        if (!publicInclusions) {
            logger.info('getListsAndPlanningsByRecipeId - public cache miss', {
                recipeId,
            });

            const [publicLists, publicPlannings] = await Promise.all([
                prisma.list.findMany({
                    where: {
                        isPrivate: false,
                        recipeIds: {
                            has: recipeId,
                        },
                    },
                    include: {
                        user: {
                            select: USER_SELECT_FIELDS,
                        },
                        recipes: {
                            select: {
                                id: true,
                                title: true,
                                imageSrc: true,
                            },
                            take: 4,
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                prisma.planning.findMany({
                    where: {
                        isPrivate: false,
                        meals: {
                            some: {
                                recipeId: recipeId,
                            },
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
                }),
            ]);

            publicInclusions = {
                lists: publicLists.map(mapToSafeList),
                plannings: publicPlannings.map(mapToSafePlanning),
            };

            try {
                await redisCache.set(
                    publicCacheKey,
                    JSON.stringify(publicInclusions),
                    'EX',
                    CACHE_TTL_SECONDS
                );
            } catch (cacheError: any) {
                logger.error(
                    'getListsAndPlanningsByRecipeId - public cache set error',
                    {
                        error: cacheError.message,
                        recipeId,
                    }
                );
            }
        }

        // 2. Fetch user's private inclusions if authenticated
        let userInclusions: RecipeInclusionsResult = {
            lists: [],
            plannings: [],
        };
        if (userId && userCacheKey) {
            try {
                const cachedUser = await redisCache.get(userCacheKey);
                if (cachedUser) {
                    logger.info(
                        'getListsAndPlanningsByRecipeId - user cache hit',
                        {
                            recipeId,
                            userId,
                        }
                    );
                    userInclusions = JSON.parse(cachedUser);
                }
            } catch (cacheError: any) {
                logger.error(
                    'getListsAndPlanningsByRecipeId - user cache get error',
                    {
                        error: cacheError.message,
                        recipeId,
                        userId,
                    }
                );
            }

            if (
                !userInclusions.lists.length &&
                !userInclusions.plannings.length
            ) {
                const [userLists, userPlannings] = await Promise.all([
                    prisma.list.findMany({
                        where: {
                            userId: userId,
                            isPrivate: true,
                            recipeIds: {
                                has: recipeId,
                            },
                        },
                        include: {
                            user: {
                                select: USER_SELECT_FIELDS,
                            },
                            recipes: {
                                select: {
                                    id: true,
                                    title: true,
                                    imageSrc: true,
                                },
                                take: 4,
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    }),
                    prisma.planning.findMany({
                        where: {
                            userId: userId,
                            isPrivate: true,
                            meals: {
                                some: {
                                    recipeId: recipeId,
                                },
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
                    }),
                ]);

                userInclusions = {
                    lists: userLists.map(mapToSafeList),
                    plannings: userPlannings.map(mapToSafePlanning),
                };

                try {
                    await redisCache.set(
                        userCacheKey,
                        JSON.stringify(userInclusions),
                        'EX',
                        CACHE_TTL_SECONDS
                    );
                } catch (cacheError: any) {
                    logger.error(
                        'getListsAndPlanningsByRecipeId - user cache set error',
                        {
                            error: cacheError.message,
                            recipeId,
                            userId,
                        }
                    );
                }
            }
        }

        return {
            lists: [
                ...(publicInclusions?.lists || []),
                ...userInclusions.lists,
            ],
            plannings: [
                ...(publicInclusions?.plannings || []),
                ...userInclusions.plannings,
            ],
        };
    } catch (error: any) {
        logger.error('getListsAndPlanningsByRecipeId - error', {
            error: error.message,
            recipeId,
            userId,
        });
        return { lists: [], plannings: [] };
    }
}
