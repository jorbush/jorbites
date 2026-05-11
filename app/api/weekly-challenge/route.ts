import { NextResponse } from 'next/server';
import { getCurrentChallenge, rotateWeeklyChallenge } from '@/app/lib/weekly-challenge';
import { logger } from '@/app/lib/axiom/server';
import { internalServerError, notFound, unauthorized } from '@/app/utils/apiErrors';

export async function GET() {
    try {
        logger.info('api/weekly-challenge GET - start');
        const challenge = await getCurrentChallenge();

        if (!challenge) {
            logger.info('api/weekly-challenge GET - no active challenge found');
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

        // Check for CRON_SECRET authorization
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = request.headers.get('Authorization');

        if (!cronSecret) {
            logger.error('api/weekly-challenge POST - CRON_SECRET not configured');
            return internalServerError('CRON_SECRET not configured');
        }

        if (!authHeader) {
            logger.error('api/weekly-challenge POST - missing Authorization header');
            return unauthorized('Missing Authorization header');
        }

        const [scheme, token] = authHeader.trim().split(/\s+/);
        if (scheme.toLowerCase() !== 'bearer' || token !== cronSecret) {
            logger.error('api/weekly-challenge POST - invalid token or scheme');
            return unauthorized('Invalid token or scheme');
        }

        const challenge = await rotateWeeklyChallenge();

        logger.info('api/weekly-challenge POST - success', {
            challengeId: challenge.id,
        });
        return NextResponse.json(challenge);
    } catch (error: any) {
        logger.error('api/weekly-challenge POST - error', {
            error: error.message,
        });
        return internalServerError('Failed to rotate weekly challenge');
    }
}
