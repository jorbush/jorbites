import '@/app/lib/axiom/asyncLocalStoragePolyfill';
import prisma from '../app/lib/prismadb';
import { redisCache } from '../app/lib/redis';

export async function backfillComments() {
    console.log('Starting comments isCooked backfill...');
    try {
        // Execute native MongoDB update for missing or null isCooked field
        const rawResult: any = await prisma.$runCommandRaw({
            update: 'Comment',
            updates: [
                {
                    q: {
                        $or: [
                            { isCooked: { $exists: false } },
                            { isCooked: null },
                        ],
                    },
                    u: { $set: { isCooked: false } },
                    multi: true,
                },
            ],
        });

        if (rawResult.ok !== 1) {
            throw new Error(
                `MongoDB raw command failed: ${JSON.stringify(rawResult)}`
            );
        }

        const count = rawResult.nModified ?? rawResult.n ?? 0;
        console.log(
            `Backfilled ${count} comments with isCooked: false in MongoDB Atlas.`
        );

        // Invalidate cached comments in Redis
        try {
            console.log('Clearing recipe:comments cache keys in Redis...');
            if (redisCache && typeof (redisCache as any).keys === 'function') {
                const keys = await (redisCache as any).keys(
                    'recipe:comments:*'
                );
                if (keys && keys.length > 0) {
                    await Promise.all(
                        keys.map((key: string) => redisCache.del(key))
                    );
                    console.log(
                        `Cleared ${keys.length} cached recipe comment keys.`
                    );
                }
            }
        } catch (cacheErr) {
            console.warn(
                'Note: Redis cache clearing skipped or failed:',
                cacheErr
            );
        }

        console.log('Comment backfill completed successfully!');
    } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        if (redisCache && typeof (redisCache as any).quit === 'function') {
            try {
                await (redisCache as any).quit();
            } catch {}
        }
    }
}

if (require.main === module) {
    backfillComments()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
