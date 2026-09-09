import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    forbiddenResponse,
    badRequest,
    notFoundResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { DraftService } from '@/app/services/draftService';

export async function DELETE(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to remove collaborator'
            );
        }

        let draftId: string | null = null;
        let targetUserId: string | null = null;

        const url = new URL(request.url);
        draftId =
            url.searchParams.get('draftId') || url.searchParams.get('draft');
        targetUserId = url.searchParams.get('userId');

        if (!draftId || !targetUserId) {
            const body = await request.json().catch(() => ({}));
            draftId = draftId || body.draftId || body.draft;
            targetUserId = targetUserId || body.userId;
        }

        if (!draftId || !targetUserId) {
            return badRequest('draftId and userId are required');
        }

        try {
            const updatedDraft = await DraftService.removeCollaborator(
                draftId,
                targetUserId,
                currentUser
            );

            logger.info('DELETE /api/draft/collaborator - success', {
                draftId,
                targetUserId,
                removedBy: currentUser.id,
            });

            const responseDraft =
                currentUser.id === updatedDraft.ownerId
                    ? updatedDraft
                    : DraftService.maskSharedDraft(updatedDraft);

            return NextResponse.json({
                success: true,
                draft: responseDraft,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message === 'UNAUTHORIZED_COLLABORATOR_REMOVAL') {
                return forbiddenResponse(
                    'You are not authorized to remove this collaborator'
                );
            }
            if (message === 'CANNOT_REMOVE_OWNER') {
                return badRequest('The draft owner cannot be removed');
            }
            if (message === 'DRAFT_NOT_FOUND') {
                return notFoundResponse('Draft not found');
            }
            throw err;
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error('DELETE /api/draft/collaborator - error', {
            error: message,
        });
        return internalServerError('Failed to remove collaborator');
    }
}
