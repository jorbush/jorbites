import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { DraftService } from '@/app/services/draftService';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const draftId = url.searchParams.get('draft');
        const token = url.searchParams.get('token');

        if (!draftId || !token) {
            return NextResponse.redirect(
                new URL('/?error=invalid_invite_link', request.url)
            );
        }

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            const redirectUrl = `/api/draft/join?draft=${draftId}&token=${token}`;
            return NextResponse.redirect(
                new URL(
                    `/login?callbackUrl=${encodeURIComponent(redirectUrl)}`,
                    request.url
                )
            );
        }

        const result = await DraftService.joinSharedDraft(
            draftId,
            token,
            currentUser
        );

        if (!result.success) {
            logger.warn('GET /api/draft/join - failed', {
                draftId,
                error: result.error,
            });
            return NextResponse.redirect(
                new URL(`/?error=${result.error}`, request.url)
            );
        }

        logger.info('GET /api/draft/join - success', {
            draftId,
            userId: currentUser.id,
        });

        return NextResponse.redirect(
            new URL(`/?draft=${draftId}&joined=true`, request.url)
        );
    } catch (error: any) {
        logger.error('GET /api/draft/join - error', { error: error.message });
        return NextResponse.redirect(
            new URL('/?error=failed_to_join_draft', request.url)
        );
    }
}
