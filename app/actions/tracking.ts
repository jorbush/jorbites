'use server';

import producer, { kafkaStatus } from '@/app/lib/kafka';
import { logger } from '@/app/lib/axiom/server';
import { UserEventType, UserInteractionData } from '@/app/types/tracking';

const KAFKA_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`Kafka operation timed out after ${ms}ms`));
        }, ms);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutHandle);
    });
}

export async function trackUserInteraction(
    eventType: UserEventType,
    data: UserInteractionData
) {
    const { recipeId, userId, metadata } = data;

    if (!producer) {
        if (process.env.NODE_ENV !== 'production') {
            logger.info(`[Kafka Disabled] Mock send: ${eventType}`, {
                recipeId,
                userId,
                metadata,
            });
        } else {
            logger.warn(
                `[Kafka Disabled] Dropping tracking event in production: ${eventType}`,
                {
                    recipeId,
                    userId,
                }
            );
        }
        return;
    }

    try {
        if (!kafkaStatus.isConnected) {
            await withTimeout(producer.connect(), KAFKA_TIMEOUT_MS);
            kafkaStatus.isConnected = true;
        }
        await withTimeout(
            producer.send({
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
            }),
            KAFKA_TIMEOUT_MS
        );
    } catch (error) {
        kafkaStatus.isConnected = false;
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
