import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function backfillQuests() {
    console.log('Starting quest badgeEvaluated backfill...');
    try {
        // Execute native MongoDB update for missing or null badgeEvaluated field
        const rawResult: any = await prisma.$runCommandRaw({
            update: 'Quest',
            updates: [
                {
                    q: {
                        $or: [
                            { badgeEvaluated: { $exists: false } },
                            { badgeEvaluated: null },
                        ],
                    },
                    u: { $set: { badgeEvaluated: false } },
                    multi: true,
                },
            ],
        });

        if (rawResult.ok !== 1) {
            throw new Error(
                `MongoDB raw command failed: ${JSON.stringify(rawResult)}`
            );
        }

        console.log(
            `Backfilled ${rawResult.nModified ?? rawResult.n ?? 0} quests with badgeEvaluated: false`
        );
    } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    backfillQuests();
}
