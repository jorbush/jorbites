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

        for (const comment of cookedComments) {
            if (!comment.imageSrc) continue;

            affectedRecipeIds.add(comment.recipeId);

            const existingCooksnap = await prisma.cooksnap.findFirst({
                where: {
                    userId: comment.userId,
                    recipeId: comment.recipeId,
                    imageSrc: comment.imageSrc,
                },
            });

            if (existingCooksnap) {
                skippedCount++;
            } else {
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
                migratedCount++;
            }

            // Delete migrated comment so it no longer duplicates in the comments feed
            await prisma.comment.delete({
                where: { id: comment.id },
            });
        }

        console.log(
            `Migration complete! Migrated: ${migratedCount}, Skipped: ${skippedCount}. Recomputing recipe ratings and clearing caches...`
        );

        for (const recipeId of Array.from(affectedRecipeIds)) {
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
        }

        console.log(`Updated ratings and cleared cache for ${affectedRecipeIds.size} recipes.`);
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
