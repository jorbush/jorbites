import { NextResponse } from 'next/server';

import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import { EmailType } from '@/app/types/email';
import { COMMENT_MAX_LENGTH } from '@/app/utils/constants';
import {
    unauthorized,
    badRequest,
    validationError,
    internalServerError,
} from '@/app/utils/apiErrors';

export async function POST(request: Request) {
    try {
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

        return NextResponse.json(recipeAndComment);
    } catch (error) {
        console.error('Error posting comment:', error);
        return internalServerError('Failed to post comment');
    }
}
