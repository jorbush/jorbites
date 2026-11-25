import prisma from '@/app/lib/prismadb';
import { deleteUserPrefixFromCloudinary } from '@/app/utils/cloudinary';
import { deleteUserPrefixFromR2 } from '@/app/utils/r2';
import { logger } from '@/app/lib/axiom/server';

const DEFAULT_BATCH_SIZE = 5;

export interface MediaCleanupOutboxSummary {
    processed: number;
    completed: number;
    pending: number;
    skipped: number;
    cloudinaryDeleted: number;
    r2Deleted: number;
}

/**
 * Processes pending asynchronous media cleanup jobs for deleted user accounts.
 * Runs sequentially over a bounded batch so serverless executions stay well
 * below timeout limits and respect Cloudinary / R2 API rate limits.
 */
export async function processPendingMediaCleanups(
    batchSize = DEFAULT_BATCH_SIZE
): Promise<MediaCleanupOutboxSummary> {
    const summary: MediaCleanupOutboxSummary = {
        processed: 0,
        completed: 0,
        pending: 0,
        skipped: 0,
        cloudinaryDeleted: 0,
        r2Deleted: 0,
    };

    try {
        const pendingJobs = await prisma.pendingMediaCleanup.findMany({
            orderBy: [{ attempts: 'asc' }, { requestedAt: 'asc' }],
            take: batchSize,
        });

        if (pendingJobs.length === 0) {
            return summary;
        }

        const candidateUserIds = pendingJobs.map((job) => job.userId);
        const existingUsers = await prisma.user.findMany({
            where: { id: { in: candidateUserIds } },
            select: { id: true },
        });
        const activeUserIds = new Set(existingUsers.map((u) => u.id));

        logger.info('Processing pending media cleanup outbox', {
            count: pendingJobs.length,
        });

        for (const job of pendingJobs) {
            summary.processed += 1;

            if (activeUserIds.has(job.userId)) {
                logger.warn(
                    'Skipping media cleanup for still-active user and removing stale queue entry',
                    { userId: job.userId, jobId: job.id }
                );
                await prisma.pendingMediaCleanup.delete({
                    where: { id: job.id },
                });
                summary.skipped += 1;
                continue;
            }

            let cloudinaryDone = job.cloudinaryDone;
            let r2Done = job.r2Done;
            const errors: string[] = [];

            if (!cloudinaryDone) {
                const cloudResult = await deleteUserPrefixFromCloudinary(
                    job.userId
                );
                summary.cloudinaryDeleted += cloudResult.deletedCount;
                if (cloudResult.completed) {
                    cloudinaryDone = true;
                } else if (cloudResult.error) {
                    errors.push(`cloudinary: ${cloudResult.error}`);
                }
            }

            if (!r2Done) {
                const r2Result = await deleteUserPrefixFromR2(job.userId);
                summary.r2Deleted += r2Result.deletedCount;
                if (r2Result.completed) {
                    r2Done = true;
                } else if (r2Result.error) {
                    errors.push(`r2: ${r2Result.error}`);
                }
            }

            if (cloudinaryDone && r2Done) {
                await prisma.pendingMediaCleanup.delete({
                    where: { id: job.id },
                });
                summary.completed += 1;
            } else {
                await prisma.pendingMediaCleanup.update({
                    where: { id: job.id },
                    data: {
                        cloudinaryDone,
                        r2Done,
                        attempts: { increment: 1 },
                        lastError:
                            errors.length > 0
                                ? errors.join('; ').slice(0, 500)
                                : null,
                    },
                });
                summary.pending += 1;
            }
        }

        logger.info('Completed pending media cleanup outbox run', summary);
        return summary;
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error('Error processing pending media cleanup outbox', {
            error: errorMessage,
        });
        return summary;
    }
}
