import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import {
    unauthorizedResponse,
    invalidInput,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { trackRecipeLike, trackRecipeUnlike } from '@/app/actions/tracking';
import sendNotification from '@/app/actions/sendNotification';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { redisCache } from '@/app/lib/redis';
import { NotificationType } from '@/app/types/notification';

interface IParams {
    recipeId?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to add favorite'
            );
        }

        const { recipeId } = params;

        logger.info('POST /api/favorites/[recipeId] - start', {
            recipeId,
            userId: currentUser.id,
        });

        if (!recipeId || typeof recipeId !== 'string') {
            return invalidInput(
                'Recipe ID is required and must be a valid string'
            );
        }

        let favoriteIds = [...(currentUser.favoriteIds || [])];

        const alreadyFavorited = favoriteIds.includes(recipeId);

        if (!alreadyFavorited) {
            favoriteIds.push(recipeId);

            const user = await prisma.user.update({
                where: {
                    id: currentUser.id,
                },
                data: {
                    favoriteIds,
                },
                select: {
                    id: true,
                    favoriteIds: true,
                },
            });

            // Keep the Recipe model's numLikes in sync atomically/idempotently
            const recipeExists = await prisma.recipe.findUnique({
                where: {
                    id: recipeId,
                },
                include: {
                    user: true,
                },
            });

            if (recipeExists) {
                await prisma.recipe.update({
                    where: {
                        id: recipeId,
                    },
                    data: {
                        numLikes: {
                            increment: 1,
                        },
                    },
                });

                await sendNotification({
                    type: NotificationType.NEW_LIKE,
                    userEmail: recipeExists.user.email,
                    params: {
                        userName: currentUser.name,
                        recipeId: recipeId,
                    },
                });

                await updateUserLevel({
                    userId: recipeExists.user.id,
                });

                try {
                    await redisCache.del(`recipe:${recipeId}`);
                } catch (cacheError: any) {
                    logger.error(
                        'POST /api/favorites/[recipeId] - cache invalidation error',
                        { error: cacheError.message, recipeId }
                    );
                }
            }

            void trackRecipeLike(recipeId, currentUser.id);
            logger.info('POST /api/favorites/[recipeId] - success', {
                recipeId,
                userId: user.id,
            });
            return NextResponse.json(user);
        } else {
            logger.info(
                'POST /api/favorites/[recipeId] - success (already favorited, no-op)',
                {
                    recipeId,
                    userId: currentUser.id,
                }
            );
            return NextResponse.json({
                id: currentUser.id,
                favoriteIds,
            });
        }
    } catch (error: any) {
        logger.error('POST /api/favorites/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to add recipe to favorites');
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
            return unauthorizedResponse(
                'User authentication required to remove favorite'
            );
        }

        const { recipeId } = params;

        logger.info('DELETE /api/favorites/[recipeId] - start', {
            recipeId,
            userId: currentUser.id,
        });

        if (!recipeId || typeof recipeId !== 'string') {
            return invalidInput(
                'Recipe ID is required and must be a valid string'
            );
        }

        let favoriteIds = [...(currentUser.favoriteIds || [])];

        const isFavorited = favoriteIds.includes(recipeId);

        if (isFavorited) {
            favoriteIds = favoriteIds.filter((id) => id !== recipeId);

            const user = await prisma.user.update({
                where: {
                    id: currentUser.id,
                },
                data: {
                    favoriteIds,
                },
                select: {
                    id: true,
                    favoriteIds: true,
                },
            });

            // Keep the Recipe model's numLikes in sync atomically/idempotently
            const recipeExists = await prisma.recipe.findUnique({
                where: {
                    id: recipeId,
                },
                include: {
                    user: true,
                },
            });

            if (recipeExists) {
                const newNumLikes = Math.max(0, recipeExists.numLikes - 1);
                await prisma.recipe.update({
                    where: {
                        id: recipeId,
                    },
                    data: {
                        numLikes: newNumLikes,
                    },
                });

                await updateUserLevel({
                    userId: recipeExists.user.id,
                });

                try {
                    await redisCache.del(`recipe:${recipeId}`);
                } catch (cacheError: any) {
                    logger.error(
                        'DELETE /api/favorites/[recipeId] - cache invalidation error',
                        { error: cacheError.message, recipeId }
                    );
                }
            }

            void trackRecipeUnlike(recipeId, currentUser.id);
            logger.info('DELETE /api/favorites/[recipeId] - success', {
                recipeId,
                userId: user.id,
            });
            return NextResponse.json(user);
        } else {
            logger.info(
                'DELETE /api/favorites/[recipeId] - success (not favorited, no-op)',
                {
                    recipeId,
                    userId: currentUser.id,
                }
            );
            return NextResponse.json({
                id: currentUser.id,
                favoriteIds,
            });
        }
    } catch (error: any) {
        logger.error('DELETE /api/favorites/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to remove recipe from favorites');
    }
}
