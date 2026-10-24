import prisma from '@/app/lib/prismadb';

export interface RecipeRatingStats {
    averageRating: number;
    ratingCount: number;
}

/**
 * Recomputes and updates the recipe's averageRating and ratingCount
 * by aggregating ratings across both Comment and Cooksnap collections.
 *
 * @param recipeId - The ID of the recipe to recompute
 * @returns The updated rating stats { averageRating, ratingCount }
 */
export async function recomputeRecipeRating(
    recipeId: string
): Promise<RecipeRatingStats> {
    const [commentStats, cooksnapStats] = await Promise.all([
        prisma.comment.aggregate({
            where: {
                recipeId,
                rating: { not: null },
            },
            _sum: {
                rating: true,
            },
            _count: {
                rating: true,
            },
        }),
        prisma.cooksnap.aggregate({
            where: {
                recipeId,
                rating: { not: null },
            },
            _sum: {
                rating: true,
            },
            _count: {
                rating: true,
            },
        }),
    ]);

    const commentCount = commentStats._count.rating || 0;
    const commentSum = commentStats._sum.rating || 0;

    const cooksnapCount = cooksnapStats._count.rating || 0;
    const cooksnapSum = cooksnapStats._sum.rating || 0;

    const totalCount = commentCount + cooksnapCount;
    const totalSum = commentSum + cooksnapSum;

    const averageRating =
        totalCount > 0 ? Number((totalSum / totalCount).toFixed(2)) : 0;

    await prisma.recipe.update({
        where: { id: recipeId },
        data: {
            averageRating,
            ratingCount: totalCount,
        },
    });

    return {
        averageRating,
        ratingCount: totalCount,
    };
}
