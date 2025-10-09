import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    recipeId?: string;
}

export default async function getCommentsByRecipeId(params: IParams) {
    try {
        logger.info('getCommentsByRecipeId - start', {
            recipeId: params.recipeId,
        });
        const { recipeId } = params;

        const query: any = {};

        if (recipeId) {
            query.recipeId = recipeId;
        }

        const comments = await prisma.comment.findMany({
            where: query,
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const safeComments = comments.map((comment) => ({
            ...comment,
            createdAt: comment.createdAt.toISOString(),
            user: {
                ...comment.user,
                createdAt: comment.user.createdAt.toISOString(),
                updatedAt: comment.user.updatedAt.toISOString(),
                emailVerified:
                    comment.user.emailVerified?.toISOString() || null,
            },
        }));

        logger.info('getCommentsByRecipeId - success', {
            recipeId,
            count: safeComments.length,
        });
        return safeComments;
    } catch (error: any) {
        logger.error('getCommentsByRecipeId - error', {
            error: error.message,
            recipeId: params.recipeId,
        });
        throw new Error(error);
    }
}
