import prisma from "@/app/libs/prismadb";

export interface IRecipesParams {
    category?: string;
    page?: number;
    limit?: number;
}

export default async function getRecipes(
    params: IRecipesParams
){
    try {
        const { category, page = 1, limit = 10 } = params;

        let query: any = {};

        if (typeof category === 'string') {
            query.category = category;
        }

        const recipes = await prisma.listing.findMany({
            where: query,
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit
        });

        const totalRecipes = await prisma.listing.count({ where: query });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toISOString()
        }));

        return {
            recipes: safeRecipes,
            totalRecipes,
            totalPages: Math.ceil(totalRecipes / limit),
            currentPage: page
        };
    } catch (error: any) {
        throw new Error(error);
    }
}
