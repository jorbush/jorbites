import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    userId?: string;
    withStats?: boolean;
}

export default async function getUserById(params: IParams) {
    try {
        logger.info('getUserById - start', {
            userId: params.userId,
            withStats: params.withStats,
        });
        const { userId } = params;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            logger.info('getUserById - user not found', { userId });
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
                // Handle both legacy 'category' and new 'categories' field
                const recipeCategories = Array.isArray((recipe as any).categories)
                    ? (recipe as any).categories
                    : (recipe as any).category
                    ? [(recipe as any).category]
                    : [];

                recipeCategories.forEach((cat: string) => {
                    if (cat) {
                        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                    }
                });
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

        logger.info('getUserById - success', {
            userId,
            withStats: params.withStats,
        });
        return {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            emailVerified: user.emailVerified?.toISOString() || null,
        };
    } catch (error: any) {
        logger.error('getUserById - error', {
            error: error.message,
            userId: params.userId,
        });
        return null;
    }
}
