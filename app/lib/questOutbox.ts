import prisma from '@/app/lib/prismadb';
import { triggerBadgeForgeEvaluation } from '@/app/lib/badgeForge';
import { logger } from '@/app/lib/axiom/server';

export async function processPendingBadgeEvaluations(): Promise<{
    processed: number;
    succeeded: number;
}> {
    try {
        const pendingQuests = await prisma.quest.findMany({
            where: {
                status: 'completed',
                badgeEvaluated: false,
                acceptedSolverId: { not: null },
            },
            take: 50,
        });

        if (pendingQuests.length === 0) {
            return { processed: 0, succeeded: 0 };
        }

        logger.info('Processing pending quest badge evaluations outbox', {
            count: pendingQuests.length,
        });

        const results = await Promise.all(
            pendingQuests.map(async (quest) => {
                if (!quest.acceptedSolverId) return false;
                const success = await triggerBadgeForgeEvaluation(
                    quest.acceptedSolverId
                );
                if (success) {
                    await prisma.quest.update({
                        where: { id: quest.id },
                        data: { badgeEvaluated: true },
                    });
                    return true;
                }
                return false;
            })
        );

        const succeeded = results.filter(Boolean).length;

        return { processed: pendingQuests.length, succeeded };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error('Error processing pending quest badge evaluations', {
            error: errorMessage,
        });
        return { processed: 0, succeeded: 0 };
    }
}
