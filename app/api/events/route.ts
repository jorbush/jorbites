import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents } from '@/app/utils/event-utils';
import { internalServerError } from '@/app/utils/apiErrors';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'en';
        const validLanguages = ['en', 'es', 'ca'];
        const language = validLanguages.includes(lang) ? lang : 'en';
        const events = await getAllEvents(language);
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return internalServerError('Failed to fetch events');
    }
}
