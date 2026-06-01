import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';
import {
    unauthorized,
    internalServerError,
    badRequest,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import {
    planningRatelimit,
    authenticatedRatelimit,
    unauthenticatedRatelimit,
} from '@/app/lib/ratelimit';
import { headers } from 'next/headers';

export async function GET() {
    try {
        logger.info('GET /api/plannings - start');

        if (process.env.ENV === 'production') {
            const currentUser = await getCurrentUser();
            const rateLimitKey = currentUser
                ? currentUser.id
                : ((await headers()).get('x-forwarded-for') ?? 'unknown-ip');

            const ratelimit = currentUser
                ? authenticatedRatelimit
                : unauthenticatedRatelimit;

            const { success, reset } = await ratelimit.limit(rateLimitKey);
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                return rateLimitExceeded(
                    `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
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

        // Rate limiting for planning creation - prevent spam
        if (process.env.ENV === 'production') {
            const { success, reset } = await planningRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn('POST /api/plannings - rate limit exceeded', {
                    userId: currentUser.id,
                });
                return rateLimitExceeded(
                    `Too many planning operations. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
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
