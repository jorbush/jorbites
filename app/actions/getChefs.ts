import prisma from '@/app/lib/prismadb';
import { SafeUser } from '@/app/types';
import { logger } from '@/app/lib/axiom/server';
import { ChefOrderByType } from '@/app/utils/filter';

// Re-export for convenience in server components
export { ChefOrderByType };

export interface IChefsParams {
    search?: string;
    page?: number;
    limit?: number;
    orderBy?: ChefOrderByType;
}

export interface ServerResponse<T> {
    data: T | null;
    error?: {
        code: string;
        message: string;
    };
}

export interface ChefsResponse {
    chefs: SafeUser[];
    totalChefs: number;
    totalPages: number;
    currentPage: number;
}

export default async function getChefs(
    params: IChefsParams
): Promise<ServerResponse<ChefsResponse>> {
    try {
        logger.info('getChefs - start', { params });
        const {
            search,
            page = 1,
            limit = 12,
            orderBy = ChefOrderByType.TRENDING,
        } = params;

        let query: any = {};

        if (typeof search === 'string' && search.trim()) {
            query.name = {
                contains: search.trim(),
                mode: 'insensitive',
            };
        }

        const needsRecipeDataForSorting =
            orderBy === ChefOrderByType.TRENDING ||
            orderBy === ChefOrderByType.MOST_RECIPES ||
            orderBy === ChefOrderByType.MOST_LIKED;

        const users = await prisma.user.findMany({
            where: query,
            orderBy: needsRecipeDataForSorting
                ? undefined
                : getBasicOrderByClause(orderBy),
            skip: needsRecipeDataForSorting ? undefined : (page - 1) * limit,
            take: needsRecipeDataForSorting ? undefined : limit,
        });

        const totalChefs = await prisma.user.count({
            where: query,
        });

        const userIds = users.map((user) => user.id);
        const allRecipes = await prisma.recipe.findMany({
            where: {
                userId: { in: userIds },
            },
            select: {
                userId: true,
                numLikes: true,
                createdAt: true,
                minutes: true,
                categories: true,
                category: true, // Legacy field for backward compatibility
            },
        });

        const recipesByUserId: Record<
            string,
            Array<{
                userId: string;
                numLikes: number | null;
                createdAt: Date;
                minutes: number | null;
                categories: string[] | null;
                category: string | null; // Legacy field
            }>
        > = {};
        allRecipes.forEach((recipe) => {
            if (!recipesByUserId[recipe.userId]) {
                recipesByUserId[recipe.userId] = [];
            }
            recipesByUserId[recipe.userId].push(recipe);
        });

        const enrichedUsers = users.map((user) => {
            const userRecipes = recipesByUserId[user.id] || [];

            const totalLikes = userRecipes.reduce(
                (total, recipe) => total + (recipe.numLikes || 0),
                0
            );

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const recipesThisYear = userRecipes.filter(
                (recipe) => recipe.createdAt.getFullYear() === currentYear
            ).length;
            const recipesThisMonth = userRecipes.filter(
                (recipe) =>
                    recipe.createdAt.getFullYear() === currentYear &&
                    recipe.createdAt.getMonth() === currentMonth
            ).length;

            const totalCookingTime = userRecipes.reduce(
                (total, recipe) => total + (recipe.minutes || 0),
                0
            );

            const avgLikesPerRecipe =
                userRecipes.length > 0
                    ? Math.round(totalLikes / userRecipes.length)
                    : 0;

            const categoryCount: Record<string, number> = {};
            userRecipes.forEach((recipe) => {
                // Handle both legacy 'category' and new 'categories' field
                const recipeCategories = Array.isArray(recipe.categories)
                    ? recipe.categories
                    : recipe.category
                    ? [recipe.category]
                    : [];

                recipeCategories.forEach((cat) => {
                    if (cat) {
                        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                    }
                });
            });
            const mostUsedCategory =
                Object.keys(categoryCount).length > 0
                    ? Object.entries(categoryCount).reduce((a, b) =>
                          a[1] > b[1] ? a : b
                      )[0]
                    : null;

            return {
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                emailVerified: user.emailVerified?.toISOString() || null,
                recipeCount: userRecipes.length,
                likesReceived: totalLikes,
                recipesThisYear,
                recipesThisMonth,
                totalCookingTime,
                avgLikesPerRecipe,
                mostUsedCategory,
            };
        });

        const sortedChefs = sortChefsData(enrichedUsers, orderBy);

        const paginatedChefs = needsRecipeDataForSorting
            ? sortedChefs.slice((page - 1) * limit, page * limit)
            : sortedChefs;

        const totalPages = Math.ceil(totalChefs / limit);

        logger.info('getChefs - success', {
            count: paginatedChefs.length,
            totalChefs,
        });

        return {
            data: {
                chefs: paginatedChefs,
                totalChefs,
                totalPages,
                currentPage: page,
            },
        };
    } catch (error: any) {
        logger.error('getChefs - error', { error: error.message });
        return {
            data: null,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch chefs',
            },
        };
    }
}

function getBasicOrderByClause(orderBy: ChefOrderByType) {
    switch (orderBy) {
        case ChefOrderByType.OLDEST:
            return { createdAt: 'asc' } as const;
        case ChefOrderByType.NAME_ASC:
            return { name: 'asc' } as const;
        case ChefOrderByType.NAME_DESC:
            return { name: 'desc' } as const;
        case ChefOrderByType.HIGHEST_LEVEL:
            return { level: 'desc' } as const;
        case ChefOrderByType.NEWEST:
        default:
            return { createdAt: 'desc' } as const;
    }
}

function sortChefsData(
    chefs: SafeUser[],
    orderBy: ChefOrderByType
): SafeUser[] {
    const sorted = [...chefs];

    switch (orderBy) {
        case ChefOrderByType.TRENDING:
            return sorted.sort(
                (a, b) => (b.recipesThisMonth || 0) - (a.recipesThisMonth || 0)
            );
        case ChefOrderByType.MOST_RECIPES:
            return sorted.sort(
                (a, b) => (b.recipeCount || 0) - (a.recipeCount || 0)
            );
        case ChefOrderByType.MOST_LIKED:
            return sorted.sort(
                (a, b) => (b.likesReceived || 0) - (a.likesReceived || 0)
            );
        default:
            return sorted;
    }
}
