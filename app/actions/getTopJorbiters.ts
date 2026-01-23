import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';

export default async function getTopJorbiters() {
    try {
        const cacheKey = 'top_jorbiters';
        const cachedData = await redisCache.get(cacheKey);

        if (cachedData) {
            logger.info('getTopJorbiters - cache hit');
            return JSON.parse(cachedData);
        }

        logger.info('getTopJorbiters - start');
        const users = await prisma.user.findMany({
            orderBy: {
                level: 'desc',
            },
            take: 10,
        });

        if (!users) {
            return null;
        }

        const usersWithLikes = await Promise.all(
            users.map(async (user) => {
                const userRecipes = await prisma.recipe.findMany({
                    where: {
                        userId: user.id,
                    },
                });

                const totalLikes = userRecipes.reduce(
                    (total, recipe) => total + (recipe.numLikes || 0),
                    0
                );

                return {
                    ...user,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                    emailVerified: user.emailVerified?.toISOString() || null,
                    recipeCount: userRecipes.length,
                    likesReceived: totalLikes,
                };
            })
        );

        logger.info('getTopJorbiters - success', {
            count: usersWithLikes.length,
        });

        await redisCache.set(
            cacheKey,
            JSON.stringify(usersWithLikes),
            'EX',
            86400
        ); // 1 day

        return usersWithLikes;
    } catch (error: any) {
        logger.error('getTopJorbiters - error', { error: error.message });
        return error;
    }
}
