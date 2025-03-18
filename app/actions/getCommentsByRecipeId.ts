import prisma from '@/app/libs/prismadb';

interface IParams {
    recipeId?: string;
}

export default async function getCommentsByRecipeId(params: IParams) {
    try {
        const { recipeId } = params;
        if (!recipeId) {
            return null;
        }
        const comments = await prisma.comment.findMany({
            where: {
                recipeId: recipeId,
            },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!comments) {
            return [];
        }
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
        return safeComments;
    } catch (error) {
        console.error('Error in getCommentsByRecipeId:', error);
        return [];
    }
}
