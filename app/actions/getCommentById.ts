import prisma from '@/app/lib/prismadb';

interface IParams {
    commentId?: string;
}

export default async function getCommentById(params: IParams) {
    try {
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
            return null;
        }

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
        throw new Error(error);
    }
}
