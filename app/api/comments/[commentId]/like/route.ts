import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    invalidInput,
    notFoundResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { redisCache } from '@/app/lib/redis';

interface IParams {
    commentId?: string;
}

export async function POST(
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
                'User authentication required to like comment'
            );
        }

        const { commentId } = params;

        logger.info('POST /api/comments/[commentId]/like - start', {
            commentId,
            userId: currentUser.id,
        });

        if (!commentId || typeof commentId !== 'string') {
            return invalidInput(
                'Comment ID is required and must be a valid string'
            );
        }

        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
        });

        if (!comment) {
            return notFoundResponse('Comment not found');
        }

        let likedIds = [...(comment.likedIds || [])];
        const alreadyLiked = likedIds.includes(currentUser.id);

        if (!alreadyLiked) {
            likedIds.push(currentUser.id);

            const updatedComment = await prisma.comment.update({
                where: {
                    id: commentId,
                },
                data: {
                    likedIds,
                },
            });

            // Invalidate cache
            try {
                await Promise.all([
                    redisCache.del(`recipe:comments:${comment.recipeId}`),
                    redisCache.del(`recipe:${comment.recipeId}`),
                ]);
            } catch (cacheError: any) {
                logger.error(
                    'POST /api/comments/[commentId]/like - cache invalidation error',
                    { error: cacheError.message, commentId }
                );
            }

            return NextResponse.json(updatedComment);
        } else {
            return NextResponse.json(comment);
        }
    } catch (error: any) {
        logger.error('POST /api/comments/[commentId]/like - error', {
            error: error.message,
        });
        return internalServerError('Failed to like comment');
    }
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
                'User authentication required to unlike comment'
            );
        }

        const { commentId } = params;

        logger.info('DELETE /api/comments/[commentId]/like - start', {
            commentId,
            userId: currentUser.id,
        });

        if (!commentId || typeof commentId !== 'string') {
            return invalidInput(
                'Comment ID is required and must be a valid string'
            );
        }

        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
        });

        if (!comment) {
            return notFoundResponse('Comment not found');
        }

        let likedIds = [...(comment.likedIds || [])];
        const isLiked = likedIds.includes(currentUser.id);

        if (isLiked) {
            likedIds = likedIds.filter((id) => id !== currentUser.id);

            const updatedComment = await prisma.comment.update({
                where: {
                    id: commentId,
                },
                data: {
                    likedIds,
                },
            });

            // Invalidate cache
            try {
                await Promise.all([
                    redisCache.del(`recipe:comments:${comment.recipeId}`),
                    redisCache.del(`recipe:${comment.recipeId}`),
                ]);
            } catch (cacheError: any) {
                logger.error(
                    'DELETE /api/comments/[commentId]/like - cache invalidation error',
                    { error: cacheError.message, commentId }
                );
            }

            return NextResponse.json(updatedComment);
        } else {
            return NextResponse.json(comment);
        }
    } catch (error: any) {
        logger.error('DELETE /api/comments/[commentId]/like - error', {
            error: error.message,
        });
        return internalServerError('Failed to unlike comment');
    }
}
