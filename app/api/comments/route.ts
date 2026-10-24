import { NextResponse } from 'next/server';

import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendNotification from '@/app/actions/sendNotification';
import { NotificationType } from '@/app/types/notification';
import { COMMENT_MAX_LENGTH } from '@/app/utils/constants';
import { extractMentionedUserIds } from '@/app/utils/mentionUtils';
import {
    unauthorizedResponse,
    badRequest,
    validationError,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { contentCreationRatelimit } from '@/app/lib/ratelimit';
import { redisCache } from '@/app/lib/redis';
import { isValidR2Url } from '@/app/utils/r2';
import { recomputeRecipeRating } from '@/app/utils/recipeRating';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to post comment'
            );
        }

        // Rate limiting for comment creation - prevent spam
        if (process.env.ENV === 'production') {
            const { success, reset } = await contentCreationRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn('POST /api/comments - rate limit exceeded', {
                    userId: currentUser.id,
                });
                return rateLimitExceeded(
                    `Too many comments. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json();
        const { recipeId, comment, rating, imageSrc } = body;

        logger.info('POST /api/comments - start', {
            recipeId,
            userId: currentUser.id,
            rating,
            hasImage: Boolean(imageSrc),
        });

        if (!recipeId || !comment) {
            return badRequest('Recipe ID and comment content are required');
        }

        if (comment.length > COMMENT_MAX_LENGTH) {
            return validationError(
                `Comment must be ${COMMENT_MAX_LENGTH} characters or less`
            );
        }

        if (rating !== undefined && rating !== null) {
            const parsedRating = Number(rating);
            if (
                !Number.isInteger(parsedRating) ||
                parsedRating < 1 ||
                parsedRating > 5
            ) {
                return validationError(
                    'Rating must be an integer between 1 and 5'
                );
            }
        }

        const currentRecipe = await prisma.recipe.findUnique({
            where: {
                id: recipeId,
            },
            include: {
                user: true,
            },
        });

        if (!currentRecipe) {
            return badRequest('Recipe not found');
        }

        const validImageSrc = isValidR2Url(imageSrc);
        const isAuthor = currentRecipe?.userId === currentUser.id;

        const updateRecipePromise = prisma.recipe.update({
            where: {
                id: recipeId,
            },
            data: {
                comments: {
                    create: {
                        userId: currentUser.id,
                        comment: comment,
                        rating:
                            rating !== undefined && rating !== null
                                ? Number(rating)
                                : null,
                        isCooked: false,
                        imageSrc: validImageSrc,
                    },
                },
            },
            include: {
                comments: true,
            },
        });

        const notificationPromise =
            !isAuthor && currentRecipe?.user?.email
                ? sendNotification({
                      type: NotificationType.NEW_COMMENT,
                      userEmail: currentRecipe.user.email,
                      params: {
                          userName: currentUser.name,
                          recipeId: recipeId,
                          recipeName: currentRecipe?.title,
                      },
                  })
                : Promise.resolve(null);

        const [recipeAndComment] = await Promise.all([
            updateRecipePromise,
            notificationPromise,
        ]);

        if (rating !== undefined && rating !== null) {
            await recomputeRecipeRating(recipeId);
        }

        const mentionedUserIds = extractMentionedUserIds(comment);
        if (mentionedUserIds.length > 0) {
            await sendNotification({
                type: NotificationType.MENTION_IN_COMMENT,
                userEmail: currentUser.email,
                params: {
                    userName: currentUser.name,
                    recipeId: recipeId,
                    mentionedUsers: mentionedUserIds,
                },
            });
        }

        logger.info('POST /api/comments - success', {
            recipeId,
            commentId:
                recipeAndComment.comments[recipeAndComment.comments.length - 1]
                    ?.id,
        });

        // Invalidate comments cache and recipe cache for this recipe
        try {
            await Promise.all([
                redisCache.del(`recipe:comments:${recipeId}`),
                redisCache.del(`recipe:${recipeId}`),
                redisCache.del(`user:activity:graph:${currentUser.id}`),
            ]);
        } catch (cacheError: any) {
            logger.error('POST /api/comments - cache invalidation error', {
                error: cacheError.message,
                recipeId,
            });
        }

        return NextResponse.json(recipeAndComment);
    } catch (error: any) {
        logger.error('POST /api/comments - error', { error: error.message });
        return internalServerError('Failed to post comment');
    }
}
