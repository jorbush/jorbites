import { NextResponse } from 'next/server';
import { getCurrentChallenge } from '@/app/actions/weekly-challenge';
import { logger } from '@/app/lib/axiom/server';

export async function GET() {
    try {
        logger.info('api/weekly-challenge GET - start');
        const challenge = await getCurrentChallenge();
        logger.info('api/weekly-challenge GET - success', {
            challengeId: challenge.id,
        });
        return NextResponse.json(challenge);
    } catch (error: any) {
        logger.error('api/weekly-challenge GET - error', {
            error: error.message,
        });
        return NextResponse.json(
            { error: 'Failed to fetch weekly challenge' },
            { status: 500 }
        );
    }
}
