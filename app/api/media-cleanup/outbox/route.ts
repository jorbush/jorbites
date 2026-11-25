import { NextResponse } from 'next/server';
import { processPendingMediaCleanups } from '@/app/lib/mediaCleanupOutbox';
import { logger } from '@/app/lib/axiom/server';
import {
    unauthorizedResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { safeCompareSecret } from '@/app/utils/cryptoUtils';

export async function GET(request: Request) {
    return handleMediaCleanupOutbox(request);
}

export async function POST(request: Request) {
    return handleMediaCleanupOutbox(request);
}

async function handleMediaCleanupOutbox(request: Request) {
    try {
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            logger.error('CRON_SECRET is not configured on server');
            return internalServerError('CRON_SECRET is not configured');
        }

        const authHeader = request.headers.get('authorization');
        const apiKeyHeader = request.headers.get('x-api-key');

        let providedToken: string | null = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            providedToken = authHeader.slice(7).trim();
        } else if (apiKeyHeader) {
            providedToken = apiKeyHeader.trim();
        }

        if (!safeCompareSecret(providedToken, cronSecret)) {
            return unauthorizedResponse(
                'Invalid cron/outbox authorization key'
            );
        }

        const result = await processPendingMediaCleanups();
        logger.info('GET/POST /api/media-cleanup/outbox executed', result);

        return NextResponse.json({
            status: 'success',
            processed: result.processed,
            completed: result.completed,
            pending: result.pending,
            cloudinaryDeleted: result.cloudinaryDeleted,
            r2Deleted: result.r2Deleted,
        });
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error('Error in /api/media-cleanup/outbox', {
            error: errorMessage,
        });
        return internalServerError('Failed to process media cleanup outbox');
    }
}
