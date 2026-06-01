import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { redisCache } from '@/app/lib/redis';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';
import {
    unauthorized,
    internalServerError,
    badRequest,
} from '@/app/utils/apiErrors';

export async function GET() {
    try {
        logger.info('GET /api/plannings - start');

        let cacheKey: string | undefined;
        try {
            const version =
                (await redisCache.get('plannings:global:version')) || '0';
            cacheKey = `plannings:public:${version}`;
            const cachedData = await redisCache.get(cacheKey);

            if (cachedData) {
                logger.info('GET /api/plannings - cache hit');
                return NextResponse.json(JSON.parse(cachedData));
            }
        } catch (error: any) {
            logger.error('GET /api/plannings - cache error', {
                error: error.message,
            });
        }

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
            if (cacheKey) {
                await redisCache.set(
                    cacheKey,
                    JSON.stringify(safePlannings),
                    'EX',
                    86400
                ); // 1 day
            }
        } catch (error: any) {
            logger.error('GET /api/plannings - cache set error', {
                error: error.message,
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
            return unauthorized('Unauthorized');
        }

        logger.info('POST /api/plannings - start', { userId: currentUser.id });

        const body = await request.json();
        const { name, description, isPrivate } = body;

        if (typeof name !== 'string' || name.trim().length === 0) {
            return badRequest('Missing or invalid name');
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

        try {
            await redisCache.incr('plannings:global:version');
        } catch (error: any) {
            logger.error('POST /api/plannings - cache invalidation error', {
                error: error.message,
                userId: currentUser.id,
            });
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
