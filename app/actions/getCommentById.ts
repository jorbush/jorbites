import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    commentId?: string;
}

export default async function getCommentById(params: IParams) {
    try {
        logger.info('getCommentById - start', { commentId: params.commentId });
        const { commentId } = params;

        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
            include: {
                user: true,
            },
        });

        if (!comment) {
            logger.info('getCommentById - comment not found', { commentId });
            return null;
        }

        logger.info('getCommentById - success', { commentId });
        return {
            ...comment,
            createdAt: comment.createdAt.toISOString(),
            user: {
                ...comment.user,
                createdAt: comment.user.createdAt.toISOString(),
                updatedAt: comment.user.updatedAt.toISOString(),
                emailVerified: comment.user.emailVerified?.toString() || null,
            },
        };
    } catch (error: any) {
        logger.error('getCommentById - error', {
            error: error.message,
            commentId: params.commentId,
        });
        throw new Error(error);
    }
}
