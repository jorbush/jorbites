import { NextResponse } from 'next/server';
import crypto from 'crypto';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    forbiddenResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { DraftService } from '@/app/services/draftService';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to generate invite link'
            );
        }

        const body = await request.json().catch(() => ({}));
        const draftId = body.draftId || crypto.randomUUID();
        const inviteToken =
            body.inviteToken || crypto.randomBytes(16).toString('hex');

        // Check if existing draft belongs to another owner
        const existing = await DraftService.getSharedDraft(draftId);
        if (
            existing &&
            existing.ownerId &&
            existing.ownerId !== currentUser.id
        ) {
            return forbiddenResponse(
                'Only the draft owner can generate invite links'
            );
        }

        const savedDraft = await DraftService.saveSharedDraft(
            draftId,
            {
                ...body,
                draftId,
                inviteToken,
            },
            currentUser
        );

        logger.info('POST /api/draft/invite - success', {
            draftId,
            userId: currentUser.id,
        });

        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (request.headers.get('origin') ?? 'http://localhost:3000');
        const shareUrl = `${baseUrl}/recipes/new?draft=${draftId}&token=${inviteToken}`;

        return NextResponse.json({
            draftId,
            inviteToken,
            shareUrl,
            draft: savedDraft,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error('POST /api/draft/invite - error', {
            error: message,
        });
        return internalServerError('Failed to generate invite link');
    }
}
