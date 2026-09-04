import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { DraftService } from '@/app/services/draftService';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to get active drafts'
            );
        }

        const activeDrafts = await DraftService.getAllUserDrafts(
            currentUser.id
        );

        logger.info('GET /api/draft/active - success', {
            userId: currentUser.id,
            count: activeDrafts.length,
        });

        return NextResponse.json(activeDrafts);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error('GET /api/draft/active - error', { error: message });
        return internalServerError('Failed to retrieve active drafts');
    }
}
