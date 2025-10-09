import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents } from '@/app/utils/event-utils';
import { internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'en';

        logger.info('GET /api/events - start', { lang });
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
}
