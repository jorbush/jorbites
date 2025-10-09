import prisma from '@/app/lib/prismadb';

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

            const currentYear = new Date().getFullYear();
            const recipesThisYear = userRecipes.filter(
                (recipe) =>
                    new Date(recipe.createdAt).getFullYear() === currentYear
            ).length;

            const totalCookingTime = userRecipes.reduce(
                (total, recipe) => total + recipe.minutes,
                0
            );

            const avgLikesPerRecipe =
                userRecipes.length > 0
                    ? Math.round((totalLikes / userRecipes.length) * 10) / 10
                    : 0;

            const categoryCounts: Record<string, number> = {};
            userRecipes.forEach((recipe) => {
                categoryCounts[recipe.category] =
                    (categoryCounts[recipe.category] || 0) + 1;
            });

            let mostUsedCategory = '';
            let maxCategoryCount = 0;

            Object.entries(categoryCounts).forEach(([category, count]) => {
                if (count > maxCategoryCount) {
                    mostUsedCategory = category;
                    maxCategoryCount = count;
                }
            });

            const methodCounts: Record<string, number> = {};
            userRecipes.forEach((recipe) => {
                methodCounts[recipe.method] =
                    (methodCounts[recipe.method] || 0) + 1;
            });

            let mostUsedMethod = '';
            let maxMethodCount = 0;

            Object.entries(methodCounts).forEach(([method, count]) => {
                if (count > maxMethodCount) {
                    mostUsedMethod = method;
                    maxMethodCount = count;
                }
            });

            return {
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                emailVerified: user.emailVerified?.toISOString() || null,
                recipeCount: userRecipes.length,
                likesReceived: totalLikes,
                recipesThisYear,
                totalCookingTime,
                avgLikesPerRecipe,
                mostUsedCategory,
                mostUsedMethod,
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
