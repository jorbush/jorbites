'use server';

import producer from '@/app/lib/kafka';
import { logger } from '@/app/lib/axiom/server';
import { UserEventType, UserInteractionData } from '@/app/types/tracking';

export async function trackUserInteraction(
    eventType: UserEventType,
    data: UserInteractionData
) {
    const { recipeId, userId, metadata } = data;
    try {
        await producer.connect();
        await producer.send({
            topic: 'user-events',
            messages: [
                {
                    key: userId || 'anonymous',
                    value: JSON.stringify({
                        type: eventType,
                        recipeId,
                        userId,
                        timestamp: new Date().toISOString(),
                        metadata,
                    }),
                },
            ],
        });
    } catch (error) {
        logger.error('Failed to track user interaction', {
            eventType,
            recipeId,
            userId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function trackRecipeView(recipeId: string, userId: string) {
    return trackUserInteraction(UserEventType.RECIPE_VIEW, {
        recipeId,
        userId,
    });
}

export async function trackRecipeLike(recipeId: string, userId: string) {
    return trackUserInteraction(UserEventType.RECIPE_LIKE, {
        recipeId,
        userId,
    });
}

export async function trackRecipeUnlike(recipeId: string, userId: string) {
    return trackUserInteraction(UserEventType.RECIPE_UNLIKE, {
        recipeId,
        userId,
    });
}

export async function trackRecipeSave(recipeId: string, userId: string) {
    return trackUserInteraction(UserEventType.RECIPE_SAVE, {
        recipeId,
        userId,
    });
}

export async function trackRecipeUnsave(recipeId: string, userId: string) {
    return trackUserInteraction(UserEventType.RECIPE_UNSAVE, {
        recipeId,
        userId,
    });
}

export async function trackRecipeCooked(
    recipeId: string,
    userId: string,
    metadata?: Record<string, unknown>
) {
    return trackUserInteraction(UserEventType.RECIPE_COOKED, {
        recipeId,
        userId,
        metadata,
    });
}
