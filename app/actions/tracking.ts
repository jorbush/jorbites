'use server';

import producer from '@/app/lib/kafka';
import { logger } from '@/app/lib/axiom/server';

export async function trackRecipeView(recipeId: string, userId?: string) {
    try {
        await producer.connect();
        await producer.send({
            topic: 'user-events',
            messages: [
                {
                    key: userId || 'anonymous',
                    value: JSON.stringify({
                        type: 'RECIPE_VIEW',
                        recipeId,
                        userId,
                        timestamp: new Date().toISOString(),
                    }),
                },
            ],
        });
    } catch (error) {
        logger.error('Failed to track recipe view', {
            recipeId,
            userId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
