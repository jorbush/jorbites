import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents } from '@/app/utils/event-utils';

export async function GET(request: NextRequest) {
    // Get the language from query parameter, default to 'en'
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'en';

    // Validate language
    const validLanguages = ['en', 'es', 'ca'];
    const language = validLanguages.includes(lang) ? lang : 'en';

    // Get events for the requested language
    const events = await getAllEvents(language);

    return NextResponse.json(events);
}
