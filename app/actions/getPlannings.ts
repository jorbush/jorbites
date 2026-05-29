import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app//lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';

export default async function getPlannings() {
    try {
        const currentUser = await getCurrentUser();

        // 1. Fetch community plannings (all public ones, excluding user's own if logged in to avoid duplication)
        const communityPlannings = await prisma.planning.findMany({
            where: {
                isPrivate: false,
                ...(currentUser && {
                    NOT: {
                        userId: currentUser.id,
                    },
                }),
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

        const mapToSafe = (plan: any) => ({
            ...plan,
            createdAt: plan.createdAt.toISOString(),
            updatedAt: plan.updatedAt.toISOString(),
            user: plan.user
                ? {
                      ...plan.user,
                      createdAt: plan.user.createdAt.toISOString(),
                      updatedAt: plan.user.updatedAt.toISOString(),
                      emailVerified:
                          plan.user.emailVerified?.toISOString() || null,
                  }
                : undefined,
            meals: plan.meals
                ? plan.meals.map((meal: any) => ({
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
        });

        return {
            myPlannings: myPlannings.map(mapToSafe),
            communityPlannings: communityPlannings.map(mapToSafe),
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
