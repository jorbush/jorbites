import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';
import {
    unauthorized,
    internalServerError,
    badRequest,
    notFound,
} from '@/app/utils/apiErrors';

interface IParams {
    planningId?: string;
}

export async function GET(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const { planningId } = params;

        logger.info('GET /api/plannings/[planningId] - start', { planningId });

        if (!planningId || typeof planningId !== 'string') {
            return badRequest('Invalid ID');
        }

        const planning = await prisma.planning.findUnique({
            where: { id: planningId },
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
            return notFound('Planning not found');
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

        return NextResponse.json(safePlanning);
    } catch (error: any) {
        logger.error('GET /api/plannings/[planningId] - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}

export async function PATCH(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        const { planningId } = params;
        logger.info('PATCH /api/plannings/[planningId] - start', {
            planningId,
            userId: currentUser.id,
        });

        if (!planningId || typeof planningId !== 'string') {
            return badRequest('Invalid ID');
        }

        const body = await request.json();
        const { name, description, isPrivate, meals } = body;

        if (
            name !== undefined &&
            (typeof name !== 'string' || name.trim().length === 0)
        ) {
            return badRequest('Invalid name');
        }

        if (isPrivate !== undefined && typeof isPrivate !== 'boolean') {
            return badRequest('Invalid isPrivate flag');
        }

        const existingPlanning = await prisma.planning.findUnique({
            where: { id: planningId },
        });

        if (!existingPlanning || existingPlanning.userId !== currentUser.id) {
            return notFound('Not found or unauthorized');
        }

        // Perform transactional update: delete existing meals and insert new ones
        const updatedPlanning = await prisma.$transaction(async (tx) => {
            // Update metadata
            await tx.planning.update({
                where: { id: planningId },
                data: {
                    name:
                        name !== undefined
                            ? name.trim()
                            : existingPlanning.name,
                    description:
                        description !== undefined
                            ? description.trim()
                            : existingPlanning.description,
                    isPrivate:
                        isPrivate !== undefined
                            ? isPrivate
                            : existingPlanning.isPrivate,
                },
                include: {
                    user: {
                        select: USER_SELECT_FIELDS,
                    },
                },
            });

            if (meals !== undefined) {
                // Delete existing meals
                await tx.planningMeal.deleteMany({
                    where: { planningId: planningId },
                });

                // Create new meals if provided
                if (Array.isArray(meals) && meals.length > 0) {
                    await tx.planningMeal.createMany({
                        data: meals.map((m: any) => ({
                            planningId: planningId,
                            day: m.day,
                            mealType: m.mealType,
                            recipeId: m.recipeId,
                        })),
                    });
                }
            }

            // Re-fetch fully updated plan with its meals and recipes
            return await tx.planning.findUnique({
                where: { id: planningId },
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
        });

        if (!updatedPlanning) {
            return internalServerError('Failed to fetch updated planning');
        }

        logger.info('PATCH /api/plannings/[planningId] - success', {
            planningId: updatedPlanning.id,
        });

        const safePlanning = {
            ...updatedPlanning,
            createdAt: updatedPlanning.createdAt.toISOString(),
            updatedAt: updatedPlanning.updatedAt.toISOString(),
            user: {
                ...updatedPlanning.user,
                createdAt: updatedPlanning.user.createdAt.toISOString(),
                updatedAt: updatedPlanning.user.updatedAt.toISOString(),
                emailVerified:
                    updatedPlanning.user.emailVerified?.toISOString() || null,
            },
            meals: updatedPlanning.meals
                ? updatedPlanning.meals.map((meal) => ({
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

        return NextResponse.json(safePlanning);
    } catch (error: any) {
        logger.error('PATCH /api/plannings/[planningId] - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        const { planningId } = params;
        logger.info('DELETE /api/plannings/[planningId] - start', {
            planningId,
            userId: currentUser.id,
        });

        if (!planningId || typeof planningId !== 'string') {
            return badRequest('Invalid ID');
        }

        const existingPlanning = await prisma.planning.findUnique({
            where: { id: planningId },
        });

        if (!existingPlanning || existingPlanning.userId !== currentUser.id) {
            return notFound('Not found or unauthorized');
        }

        await prisma.planning.delete({
            where: { id: planningId },
        });

        logger.info('DELETE /api/plannings/[planningId] - success', {
            planningId,
        });
        return NextResponse.json({ message: 'Planning deleted' });
    } catch (error: any) {
        logger.error('DELETE /api/plannings/[planningId] - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}
