import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';
import {
    unauthorizedResponse,
    internalServerError,
    badRequest,
} from '@/app/utils/apiErrors';

export async function GET() {
    try {
        const cacheKey = 'plannings:public';

        try {
            const cachedData = await redisCache.get(cacheKey);
            if (cachedData) {
                logger.info('GET /api/plannings - cache hit', { cacheKey });
                return NextResponse.json(JSON.parse(cachedData));
            }
        } catch (cacheError: any) {
            logger.error('GET /api/plannings - cache get error', {
                error: cacheError.message,
            });
        }

        logger.info('GET /api/plannings - start');

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

        logger.info('GET /api/plannings - success', {
            count: plannings.length,
        });

        const safePlannings = plannings.map((plan) => ({
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
                ? plan.meals.map((meal) => ({
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
        }));

        try {
            await redisCache.set(
                cacheKey,
                JSON.stringify(safePlannings),
                'EX',
                86400
            ); // 1 day
        } catch (cacheError: any) {
            logger.error('GET /api/plannings - cache set error', {
                error: cacheError.message,
            });
        }

        return NextResponse.json(safePlannings);
    } catch (error: any) {
        logger.error('GET /api/plannings - error', { error: error.message });
        return internalServerError('Internal Error');
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse('Unauthorized');
        }

        logger.info('POST /api/plannings - start', { userId: currentUser.id });

        const body = await request.json();
        const { name, description, isPrivate, meals } = body;

        if (typeof name !== 'string' || name.trim().length === 0) {
            return badRequest('Missing or invalid name');
        }

        if (meals !== undefined) {
            if (!Array.isArray(meals)) {
                return badRequest('Invalid meals payload');
            }

            const counts: Record<string, number> = {};
            for (const m of meals) {
                if (
                    !m ||
                    typeof m.day !== 'string' ||
                    typeof m.mealType !== 'string'
                ) {
                    return badRequest('Invalid meal entry');
                }

                const day = m.day.toLowerCase();
                const mealType = m.mealType.toLowerCase();
                const key = `${day}-${mealType}`;

                counts[key] = (counts[key] || 0) + 1;
                if (counts[key] > 4) {
                    return badRequest(
                        `Maximum of 4 recipes allowed per meal (${day} ${mealType})`
                    );
                }
            }
        }

        const planning = await prisma.planning.create({
            data: {
                name: name.trim(),
                description: description ? description.trim() : null,
                isPrivate: isPrivate !== undefined ? isPrivate : true,
                userId: currentUser.id,
            },
            include: {
                user: {
                    select: USER_SELECT_FIELDS,
                },
            },
        });

        logger.info('POST /api/plannings - success', {
            planningId: planning.id,
        });

        // Invalidate global public plannings cache if the new plan is public
        if (!planning.isPrivate) {
            try {
                await redisCache.del('plannings:public');
            } catch (cacheError: any) {
                logger.error('POST /api/plannings - cache invalidation error', {
                    error: cacheError.message,
                });
            }
        }

        const safePlanning = {
            ...planning,
            createdAt: planning.createdAt.toISOString(),
            updatedAt: planning.updatedAt.toISOString(),
            user: {
                ...planning.user,
                createdAt: planning.user.createdAt.toISOString(),
                updatedAt: planning.user.updatedAt.toISOString(),
                emailVerified:
                    planning.user.emailVerified?.toISOString() || null,
            },
            meals: [],
        };

        return NextResponse.json(safePlanning);
    } catch (error: any) {
        logger.error('POST /api/plannings - error', { error: error.message });
        return internalServerError('Internal Error');
    }
}
