import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/app/utils/event-utils';
import { notFound, internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    slug: string;
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const { slug } = params;
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'en';

        logger.info('GET /api/events/[slug] - start', { slug, lang });
        const validLanguages = ['en', 'es', 'ca'];
        const language = validLanguages.includes(lang) ? lang : 'en';
        const event = await getEventBySlug(slug, language);
        if (!event) {
            logger.info('GET /api/events/[slug] - event not found', {
                slug,
            });
            return notFound('Event not found');
        }
        logger.info('GET /api/events/[slug] - success', { slug, language });
        return NextResponse.json(event);
    } catch (error: any) {
        logger.error('GET /api/events/[slug] - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch event');
    }
}
