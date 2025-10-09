import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents } from '@/app/utils/event-utils';
import { internalServerError } from '@/app/utils/apiErrors';
import { logger, withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (request: NextRequest) => {
    try {
        logger.info('GET /api/events - start');
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'en';
        const validLanguages = ['en', 'es', 'ca'];
        const language = validLanguages.includes(lang) ? lang : 'en';
        const events = await getAllEvents(language);
        logger.info('GET /api/events - success', {
            language,
            count: events.length,
        });
        return NextResponse.json(events);
    } catch (error: any) {
        logger.error('GET /api/events - error', { error: error.message });
        return internalServerError('Failed to fetch events');
    }
});
