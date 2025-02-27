import prisma from '@/app/libs/prismadb';

export default async function getTopJorbiters() {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                level: 'desc',
            },
            take: 10,
        });

        if (!users) {
            return null;
        }

        const usersWithLikes = await Promise.all(
            users.map(async (user) => {
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
            })
        );

        return usersWithLikes;
    } catch (error: any) {
        console.error(error);
        return error;
    }
}
