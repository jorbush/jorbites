import { NextResponse } from 'next/server';
import { processPendingBadgeEvaluations } from '@/app/lib/questOutbox';
import { logger } from '@/app/lib/axiom/server';
import {
    unauthorizedResponse,
    internalServerError,
} from '@/app/utils/apiErrors';

export async function GET(request: Request) {
    return handleOutbox(request);
}

export async function POST(request: Request) {
    return handleOutbox(request);
}

async function handleOutbox(request: Request) {
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

        if (!providedToken || providedToken !== cronSecret) {
            return unauthorizedResponse(
                'Invalid cron/outbox authorization key'
            );
        }

        const result = await processPendingBadgeEvaluations();
        logger.info('GET/POST /api/quests/outbox executed', result);

        return NextResponse.json({
            status: 'success',
            processed: result.processed,
            succeeded: result.succeeded,
        });
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error('Error in /api/quests/outbox', { error: errorMessage });
        return internalServerError('Failed to process quest outbox');
    }
}
