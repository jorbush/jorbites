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
import { CoCookRole } from '@/app/types/draft';

export async function PATCH(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to update collaborator role'
            );
        }

        const body = await request.json().catch(() => ({}));
        const draftId = body.draftId;
        const targetUserId = body.userId || body.targetUserId;
        const role = body.role;

        if (!draftId || !targetUserId || !role) {
            return badRequest('draftId, userId, and role are required');
        }

        if (role !== 'editor' && role !== 'viewer') {
            return badRequest('Role must be either editor or viewer');
        }

        try {
            const updatedDraft = await DraftService.updateCoCookRole(
                draftId,
                targetUserId,
                role as CoCookRole,
                currentUser
            );

            logger.info('PATCH /api/draft/role - success', {
                draftId,
                targetUserId,
                role,
                updatedBy: currentUser.id,
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
            if (message === 'ONLY_OWNER_CAN_MANAGE_ROLES') {
                return forbiddenResponse(
                    'Only the draft owner can update collaborator roles'
                );
            }
            if (message === 'CANNOT_CHANGE_OWNER_ROLE') {
                return badRequest('Cannot change the role of the draft owner');
            }
            if (message === 'USER_NOT_A_CO_COOK') {
                return badRequest('User is not a collaborator on this draft');
            }
            if (message === 'INVALID_ROLE') {
                return badRequest('Invalid role specified');
            }
            if (message === 'DRAFT_NOT_FOUND') {
                return notFoundResponse('Draft not found');
            }
            throw err;
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error('PATCH /api/draft/role - error', { error: message });
        return internalServerError('Failed to update collaborator role');
    }
}
