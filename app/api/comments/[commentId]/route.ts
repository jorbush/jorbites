import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import getCommentById from '@/app/actions/getCommentById';
import {
    unauthorized,
    invalidInput,
    notFound,
    forbidden,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { redisCache } from '@/app/lib/redis';

interface IParams {
    commentId?: string;
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
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
            return notFound('Comment not found');
        }

        if (comment.userId !== currentUser.id) {
            return forbidden('You can only delete your own comments');
        }

        const deletedComment = await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });

        // Recalculate average rating and review count
        const stats = await prisma.comment.aggregate({
            where: {
                recipeId: comment.recipeId,
                rating: { not: null },
            },
            _avg: {
                rating: true,
            },
            _count: {
                rating: true,
            },
        });

        await prisma.recipe.update({
            where: {
                id: comment.recipeId,
            },
            data: {
                averageRating: stats._avg.rating || 0,
                ratingCount: stats._count.rating || 0,
            },
        });

        logger.info('DELETE /api/comments/[commentId] - success', {
            commentId,
        });

        // Invalidate comments cache and recipe cache for the recipe this comment belonged to
        try {
            await redisCache.del(`recipe:comments:${comment.recipeId}`);
            await redisCache.del(`recipe:${comment.recipeId}`);
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
