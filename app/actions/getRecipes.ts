import prisma from '@/app/libs/prismadb';
import ratelimit from '@/app/libs/ratelimit';
import { headers } from 'next/headers';
import { SafeRecipe } from '@/app/types';
import getCurrentUser from '@/app/actions/getCurrentUser';

export interface IRecipesParams {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ServerResponse<T> {
    data: T | null;
    error: {
        code: string;
        message: string;
    } | null;
}

export interface RecipesResponse {
    recipes: SafeRecipe[];
    totalRecipes: number;
    totalPages: number;
    currentPage: number;
}

export default async function getRecipes(
    params: IRecipesParams
): Promise<ServerResponse<RecipesResponse>> {
    try {
        const { category, search, page = 1, limit = 10 } = params;

        let query: any = {};

        if (typeof category === 'string') {
            query.category = category;
        }

        if (typeof search === 'string' && search.trim()) {
            query.title = {
                contains: search.trim(),
                mode: 'insensitive',
            };
        }

        if (process.env.ENV === 'production') {
            const currentUser = await getCurrentUser();
            const rateLimitKey = currentUser
                ? currentUser.id
                : ((await headers()).get('x-forwarded-for') ?? '');
            const { success, reset } = await ratelimit.limit(rateLimitKey);
            if (!success) {
                return {
                    data: null,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: `You have made too many requests. Try again in ${Math.floor((reset - Date.now()) / 1000)} seconds.`,
                    },
                };
            }
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
            data: {
                recipes: safeRecipes,
                totalRecipes,
                totalPages: Math.ceil(totalRecipes / limit),
                currentPage: page,
            },
            error: null,
        };
    } catch (error: any) {
        console.error('Failed to get recipes', error);
        return {
            data: null,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to get recipes',
            },
        };
    }
}
