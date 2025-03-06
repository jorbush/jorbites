import prisma from '@/app/libs/prismadb';

interface IParams {
    userId?: string;
    withStats?: boolean;
}

export default async function getUserById(params: IParams) {
    try {
        const { userId } = params;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            return null;
        }

        if (params.withStats) {
            const userRecipes = await prisma.recipe.findMany({
                where: {
                    userId: user.id,
                },
            });

            const totalLikes = userRecipes.reduce(
                (total, recipe) => total + (recipe.numLikes || 0),
                0
            );

            return {
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                emailVerified: user.emailVerified?.toISOString() || null,
                recipeCount: userRecipes.length,
                likesReceived: totalLikes,
            };
        }

        return {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            emailVerified: user.emailVerified?.toISOString() || null,
        };
    } catch (error: any) {
        console.log(error);
        return null;
    }
}
