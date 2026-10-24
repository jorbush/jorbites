import { PrismaClient } from '@prisma/client';
import { redisCache } from '../app/lib/redis';
import { recomputeRecipeRating } from '../app/utils/recipeRating';

const prisma = new PrismaClient();
const BATCH_SIZE = 10;

function chunkArray<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
}

export async function backfillCooksnaps() {
    console.log('Starting Cooksnap migration backfill...');
    try {
        const cookedComments = await prisma.comment.findMany({
            where: {
                isCooked: true,
                imageSrc: {
                    not: null,
                },
            },
        });

        console.log(
            `Found ${cookedComments.length} cooked comments to migrate.`
        );

        let migratedCount = 0;
        let skippedCount = 0;
        const affectedRecipeIds = new Set<string>();
        const affectedUserIds = new Set<string>();

        const commentBatches = chunkArray(cookedComments, BATCH_SIZE);
        await commentBatches.reduce(async (chain, batch) => {
            await chain;
            const batchResults = await Promise.all(
                batch.map(async (comment) => {
                    if (!comment.imageSrc) {
                        return 'skipped';
                    }

                    affectedRecipeIds.add(comment.recipeId);
                    affectedUserIds.add(comment.userId);

                    const existingCooksnap = await prisma.cooksnap.findFirst({
                        where: {
                            userId: comment.userId,
                            recipeId: comment.recipeId,
                        },
                    });

                    if (existingCooksnap) {
                        await prisma.comment.delete({
                            where: { id: comment.id },
                        });
                        return 'skipped';
                    }

                    await prisma.cooksnap.create({
                        data: {
                            userId: comment.userId,
                            recipeId: comment.recipeId,
                            imageSrc: comment.imageSrc,
                            comment: comment.comment,
                            rating: comment.rating,
                            likedIds: comment.likedIds || [],
                            createdAt: comment.createdAt,
                        },
                    });

                    // Delete migrated comment so it no longer duplicates in the comments feed
                    await prisma.comment.delete({
                        where: { id: comment.id },
                    });

                    return 'migrated';
                })
            );

            for (const status of batchResults) {
                if (status === 'migrated') {
                    migratedCount++;
                } else {
                    skippedCount++;
                }
            }
        }, Promise.resolve());

        console.log(
            `Migration complete! Migrated: ${migratedCount}, Skipped: ${skippedCount}. Recomputing recipe ratings and clearing caches...`
        );

        const recipeBatches = chunkArray(
            Array.from(affectedRecipeIds),
            BATCH_SIZE
        );
        await recipeBatches.reduce(async (chain, batch) => {
            await chain;
            await Promise.all(
                batch.map(async (recipeId) => {
                    try {
                        await recomputeRecipeRating(recipeId);
                        await Promise.all([
                            redisCache.del(`recipe:comments:${recipeId}`),
                            redisCache.del(`recipe:cooksnaps:${recipeId}`),
                            redisCache.del(`recipe:${recipeId}`),
                        ]);
                    } catch (err) {
                        console.warn(
                            `Failed to recompute rating or clear cache for recipe ${recipeId}:`,
                            err
                        );
                    }
                })
            );
        }, Promise.resolve());

        console.log(
            `Updated ratings and cleared cache for ${affectedRecipeIds.size} recipes.`
        );

        const userBatches = chunkArray(
            Array.from(affectedUserIds),
            BATCH_SIZE
        );
        await userBatches.reduce(async (chain, batch) => {
            await chain;
            await Promise.all(
                batch.map(async (userId) => {
                    try {
                        await redisCache.del(`user:activity:graph:${userId}`);
                    } catch (err) {
                        console.warn(
                            `Failed to clear activity cache for user ${userId}:`,
                            err
                        );
                    }
                })
            );
        }, Promise.resolve());
    } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    backfillCooksnaps();
}
