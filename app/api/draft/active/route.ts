import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { DraftService } from '@/app/services/draftService';
import { SharedDraft } from '@/app/types/draft';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to get active drafts'
            );
        }

        const draftIds = await DraftService.getUserDraftIds(currentUser.id);
        const activeDrafts: SharedDraft[] = [];
        const staleDraftIds: string[] = [];

        const drafts = await Promise.all(
            draftIds.map((id) =>
                DraftService.getSharedDraft(id, currentUser.id)
            )
        );

        for (let i = 0; i < draftIds.length; i++) {
            const draft = drafts[i];
            const draftId = draftIds[i];

            if (draft) {
                activeDrafts.push(draft);
            } else {
                staleDraftIds.push(draftId);
            }
        }

        // Lazy cleanup of stale draft IDs
        if (staleDraftIds.length > 0) {
            await Promise.all(
                staleDraftIds.map((id) =>
                    DraftService.removeFromUserDrafts(currentUser.id, id)
                )
            );
        }

        logger.info('GET /api/draft/active - success', {
            userId: currentUser.id,
            count: activeDrafts.length,
        });

        return NextResponse.json(activeDrafts);
    } catch (error: any) {
        logger.error('GET /api/draft/active - error', { error: error.message });
        return internalServerError('Failed to retrieve active drafts');
    }
}
