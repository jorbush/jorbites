import { NextResponse } from 'next/server';

import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendNotification from '@/app/actions/sendNotification';
import { NotificationType } from '@/app/types/notification';
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
import { triggerBadgeForgeEvaluation } from '@/app/lib/badgeForge';
import { isValidR2Url } from '@/app/utils/r2';
import { recomputeRecipeRating } from '@/app/utils/recipeRating';

const COOKSNAP_NOTE_MAX_LENGTH = 500;

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return unauthorizedResponse();
    }

    try {
        if (contentCreationRatelimit) {
            const identifier = currentUser.id;
            const { success, reset } =
                await contentCreationRatelimit.limit(identifier);

            if (!success) {
                const now = Date.now();
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - now) / 1000)
                );
                logger.warn('POST /api/cooksnaps - rate limited', {
                    userId: currentUser.id,
                    retryAfterSeconds,
                });
                return rateLimitExceeded(
                    `Too many cooksnaps. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json();
        const { recipeId, imageSrc, comment, rating } = body;

        logger.info('POST /api/cooksnaps - start', {
            recipeId,
            userId: currentUser.id,
            rating,
            hasImage: Boolean(imageSrc),
        });

        if (!recipeId) {
            return badRequest('Recipe ID is required');
        }

        if (!imageSrc) {
            return badRequest('Dish photo is required to share a Cooksnap');
        }

        const validImageSrc = isValidR2Url(imageSrc);
        if (!validImageSrc) {
            return validationError('Invalid image URL format or domain');
        }

        if (comment && comment.length > COOKSNAP_NOTE_MAX_LENGTH) {
            return validationError(
                `Note must be ${COOKSNAP_NOTE_MAX_LENGTH} characters or less`
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

        const existingCooksnap = await prisma.cooksnap.findFirst({
            where: {
                userId: currentUser.id,
                recipeId: recipeId,
            },
        });

        if (existingCooksnap) {
            return badRequest(
                'You have already shared a cooksnap for this recipe'
            );
        }

        const createdCooksnap = await prisma.cooksnap.create({
            data: {
                userId: currentUser.id,
                recipeId: recipeId,
                imageSrc: validImageSrc,
                comment: comment ? String(comment).trim() : null,
                rating:
                    rating !== undefined && rating !== null
                        ? Number(rating)
                        : null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        verified: true,
                        level: true,
                        badges: true,
                    },
                },
            },
        });

        if (rating !== undefined && rating !== null) {
            await recomputeRecipeRating(recipeId);
        }

        const isAuthor = currentRecipe.userId === currentUser.id;
        if (!isAuthor && currentRecipe.user?.email) {
            await sendNotification({
                type: NotificationType.NEW_COOKSNAP,
                userEmail: currentRecipe.user.email,
                params: {
                    userName: currentUser.name,
                    recipeId: recipeId,
                    recipeName: currentRecipe.title,
                },
            }).catch((err: unknown) =>
                logger.warn('POST /api/cooksnaps - notification error', {
                    error: err instanceof Error ? err.message : String(err),
                })
            );
        }

        triggerBadgeForgeEvaluation(currentUser.id, 'COOKSNAP_POSTED').catch(
            (err: unknown) =>
                logger.warn('POST /api/cooksnaps - badge evaluation error', {
                    error: err instanceof Error ? err.message : String(err),
                })
        );

        logger.info('POST /api/cooksnaps - success', {
            recipeId,
            cooksnapId: createdCooksnap.id,
        });

        // Invalidate cooksnaps cache, recipe cache, and user activity graph
        try {
            await Promise.all([
                redisCache.del(`recipe:cooksnaps:${recipeId}`),
                redisCache.del(`recipe:${recipeId}`),
                redisCache.del(`user:activity:graph:${currentUser.id}`),
            ]);
        } catch (cacheError: any) {
            logger.error('POST /api/cooksnaps - cache invalidation error', {
                error: cacheError.message,
                recipeId,
            });
        }

        return NextResponse.json(createdCooksnap, { status: 201 });
    } catch (error: any) {
        logger.error('POST /api/cooksnaps - error', { error: error.message });
        return internalServerError('Failed to create cooksnap');
    }
}
