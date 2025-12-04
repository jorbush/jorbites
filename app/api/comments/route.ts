import { NextResponse } from 'next/server';

import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import { EmailType } from '@/app/types/email';
import { COMMENT_MAX_LENGTH } from '@/app/utils/constants';
import { extractMentionedUserIds } from '@/app/utils/mentionUtils';
import {
    unauthorized,
    badRequest,
    validationError,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { contentCreationRatelimit } from '@/app/lib/ratelimit';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('User authentication required to post comment');
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
        const { recipeId, comment } = body;

        logger.info('POST /api/comments - start', {
            recipeId,
            userId: currentUser.id,
        });

        if (!recipeId || !comment) {
            return badRequest('Recipe ID and comment content are required');
        }

        if (comment.length > COMMENT_MAX_LENGTH) {
            return validationError(
                `Comment must be ${COMMENT_MAX_LENGTH} characters or less`
            );
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

        if (
            currentRecipe?.user.emailNotifications &&
            currentRecipe?.user.email !== currentUser.email
        ) {
            await sendEmail({
                type: EmailType.NEW_COMMENT,
                userEmail: currentRecipe?.user.email,
                params: {
                    userName: currentUser.name,
                    recipeId: recipeId,
                },
            });
        }

        const recipeAndComment = await prisma.recipe.update({
            where: {
                id: recipeId,
            },
            data: {
                comments: {
                    create: {
                        userId: currentUser.id,
                        comment: comment,
                    },
                },
            },
            include: {
                comments: true,
            },
        });

        const mentionedUserIds = extractMentionedUserIds(comment);
        if (mentionedUserIds.length > 0) {
            await sendEmail({
                type: EmailType.MENTION_IN_COMMENT,
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
        return NextResponse.json(recipeAndComment);
    } catch (error: any) {
        logger.error('POST /api/comments - error', { error: error.message });
        return internalServerError('Failed to post comment');
    }
}
