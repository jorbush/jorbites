import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { SafeRecipe } from '@/app/types';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { Prisma } from '@prisma/client';

export interface IGetBiteCardsParams {
    limit?: number;
    excludeIds?: string[];
}

export default async function getBiteCards(
    params: IGetBiteCardsParams = {}
): Promise<SafeRecipe[]> {
    try {
        const currentUser = await getCurrentUser();
        const { limit = 20, excludeIds = [] } = params;

        logger.info('getBiteCards - start', {
            userId: currentUser?.id,
            limit,
            excludeIdsCount: excludeIds.length,
        });

        const excludedIdsSet = new Set<string>();

        if (
            currentUser?.favoriteIds &&
            Array.isArray(currentUser.favoriteIds)
        ) {
            currentUser.favoriteIds.forEach((id) => excludedIdsSet.add(id));
        }

        if (Array.isArray(excludeIds)) {
            excludeIds.forEach((id) => {
                if (id) excludedIdsSet.add(id);
            });
        }

        const excludedIds = Array.from(excludedIdsSet);

        const query: Prisma.RecipeWhereInput = {};
        if (excludedIds.length > 0) {
            query.id = {
                notIn: excludedIds,
            };
        }

        let candidates = await prisma.recipe.findMany({
            where: query,
            orderBy: [
                { averageRating: 'desc' },
                { numLikes: 'desc' },
                { createdAt: 'desc' },
            ],
            take: Math.max(limit * 2, 40),
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        if (candidates.length < limit && excludeIds.length > 0) {
            const fallbackQuery: Prisma.RecipeWhereInput = {};
            if (
                currentUser?.favoriteIds &&
                currentUser.favoriteIds.length > 0
            ) {
                fallbackQuery.id = {
                    notIn: currentUser.favoriteIds,
                };
            }
            candidates = await prisma.recipe.findMany({
                where: fallbackQuery,
                orderBy: [
                    { averageRating: 'desc' },
                    { numLikes: 'desc' },
                    { createdAt: 'desc' },
                ],
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            });
        }

        const shuffled = [...candidates]
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);

        const safeRecipes = shuffled.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
        }));

        logger.info('getBiteCards - success', {
            count: safeRecipes.length,
            userId: currentUser?.id,
        });

        return safeRecipes;
    } catch (error: any) {
        logger.error('getBiteCards - error', {
            error: error?.message || error,
        });
        throw error;
    }
}
