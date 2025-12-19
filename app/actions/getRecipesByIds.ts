import prisma from '@/app/lib/prismadb';
import { SafeRecipe } from '@/app/types';

export default async function getRecipesByIds(
    ids: string[]
): Promise<SafeRecipe[]> {
    if (!ids || ids.length === 0) {
        return [];
    }

    try {
        const recipes = await prisma.recipe.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            include: {
                user: true,
            },
        });

        // Transform to SafeRecipe format
        return recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
            user: {
                ...recipe.user,
                createdAt: recipe.user.createdAt.toISOString(),
                updatedAt: recipe.user.updatedAt.toISOString(),
                emailVerified: recipe.user.emailVerified?.toISOString() || null,
                resetTokenExpiry:
                    recipe.user.resetTokenExpiry?.toISOString() || null,
            },
        })) as SafeRecipe[];
    } catch (error) {
        console.error('Failed to fetch recipes:', error);
        return [];
    }
}
