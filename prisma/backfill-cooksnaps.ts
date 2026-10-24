import { PrismaClient } from '@prisma/client';
import { redisCache } from '../app/lib/redis';
import { recomputeRecipeRating } from '../app/utils/recipeRating';

const prisma = new PrismaClient();

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

        // Deduplicate comments in memory to avoid concurrent unique constraint races
        const seenUserRecipe = new Set<string>();
        const commentsToMigrate: typeof cookedComments = [];
        const duplicateCommentsToDelete: typeof cookedComments = [];

        for (const comment of cookedComments) {
            if (!comment.imageSrc) {
                skippedCount++;
                continue;
            }

            const key = `${comment.userId}:${comment.recipeId}`;
            if (seenUserRecipe.has(key)) {
                duplicateCommentsToDelete.push(comment);
            } else {
                seenUserRecipe.add(key);
                commentsToMigrate.push(comment);
            }
        }

        // Delete duplicate comments that share the same (userId, recipeId)
        await Promise.all(
            duplicateCommentsToDelete.map(async (comment) => {
                await prisma.comment.delete({
                    where: { id: comment.id },
                });
                skippedCount++;
            })
        );

        // Migrate unique comments concurrently
        await Promise.all(
            commentsToMigrate.map(async (comment) => {
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
                    skippedCount++;
                    return;
                }

                await prisma.cooksnap.create({
                    data: {
                        userId: comment.userId,
                        recipeId: comment.recipeId,
                        imageSrc: comment.imageSrc!,
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

                migratedCount++;
            })
        );

        console.log(
            `Migration complete! Migrated: ${migratedCount}, Skipped: ${skippedCount}. Recomputing recipe ratings and clearing caches...`
        );

        await Promise.all(
            Array.from(affectedRecipeIds).map(async (recipeId) => {
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

        console.log(
            `Updated ratings and cleared cache for ${affectedRecipeIds.size} recipes.`
        );

        await Promise.all(
            Array.from(affectedUserIds).map(async (userId) => {
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
