import prisma from '@/app/libs/prismadb';

interface IParams {
    userId?: string;
}

export default async function getRecipesByUserId(
    params: IParams
) {
    try {
        const { userId } = params;

        const recipes = await prisma.recipe.findMany({
            where: {
                userId: userId,
            },
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toString(),
        }));

        return safeRecipes;
    } catch (error: any) {
        throw new Error(error);
    }
}
