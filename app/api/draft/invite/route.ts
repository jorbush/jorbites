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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

        // Check if existing draft belongs to another owner
        let existing = await DraftService.getSharedDraft(draftId);
        if (
            existing &&
            existing.ownerId &&
            existing.ownerId !== currentUser.id
        ) {
            return forbiddenResponse(
                'Only the draft owner can generate invite links'
            );
        }

        // If not a shared draft yet, check if it's an existing solo draft belonging to the user
        if (!existing && body.draftId) {
            const soloDraft = await DraftService.getSingleUserDraft(
                currentUser.id,
                draftId
            );
            if (soloDraft) {
                existing = soloDraft as any;
                await DraftService.deleteSingleUserDraft(
                    currentUser.id,
                    draftId
                );
            }
        }

        const host = request.headers.get('host');
        const origin = request.headers.get('origin');
        const hostUrl = host ? `https://${host}` : null;
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            origin ||
            hostUrl ||
            'http://localhost:3000';

        const shouldRegenerate = Boolean(body.regenerate);
        if (shouldRegenerate && existing) {
            const regenerated = await DraftService.regenerateInviteToken(
                draftId,
                currentUser,
                baseUrl
            );
            logger.info('POST /api/draft/invite - regenerated token', {
                draftId,
                userId: currentUser.id,
            });
            return NextResponse.json({
                draftId,
                inviteToken: regenerated.inviteToken,
                shareUrl: regenerated.shareUrl,
                draft: regenerated.draft,
            });
        }

        const inviteToken =
            existing?.inviteToken || crypto.randomBytes(16).toString('hex');

        const savedDraft = await DraftService.saveSharedDraft(
            draftId,
            {
                ...existing,
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
