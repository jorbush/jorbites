import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { DraftService } from '@/app/services/draftService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const draftId = searchParams.get('draft');
        const token = searchParams.get('token');

        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (request.headers.get('origin') ?? 'http://localhost:3000');

        if (!draftId || !token) {
            return NextResponse.redirect(
                `${baseUrl}/?error=invalid_invite_link`
            );
        }

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            const redirectUrl = `${baseUrl}/api/draft/join?draft=${draftId}&token=${token}`;
            return NextResponse.redirect(
                `${baseUrl}/login?callbackUrl=${encodeURIComponent(redirectUrl)}`
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
            return NextResponse.redirect(`${baseUrl}/?error=${result.error}`);
        }

        logger.info('GET /api/draft/join - success', {
            draftId,
            userId: currentUser.id,
        });

        return NextResponse.redirect(
            `${baseUrl}/recipes/new?draft=${draftId}&joined=true`
        );
    } catch (error: any) {
        logger.error('GET /api/draft/join - error', { error: error.message });
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (request.headers.get('origin') ?? 'http://localhost:3000');
        return NextResponse.redirect(`${baseUrl}/?error=failed_to_join_draft`);
    }
}
