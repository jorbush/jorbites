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
} from '@/app/utils/apiErrors';
import { logger, withAxiom } from '@/app/lib/axiom/server';

export const POST = withAxiom(async (request: Request) => {
    try {
        logger.info('POST /api/comments - start');
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('User authentication required to post comment');
        }

        const body = await request.json();
        const { recipeId, comment } = body;

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
});
