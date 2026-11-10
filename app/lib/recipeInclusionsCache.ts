import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';

export async function invalidateRecipeInclusionsCache(
    recipeId: string,
    userId?: string
) {
    if (!recipeId) return;

    try {
        const promises: Promise<any>[] = [
            redisCache.del(`recipe:inclusions:public:${recipeId}`),
        ];

        if (userId) {
            promises.push(
                redisCache.del(`recipe:inclusions:user:${recipeId}:${userId}`)
            );
        }

        await Promise.all(promises);
        logger.info('invalidateRecipeInclusionsCache - invalidated', {
            recipeId,
            userId,
        });
    } catch (error: any) {
        logger.error('invalidateRecipeInclusionsCache - error', {
            error: error.message,
            recipeId,
            userId,
        });
    }
}
