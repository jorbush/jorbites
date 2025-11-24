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

        // Get users with basic sorting
        const users = await prisma.user.findMany({
            where: query,
            orderBy: getBasicOrderByClause(orderBy),
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalChefs = await prisma.user.count({
            where: query,
        });

        // Enrich users with recipe statistics
        const enrichedUsers = await Promise.all(
            users.map(async (user) => {
                const userRecipes = await prisma.recipe.findMany({
                    where: {
                        userId: user.id,
                    },
                    select: {
                        numLikes: true,
                        createdAt: true,
                        minutes: true,
                        category: true,
                    },
                });

                const totalLikes = userRecipes.reduce(
                    (total, recipe) => total + (recipe.numLikes || 0),
                    0
                );

                const currentYear = new Date().getFullYear();
                const recipesThisYear = userRecipes.filter(
                    (recipe) => recipe.createdAt.getFullYear() === currentYear
                ).length;

                const totalCookingTime = userRecipes.reduce(
                    (total, recipe) => total + (recipe.minutes || 0),
                    0
                );

                const avgLikesPerRecipe =
                    userRecipes.length > 0
                        ? Math.round(totalLikes / userRecipes.length)
                        : 0;

                // Get most used category
                const categoryCount: Record<string, number> = {};
                userRecipes.forEach((recipe) => {
                    if (recipe.category) {
                        categoryCount[recipe.category] =
                            (categoryCount[recipe.category] || 0) + 1;
                    }
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
                    totalCookingTime,
                    avgLikesPerRecipe,
                    mostUsedCategory,
                };
            })
        );

        // Sort enriched data if needed
        const sortedChefs = sortChefsData(enrichedUsers, orderBy);

        const totalPages = Math.ceil(totalChefs / limit);

        logger.info('getChefs - success', {
            count: sortedChefs.length,
            totalChefs,
        });

        return {
            data: {
                chefs: sortedChefs,
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
                (a, b) => (b.recipesThisYear || 0) - (a.recipesThisYear || 0)
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
