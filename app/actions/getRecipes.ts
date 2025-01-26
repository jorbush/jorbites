import prisma from '@/app/libs/prismadb';
import ratelimit from '@/app/libs/ratelimit';
import { headers } from "next/headers";

export interface IRecipesParams {
    category?: string;
    page?: number;
    limit?: number;
}

export default async function getRecipes(params: IRecipesParams) {
    try {
        const { category, page = 1, limit = 10 } = params;

        let query: any = {};

        if (typeof category === 'string') {
            query.category = category;
        }

        const { success, reset } = await ratelimit.limit(headers().get("x-forwarded-for") ?? "");
        if(!success) {
            throw new Error(`You have made too many requests. Try again in ${Math.floor((reset - Date.now()) / 1000)} seconds.`);
        }

        const recipes = await prisma.recipe.findMany({
            where: query,
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalRecipes = await prisma.recipe.count({
            where: query,
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
        }));

        return {
            recipes: safeRecipes,
            totalRecipes,
            totalPages: Math.ceil(totalRecipes / limit),
            currentPage: page,
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to get recipes');
    }
}
