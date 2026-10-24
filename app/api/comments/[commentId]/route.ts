import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import getCommentById from '@/app/actions/getCommentById';
import {
    unauthorizedResponse,
    invalidInput,
    notFoundResponse,
    forbiddenResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { redisCache } from '@/app/lib/redis';
import { deleteFromR2 } from '@/app/utils/r2';
import { recomputeRecipeRating } from '@/app/utils/recipeRating';

interface IParams {
    commentId?: string;
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const [params, currentUser] = await Promise.all([
            props.params,
            getCurrentUser(),
        ]);

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to delete comment'
            );
        }

        const { commentId } = params;

        logger.info('DELETE /api/comments/[commentId] - start', {
            commentId,
            userId: currentUser.id,
        });

        if (!commentId || typeof commentId !== 'string') {
            return invalidInput(
                'Comment ID is required and must be a valid string'
            );
        }

        const comment = await getCommentById({ commentId });

        if (!comment) {
            return notFoundResponse('Comment not found');
        }

        if (comment.userId !== currentUser.id) {
            return forbiddenResponse('You can only delete your own comments');
        }

        const deletedComment = await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });

        if (comment.rating !== null && comment.rating !== undefined) {
            await recomputeRecipeRating(comment.recipeId);
        }

        if (comment.imageSrc) {
            try {
                await deleteFromR2(comment.imageSrc);
            } catch (r2Error: any) {
                logger.error(
                    'DELETE /api/comments/[commentId] - R2 deletion error',
                    {
                        error: r2Error?.message || String(r2Error),
                        imageSrc: comment.imageSrc,
                    }
                );
            }
        }

        logger.info('DELETE /api/comments/[commentId] - success', {
            commentId,
        });

        // Invalidate comments cache and recipe cache for the recipe this comment belonged to
        try {
            await Promise.all([
                redisCache.del(`recipe:comments:${comment.recipeId}`),
                redisCache.del(`recipe:${comment.recipeId}`),
            ]);
        } catch (cacheError: any) {
            logger.error(
                'DELETE /api/comments/[commentId] - cache invalidation error',
                { error: cacheError.message, commentId }
            );
        }

        return NextResponse.json(deletedComment);
    } catch (error: any) {
        logger.error('DELETE /api/comments/[commentId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to delete comment');
    }
}
