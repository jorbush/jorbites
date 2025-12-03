import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { OrderByType, getPrismaOrderByClause } from '@/app/utils/filter';
import { formatDate } from '@/app/utils/date-utils';

interface IParams {
    userId?: string;
    orderBy?: OrderByType;
    forGraph?: boolean;
}

interface ContributionData {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

const getContributionLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
};

export default async function getRecipesByUserId(params: IParams) {
    try {
        logger.info('getRecipesByUserId - start', {
            userId: params.userId,
            forGraph: params.forGraph,
        });
        const { userId, orderBy = OrderByType.NEWEST, forGraph = false } =
            params;

        if (forGraph) {
            const recipes = await prisma.recipe.findMany({
                where: {
                    userId: userId,
                },
                select: {
                    createdAt: true,
                },
            });

            const contributions: { [date: string]: number } = {};
            recipes.forEach((recipe) => {
                const date = formatDate(recipe.createdAt, 'yyyy-MM-dd');
                contributions[date] = (contributions[date] || 0) + 1;
            });

            const contributionData: ContributionData[] = Object.entries(
                contributions
            ).map(([date, count]) => ({
                date,
                count,
                level: getContributionLevel(count),
            }));

            logger.info('getRecipesByUserId - success (for graph)', {
                userId,
                count: contributionData.length,
            });

            return contributionData;
        }

        const recipes = await prisma.recipe.findMany({
            where: {
                userId: userId,
            },
            orderBy: getPrismaOrderByClause(orderBy),
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toString(),
        }));

        logger.info('getRecipesByUserId - success', {
            userId,
            count: safeRecipes.length,
            orderBy,
        });
        return safeRecipes;
    } catch (error: any) {
        logger.error('getRecipesByUserId - error', {
            error: error.message,
            userId: params.userId,
        });
        throw new Error(error);
    }
}
