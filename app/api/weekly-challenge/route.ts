import { NextResponse } from 'next/server';
import {
    fetchCurrentChallenge,
    generateNewChallenge,
} from '@/app/lib/weekly-challenge';
import { logger } from '@/app/lib/axiom/server';
import { internalServerError, notFound, unauthorized } from '@/app/utils/apiErrors';

export async function GET() {
    try {
        logger.info('api/weekly-challenge GET - start');
        const challenge = await fetchCurrentChallenge();

        if (!challenge) {
            logger.info('api/weekly-challenge GET - not found');
            return notFound('No active weekly challenge found');
        }

        logger.info('api/weekly-challenge GET - success', {
            challengeId: challenge.id,
        });
        return NextResponse.json(challenge);
    } catch (error: any) {
        logger.error('api/weekly-challenge GET - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch weekly challenge');
    }
}

export async function POST(request: Request) {
    try {
        logger.info('api/weekly-challenge POST - start');

        // Check for authorization
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            logger.error('api/weekly-challenge POST - unauthorized');
            return unauthorized('Invalid or missing CRON_SECRET');
        }

        const challenge = await generateNewChallenge();

        logger.info('api/weekly-challenge POST - success', {
            challengeId: challenge.id,
        });
        return NextResponse.json(challenge);
    } catch (error: any) {
        logger.error('api/weekly-challenge POST - error', {
            error: error.message,
        });
        return internalServerError('Failed to generate weekly challenge');
    }
}
